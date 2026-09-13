import { createHash, randomBytes } from "node:crypto";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/runtime-env";
import type { DeliveryAddress, GiftOptions } from "@/lib/types";
import type { PricedCart } from "@/lib/checkout";
import type { FulfillmentQuote } from "@/lib/fulfillment/types";

function hashToken(value: string): string { return createHash("sha256").update(value).digest("hex"); }

export interface PendingOrderResult {
  id: string;
  publicId: string;
  guestToken: string;
  totalPaise: number;
  creditAppliedPaise: number;
}

export async function createPendingOrder(input: {
  cart: PricedCart;
  address: DeliveryAddress;
  quote: FulfillmentQuote;
  userId?: string | null;
  gift?: GiftOptions;
  applyCredit?: boolean;
}): Promise<PendingOrderResult> {
  if (isDemoMode()) {
    const token = randomBytes(24).toString("base64url");
    return { id: "demo-order", publicId: `DEMO-${Date.now().toString(36).toUpperCase()}`, guestToken: token, totalPaise: input.cart.subtotalPaise + input.quote.amountPaise, creditAppliedPaise: 0 };
  }
  const admin = getAdminSupabase();
  if (!admin) throw new Error("Database is not configured.");

  const publicId = `VL${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;
  const guestToken = randomBytes(32).toString("base64url");
  const guestHash = hashToken(guestToken);
  const provisionalTotal = input.cart.subtotalPaise + input.quote.amountPaise;

  const { data: order, error } = await admin.from("orders").insert({
    public_id: publicId,
    user_id: input.userId || null,
    email: input.address.email.trim().toLowerCase(),
    phone: input.address.phone,
    customer_name: input.address.name,
    shipping_address: input.address,
    subtotal_paise: input.cart.subtotalPaise,
    shipping_paise: input.quote.amountPaise,
    discount_paise: 0,
    total_paise: provisionalTotal,
    fulfillment_provider: input.cart.provider,
    fulfillment_service_code: input.quote.serviceCode,
    fulfillment_quote: input.quote,
    guest_access_hash: guestHash,
    gift: input.gift || { isGift: false },
  }).select("id").single();
  if (error || !order) throw new Error(`Could not create order: ${error?.message || "unknown error"}`);

  let creditAppliedPaise = 0;
  let creditId: string | null = null;
  const hasFullBottle = input.cart.lines.some((line) => line.variant.kind === "bottle");
  if (input.applyCredit && hasFullBottle) {
    const { data: credits, error: creditError } = await admin.rpc("reserve_store_credit", {
      p_email: input.address.email.trim().toLowerCase(), p_order_id: order.id, p_max_paise: provisionalTotal,
    });
    if (creditError) console.error("Store credit reservation failed", creditError.message);
    const credit = Array.isArray(credits) ? credits[0] : null;
    if (credit) { creditId = String(credit.credit_id); creditAppliedPaise = Number(credit.reserved_paise) || 0; }
  }

  const totalPaise = Math.max(0, provisionalTotal - creditAppliedPaise);
  const { error: updateError } = await admin.from("orders").update({ total_paise: totalPaise, discount_paise: creditAppliedPaise, credit_applied_paise: creditAppliedPaise, store_credit_id: creditId }).eq("id", order.id);
  if (updateError) throw new Error(`Could not price order: ${updateError.message}`);

  const rows = input.cart.lines.map((line) => ({
    order_id: order.id,
    product_id: line.product.id,
    variant_id: line.variant.id,
    product_name: line.product.name,
    variant_label: line.variant.label,
    variant_kind: line.variant.kind,
    sku: line.variant.sku,
    provider_sku: line.providerSku || null,
    weight_grams: line.variant.weightGrams,
    quantity: line.quantity,
    unit_price_paise: line.unitPricePaise,
    line_total_paise: line.lineTotalPaise,
  }));
  const { error: itemError } = await admin.from("order_items").insert(rows);
  if (itemError) throw new Error(`Could not create order items: ${itemError.message}`);

  return { id: order.id, publicId, guestToken, totalPaise, creditAppliedPaise };
}

export async function attachPaymentOrder(orderId: string, paymentOrderId: string, paymentProvider?: string) {
  const admin = getAdminSupabase(); if (!admin) return;
  const { error } = await admin.from("orders").update({ payment_order_id: paymentOrderId, ...(paymentProvider ? { payment_provider: paymentProvider } : {}) }).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function markOrderPaid(orderId: string, paymentId: string) {
  const admin = getAdminSupabase(); if (!admin) return;
  const { error } = await admin.from("orders").update({ payment_status: "paid", payment_id: paymentId, paid_at: new Date().toISOString() }).eq("id", orderId).neq("payment_status", "paid");
  if (error) throw new Error(error.message);
  await admin.rpc("consume_store_credit", { p_order_id: orderId });
  await issueDiscoveryCredit(orderId);
}

export async function markOrderPaymentFailed(orderId: string) {
  const admin = getAdminSupabase(); if (!admin) return;
  await admin.from("orders").update({ payment_status: "failed" }).eq("id", orderId).eq("payment_status", "pending");
  await admin.rpc("release_store_credit", { p_order_id: orderId });
}

async function issueDiscoveryCredit(orderId: string) {
  const admin = getAdminSupabase(); if (!admin) return;
  const { data: order } = await admin.from("orders").select("email,order_items(variant_kind,line_total_paise)").eq("id", orderId).maybeSingle();
  if (!order) return;
  const discoveryTotal = ((order.order_items || []) as Array<{ variant_kind: string; line_total_paise: number }>).filter((item) => item.variant_kind === "discovery").reduce((s, item) => s + Number(item.line_total_paise || 0), 0);
  if (!discoveryTotal) return;
  const { data: existing } = await admin.from("store_credits").select("id").eq("source_order_id", orderId).maybeSingle();
  if (existing) return;
  await admin.from("store_credits").insert({ email: String(order.email).toLowerCase(), source_order_id: orderId, amount_paise: discoveryTotal, remaining_paise: discoveryTotal, expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() });
}

export async function readOrderForGuest(publicId: string, token: string) {
  const admin = getAdminSupabase(); if (!admin) return null;
  const { data } = await admin.from("orders").select("*,order_items(*)").eq("public_id", publicId).maybeSingle();
  if (!data?.guest_access_hash || hashToken(token) !== data.guest_access_hash) return null;
  const safe = { ...data } as Record<string, unknown>;
  delete safe.guest_access_hash;
  return safe;
}
