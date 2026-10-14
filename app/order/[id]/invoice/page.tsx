import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { readOrderForAdmin, readOrderForGuest } from "@/lib/order-service";
import { formatINR } from "@/lib/money";
import { INVOICE_SELLER, formatIstDateTime } from "@/lib/invoice";
import { InvoiceActions } from "@/components/order/InvoiceActions";

export const metadata: Metadata = {
  title: { absolute: "Order receipt — Relapse Perfumes" },
  robots: { index: false, follow: false }
};

interface Address { name?: string; phone?: string; email?: string; addressLine1?: string; addressLine2?: string; city?: string; state?: string; postalCode?: string; }
interface OrderItem { id: string; product_name: string; variant_label: string; sku: string; quantity: number; unit_price_paise: number; line_total_paise: number; }
interface FullOrder {
  public_id: string; created_at: string; customer_name: string; email: string; phone: string;
  shipping_address: Address; subtotal_paise: number; shipping_paise: number; discount_paise: number;
  credit_applied_paise: number; total_paise: number; payment_status: string; payment_id?: string | null;
  payment_provider?: string | null; paid_at?: string | null; fulfillment_status: string;
  tracking_number?: string | null; tracking_url?: string | null; order_items?: OrderItem[];
}

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const search = await searchParams;
  const publicId = decodeURIComponent(id);
  const token = typeof search.token === "string" ? search.token : "";

  const adminActor = await requireAdmin();
  const order = adminActor ? await readOrderForAdmin(publicId) as FullOrder | null : token ? await readOrderForGuest(publicId, token) as FullOrder | null : null;

  if (!order) {
    return <div className="forbidden section-shell">
      <p className="kicker">Receipt</p>
      <h1>Restricted.</h1>
      <p>This receipt link is missing its private access token. Open it from your order tracking page, or sign in with the admin account.</p>
      <Link href="/account" className="inline-arrow">Go to sign in</Link>
    </div>;
  }

  const address = order.shipping_address || {};
  const items = order.order_items || [];
  const backHref = adminActor ? "/admin" : `/order/${encodeURIComponent(publicId)}?token=${encodeURIComponent(token)}`;
  const backLabel = adminActor ? "Back to console" : "Back to tracking";

  return <div className="commerce-page section-shell">
    <div className="invoice-page">
      <InvoiceActions backHref={backHref} backLabel={backLabel} />
      <header className="invoice-head">
        <div>
          <p className="invoice-brand">RELAPSE <span>PERFUME</span></p>
          <p className="invoice-brand-sub">Small-batch fragrance · India</p>
        </div>
        <div className="invoice-meta">
          <b>{order.payment_status === "paid" ? "Payment receipt" : "Order summary"}</b>
          <span>Order {order.public_id}</span>
          <span>{formatIstDateTime(order.created_at)}</span>
        </div>
      </header>

      <div className="invoice-parties">
        <div>
          <h2>Billed to</h2>
          <p>{order.customer_name}<br/>{address.addressLine1}{address.addressLine2 ? <><br/>{address.addressLine2}</> : null}<br/>{address.city}, {address.state} {address.postalCode}<br/>{order.phone} · {order.email}</p>
        </div>
        <div>
          <h2>Sold by</h2>
          <p>{INVOICE_SELLER.name}{INVOICE_SELLER.lines.length ? <>{INVOICE_SELLER.lines.map((line) => <span key={line}><br/>{line}</span>)}</> : null}{INVOICE_SELLER.gstin ? <><br/>GSTIN {INVOICE_SELLER.gstin}</> : null}</p>
        </div>
      </div>

      <table className="invoice-table">
        <thead><tr><th>Item</th><th>SKU</th><th className="num">Qty</th><th className="num">Unit</th><th className="num">Amount</th></tr></thead>
        <tbody>
          {items.map((item) => <tr key={item.id}>
            <td>{item.product_name} — {item.variant_label}</td>
            <td className="sku">{item.sku}</td>
            <td className="num">{item.quantity}</td>
            <td className="num">{formatINR(item.unit_price_paise)}</td>
            <td className="num">{formatINR(item.line_total_paise)}</td>
          </tr>)}
        </tbody>
      </table>

      <div className="invoice-totals">
        <div><span>Subtotal</span><b>{formatINR(order.subtotal_paise)}</b></div>
        <div><span>Delivery</span><b>{order.shipping_paise ? formatINR(order.shipping_paise) : "Free"}</b></div>
        {order.discount_paise ? <div><span>Discount</span><b>−{formatINR(order.discount_paise)}</b></div> : null}
        {order.credit_applied_paise ? <div><span>Discovery credit</span><b>−{formatINR(order.credit_applied_paise)}</b></div> : null}
        <div className="total"><span>Total {order.payment_status === "paid" ? "paid" : "due"}</span><b>{formatINR(order.total_paise)}</b></div>
      </div>

      <footer className="invoice-foot">
        <p>Payment: {order.payment_status}{order.paid_at ? ` · ${formatIstDateTime(order.paid_at)}` : ""}{order.payment_id ? ` · ref ${order.payment_id}` : ""}{order.payment_provider ? ` · via ${order.payment_provider}` : ""}</p>
        <p>Fulfillment: {order.fulfillment_status.replaceAll("_", " ")}{order.tracking_number ? ` · India Post tracking ${order.tracking_number}` : ""}{order.tracking_url ? <> · <a href={order.tracking_url}>carrier tracking</a></> : null}</p>
        <p>Thank you for choosing Relapse Perfumes. Questions? Reach us through the contact page on the website.</p>
      </footer>
    </div>
  </div>;
}
