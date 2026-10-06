"use client";
import { Fragment, useState } from "react";
import type { Product } from "@/lib/types";
import type { AdminReview, ContactMessage } from "@/lib/reviews";
import type { AdminCustomer } from "@/lib/customers";
import type { AdminActivity, AdminStats } from "@/lib/admin-stats";
import { nextShipmentStage } from "@/lib/shipment-stages";
import { formatINR } from "@/lib/money";

interface AdminOrder {
  id: string; public_id: string; created_at: string; customer_name?: string | null; email?: string | null;
  total_paise: number; payment_status: string; fulfillment_status: string;
  tracking_number?: string | null; tracking_url?: string | null;
}

const nextStageLabel = (status: string): string | null => {
  const next = nextShipmentStage(status);
  return next ? next.replaceAll("_", " ") : null;
};

const FAMILY_OPTIONS = ["Woody", "Floral", "Amber", "Fresh", "Gourmand", "Smoky"] as const;

const priceRange = (product: Product): string => {
  const prices = product.variants.map((variant) => variant.pricePaise).sort((a, b) => a - b);
  if (!prices.length) return "—";
  const low = formatINR(prices[0]);
  const high = formatINR(prices[prices.length - 1]);
  return low === high ? low : `${low} – ${high}`;
};

export function AdminDashboard({ products, orders, reviews, messages, customers, stats, activity, demo }: { products: Array<Product & { active?: boolean }>; orders: AdminOrder[]; reviews: AdminReview[]; messages: ContactMessage[]; customers: AdminCustomer[]; stats: AdminStats; activity: AdminActivity[]; demo: boolean }) {
  const [notice, setNotice] = useState(demo ? "Demo mode: commerce editing is read-only. Reviews, the contact inbox and the customer list are active." : "");
  const [editing, setEditing] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  async function send(url: string, body: unknown): Promise<boolean> {
    const response = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { setNotice(data.error || "Update failed"); return false; }
    location.reload();
    return true;
  }

  function toggleVariant(id: string, current: boolean) { void send("/api/admin/products", { entity: "variant", id, patch: { is_active: !current } }); }
  function moderate(id: string, action: "publish" | "hide") { void send("/api/admin/reviews", { id, action }); }
  function inbox(id: string, action: "read" | "archive") { void send("/api/admin/messages", { id, action }); }

  function saveVariant(id: string) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const rupees = (name: string): number | null => {
        const raw = String(form.get(name) || "").trim();
        if (!raw) return null;
        return Math.round(Number(raw) * 100);
      };
      const stockRaw = String(form.get("stock") || "").trim();
      const patch: Record<string, unknown> = {
        label: String(form.get("label") || "").trim(),
        price_paise: rupees("price"),
        compare_at_paise: rupees("compare"),
        stock_quantity: stockRaw === "" ? null : Math.round(Number(stockRaw)),
        preferred_fulfillment_provider: String(form.get("provider") || "manual"),
      };
      if (patch.price_paise === null || Number.isNaN(patch.price_paise as number)) { setNotice("Price is required."); return; }
      if (Number.isNaN(patch.stock_quantity as number)) { setNotice("Stock must be a number."); return; }
      void send("/api/admin/products", { entity: "variant", id, patch });
    };
  }

  function saveProduct(id: string) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const text = (name: string): string => String(form.get(name) || "").trim();
      const lines = (name: string): string[] => String(form.get(name) || "").split("\n").map((line) => line.trim()).filter(Boolean);
      if (!text("name")) { setNotice("Product name is required."); return; }
      void send("/api/admin/products", { entity: "product", id, patch: {
        name: text("name"),
        eyebrow: text("eyebrow"),
        family: text("family"),
        concentration: text("concentration"),
        short_description: text("short_description"),
        description: text("description"),
        notes: { top: lines("notes_top"), heart: lines("notes_heart"), base: lines("notes_base") },
        image_url: text("image_url"),
        image_alt: text("image_alt"),
        featured: form.get("featured") === "on",
        is_active: form.get("visible") === "on"
      } });
    };
  }

  function dispatch(orderId: string) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      void send("/api/admin/orders", { orderId, action: "dispatch", trackingNumber: String(form.get("tracking") || ""), trackingUrl: String(form.get("trackingUrl") || ""), estimatedDelivery: String(form.get("eta") || "") });
    };
  }

  const catalogue = products.filter((product) => !product.isDiscoverySet);
  const pending = reviews.filter((review) => review.status === "pending").length;
  const fresh = messages.filter((message) => message.status === "new").length;

  return <div className="admin-dashboard">
    <header><div><p className="kicker">Operations console</p><h1>Store control,<br/><em>without clutter.</em></h1></div><span className={`env-pill ${demo ? "demo" : "live"}`}>{demo ? "demo mode" : "connected"}</span></header>
    {notice ? <p className="admin-notice">{notice}</p> : null}
    <div className="admin-kpis">
      <div><span>Revenue · today</span><strong>{formatINR(stats.revenueTodayPaise)}</strong></div>
      <div><span>Revenue · 7 days</span><strong>{formatINR(stats.revenue7Paise)}</strong><small>{stats.paid30 ? stats.paid30 + " paid · 30d" : "no paid orders yet"}</small></div>
      <div><span>Revenue · 30 days</span><strong>{formatINR(stats.revenue30Paise)}</strong><small>{stats.aovPaise ? "avg order " + formatINR(stats.aovPaise) : ""}</small></div>
      <div><span>Orders · 30 days</span><strong>{stats.orders30}</strong><small>{stats.delivered30} delivered</small></div>
      <div><span>Catalogue</span><strong>{catalogue.length}</strong><small>{products.reduce((sum, product) => sum + product.variants.length, 0)} SKUs</small></div>
    </div>
    <div className="admin-attention">
      <a href="#admin-orders" className={stats.awaitingDispatch ? "hot" : ""}><b>{stats.awaitingDispatch}</b><span>awaiting dispatch</span></a>
      <a href="#admin-orders"><b>{stats.inTransit}</b><span>in transit</span></a>
      <a href="#admin-catalogue" className={stats.soldOut ? "hot" : ""}><b>{stats.soldOut}</b><span>sold out</span></a>
      <a href="#admin-catalogue" className={stats.lowStock ? "hot" : ""}><b>{stats.lowStock}</b><span>low stock</span></a>
      <a href="#admin-reviews" className={pending ? "hot" : ""}><b>{pending}</b><span>reviews pending</span></a>
      <a href="#admin-inbox" className={fresh ? "hot" : ""}><b>{fresh}</b><span>new messages</span></a>
      <a href="#admin-customers"><b>{stats.newCustomers7}</b><span>new customers · 7d</span></a>
    </div>

    <section className="admin-section">
      <div className="admin-section-title"><p className="kicker">Log</p><h2>Recent activity</h2></div>
      {activity.length ? <ul className="admin-feed">{activity.map((entry) => <li key={entry.id}><b>{entry.action.replaceAll("_", " ")}</b><span>{entry.entityType}</span><small>{entry.actor || "—"} · {new Date(entry.createdAt).toLocaleString("en-IN")}</small></li>)}</ul> : <p className="account-empty">No admin actions logged yet.</p>}
    </section>

    <section className="admin-section" id="admin-catalogue">
      <div className="admin-section-title"><p className="kicker">Catalogue</p><h2>Products & pricing</h2></div>
      <div className="admin-table">
        <div className="admin-row admin-head admin-row-catalogue"><span>Product / SKU</span><span>Format</span><span>Price</span><span>Stock</span><span>Status</span><span>Edit</span></div>
        {products.map((product) => <Fragment key={product.id}>
          <div className="admin-row admin-row-catalogue admin-product-row">
            <span><b>{product.name}</b><small>{product.slug}{product.isDiscoverySet ? " · discovery set" : ""}</small></span>
            <span>{product.family}<small>{product.concentration}</small></span>
            <span>{priceRange(product)}</span>
            <span>—</span>
            <span className="admin-chips">{product.featured ? <i className="status-on">featured</i> : null}{product.active === false ? <i className="status-off">hidden</i> : null}</span>
            <span><button className="status-on" disabled={demo} onClick={() => setEditingProduct(editingProduct === product.id ? null : product.id)}>{editingProduct === product.id ? "close" : "edit product"}</button></span>
          </div>
          {editingProduct === product.id ? <form className="admin-edit-product" onSubmit={saveProduct(product.id)}>
            <label>Name<input name="name" defaultValue={product.name} maxLength={80} disabled={demo}/></label>
            <label>Eyebrow<input name="eyebrow" defaultValue={product.eyebrow} maxLength={140} disabled={demo}/></label>
            <label>Family<select name="family" defaultValue={product.family} disabled={demo}>{FAMILY_OPTIONS.map((family) => <option key={family} value={family}>{family}</option>)}</select></label>
            <label>Concentration<input name="concentration" defaultValue={product.concentration} maxLength={80} disabled={demo}/></label>
            <label className="wide">Short description<textarea name="short_description" rows={2} maxLength={300} defaultValue={product.shortDescription} disabled={demo}/></label>
            <label className="wide">Description<textarea name="description" rows={5} maxLength={4000} defaultValue={product.description} disabled={demo}/></label>
            <label className="wide">Top notes · one per line<textarea name="notes_top" rows={2} defaultValue={product.notes.top.join("\n")} disabled={demo}/></label>
            <label className="wide">Heart notes · one per line<textarea name="notes_heart" rows={2} defaultValue={product.notes.heart.join("\n")} disabled={demo}/></label>
            <label className="wide">Base notes · one per line<textarea name="notes_base" rows={2} defaultValue={product.notes.base.join("\n")} disabled={demo}/></label>
            <label>Main image path<input name="image_url" maxLength={300} defaultValue={product.image} disabled={demo}/></label>
            <label>Image alt text<input name="image_alt" maxLength={240} defaultValue={product.imageAlt} disabled={demo}/></label>
            <div className="admin-edit-checks wide">
              <label className="admin-check"><input type="checkbox" name="featured" defaultChecked={product.featured} disabled={demo}/>Featured on home</label>
              <label className="admin-check"><input type="checkbox" name="visible" defaultChecked={product.active !== false} disabled={demo}/>Visible in the shop</label>
              <span className="admin-edit-note">slug {product.slug} stays fixed</span>
              <button className="status-on" type="submit" disabled={demo}>Save product</button>
            </div>
          </form> : null}
          {product.variants.map((variant) => <Fragment key={variant.id}>
          <div className="admin-row admin-row-catalogue">
            <span><b>{product.name}</b><small>{variant.sku}</small></span>
            <span>{variant.label}</span>
            <span>{formatINR(variant.pricePaise)}{variant.compareAtPaise ? <small><s>{formatINR(variant.compareAtPaise)}</s></small> : null}</span>
            <span>{variant.stockQuantity == null ? "—" : variant.stockQuantity === 0 ? <i className="status-off">sold out</i> : variant.stockQuantity}</span>
            <span><button disabled={demo} onClick={() => toggleVariant(variant.id, variant.available)} className={variant.available ? "status-on" : "status-off"}>{variant.available ? "active" : "off"}</button></span>
            <span><button disabled={demo} className="status-on" onClick={() => setEditing(editing === variant.id ? null : variant.id)}>{editing === variant.id ? "close" : "edit"}</button></span>
          </div>
          {editing === variant.id ? <form className="admin-edit" onSubmit={saveVariant(variant.id)}>
            <label>Label<input name="label" defaultValue={variant.label} disabled={demo}/></label>
            <label>Price ₹<input name="price" inputMode="decimal" defaultValue={(variant.pricePaise / 100).toFixed(2)} disabled={demo}/></label>
            <label>Compare-at ₹<input name="compare" inputMode="decimal" defaultValue={variant.compareAtPaise ? (variant.compareAtPaise / 100).toFixed(2) : ""} placeholder="none" disabled={demo}/></label>
            <label>Stock<input name="stock" inputMode="numeric" defaultValue={variant.stockQuantity ?? ""} placeholder="untracked" disabled={demo}/></label>
            <label>Provider<select name="provider" defaultValue={variant.preferredFulfillmentProvider || "manual"} disabled={demo}><option value="manual">manual · India Post</option><option value="shiprocket">shiprocket</option><option value="amazon_mcf">amazon_mcf</option></select></label>
            <button className="status-on" type="submit" disabled={demo}>Save</button>
          </form> : null}
          </Fragment>)}
        </Fragment>)}
      </div>
    </section>

    <section className="admin-section" id="admin-orders">
      <div className="admin-section-title"><p className="kicker">Operations</p><h2>Orders & delivery</h2></div>
      {orders.length ? <div className="admin-table">
        <div className="admin-row admin-head"><span>Order</span><span>Customer</span><span>Total</span><span>Payment</span><span>Fulfillment</span></div>
        {orders.map((order) => {
          const next = nextStageLabel(order.fulfillment_status);
          const canDispatch = order.payment_status === "paid" && (order.fulfillment_status === "unfulfilled" || order.fulfillment_status === "processing");
          return <div className="admin-row" key={order.id}>
            <span><b>{order.public_id}</b><small>{new Date(order.created_at).toLocaleString("en-IN")}</small></span>
            <span>{order.customer_name}<small>{order.email}</small></span>
            <span>{formatINR(order.total_paise)}</span>
            <span>{order.payment_status}</span>
            <span className="admin-fulfil">
              <i className={order.fulfillment_status === "delivered" ? "status-on" : "status-off"}>{order.fulfillment_status.replaceAll("_", " ")}</i>
              {order.tracking_number ? <small># {order.tracking_number}</small> : null}
              {canDispatch ? <form className="admin-dispatch" onSubmit={dispatch(order.id)}>
                <input name="tracking" placeholder="India Post tracking no." disabled={demo} required minLength={4}/>
                <input name="trackingUrl" placeholder="tracking URL (optional)" disabled={demo}/>
                <input name="eta" type="date" disabled={demo} aria-label="Estimated delivery"/>
                <button className="status-on" type="submit" disabled={demo}>Mark dispatched</button>
              </form> : null}
              {next ? <button className="status-on" disabled={demo} onClick={() => void send("/api/admin/orders", { orderId: order.id, action: "advance_status" })}>Advance → {next}</button> : null}
            </span>
          </div>;
        })}
      </div> : <p className="account-empty">No database orders in this environment.</p>}
    </section>

    <section className="admin-section" id="admin-reviews">
      <div className="admin-section-title"><p className="kicker">Content</p><h2>Reviews moderation</h2></div>
      {reviews.length ? <div className="admin-table">
        <div className="admin-row admin-head"><span>Reviewer</span><span>Rating</span><span>Review</span><span>Scent</span><span>Status</span></div>
        {reviews.map((review) => <div className="admin-row" key={review.id}>
          <span><b>{review.author_name}</b><small>{new Date(review.created_at).toLocaleString("en-IN")}</small></span>
          <span>{review.rating} / 5</span>
          <span title={review.title ? `${review.title} — ${review.body}` : review.body}>{review.title ? <b>{review.title} — </b> : null}{review.body.length > 90 ? review.body.slice(0, 90) + "…" : review.body}</span>
          <span>{review.product_id.replace("prod_", "")}</span>
          <span>{review.status === "pending" ? <><button onClick={() => moderate(review.id, "publish")} className="status-on">publish</button> <button onClick={() => moderate(review.id, "hide")} className="status-off">hide</button></> : <><i className={review.status === "published" ? "status-on" : "status-off"}>{review.status}</i> {review.status === "published" ? <button onClick={() => moderate(review.id, "hide")} className="status-off">hide</button> : <button onClick={() => moderate(review.id, "publish")} className="status-on">publish</button>}</>}</span>
        </div>)}
      </div> : <p className="account-empty">No reviews yet — published reviews appear on the product page, pending ones wait here.</p>}
    </section>

    <section className="admin-section" id="admin-inbox">
      <div className="admin-section-title"><p className="kicker">Inbox</p><h2>Contact messages</h2></div>
      {messages.length ? <div className="admin-table">
        <div className="admin-row admin-head"><span>From</span><span>Contact</span><span>Message</span><span>When</span><span>Status</span></div>
        {messages.map((message) => <div className="admin-row" key={message.id}>
          <span><b>{message.name}</b>{message.product_id ? <small>{message.product_id.replace("prod_", "")}</small> : null}</span>
          <span>{message.email}<small>{message.phone || ""}</small></span>
          <span title={message.message}>{message.message.length > 90 ? message.message.slice(0, 90) + "…" : message.message}</span>
          <span>{new Date(message.created_at).toLocaleDateString("en-IN")}</span>
          <span>{message.status === "new" ? <><button onClick={() => inbox(message.id, "read")} className="status-on">read</button> <button onClick={() => inbox(message.id, "archive")} className="status-off">archive</button></> : <><i className={message.status === "read" ? "status-on" : "status-off"}>{message.status}</i> {message.status === "read" ? <button onClick={() => inbox(message.id, "archive")} className="status-off">archive</button> : <button onClick={() => inbox(message.id, "read")} className="status-on">restore</button>}</>}</span>
        </div>)}
      </div> : <p className="account-empty">Inbox empty.</p>}
    </section>

    <section className="admin-section" id="admin-customers">
      <div className="admin-section-title"><p className="kicker">People</p><h2>Customers</h2></div>
      {customers.length ? <div className="admin-table">
        <div className="admin-row admin-head"><span>Customer</span><span>Email</span><span>Joined</span><span>Orders</span><span>Spent</span></div>
        {customers.map((customer) => <div className="admin-row" key={customer.id}>
          <span><b>{customer.fullName || "—"}</b><small>{customer.role}</small></span>
          <span>{customer.email}<small>{customer.phone || ""}</small></span>
          <span>{new Date(customer.createdAt).toLocaleDateString("en-IN")}</span>
          <span>{customer.orders}</span>
          <span>{formatINR(customer.spentPaise)}</span>
        </div>)}
      </div> : <p className="account-empty">No customers yet.</p>}
    </section>
  </div>;
}
