import { getAdminSupabase } from "@/lib/supabase/admin";
import { envFlag } from "@/lib/runtime-env";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import type { DeliveryAddress } from "@/lib/types";
import type { FulfillmentLine, FulfillmentQuote } from "@/lib/fulfillment/types";

export async function submitPaidOrder(orderId: string): Promise<void> {
  if (!envFlag("FULFILLMENT_LIVE_ENABLED", false)) return;
  const admin = getAdminSupabase(); if (!admin) throw new Error("Database is not configured.");
  const { data: order, error } = await admin.from("orders").select("*,order_items(*)").eq("id", orderId).single();
  if (error || !order) throw new Error(`Order not found: ${error?.message || "unknown"}`);
  if (order.payment_status !== "paid" || order.fulfillment_status !== "unfulfilled") return;

  const provider = getFulfillmentProvider(order.fulfillment_provider);
  const key = `${provider.key}:${order.id}`;
  const { data: existing } = await admin.from("fulfillment_attempts").select("status,provider_order_id").eq("idempotency_key", key).maybeSingle();
  if (existing?.provider_order_id) return;

  const lines: FulfillmentLine[] = (order.order_items || []).map((item: Record<string, unknown>) => ({
    lineId: String(item.id), variantId: String(item.variant_id || ""), sku: String(item.sku), providerSku: item.provider_sku ? String(item.provider_sku) : undefined,
    name: `${item.product_name} — ${item.variant_label}`, quantity: Number(item.quantity), unitPricePaise: Number(item.unit_price_paise), weightGrams: Number(item.weight_grams || 300),
  }));
  provider.validateLines?.(lines);
  await admin.from("fulfillment_attempts").upsert({ order_id: order.id, provider: provider.key, idempotency_key: key, status: "submitting", request_payload: { service: order.fulfillment_service_code } }, { onConflict: "idempotency_key" });

  try {
    const result = await provider.create({
      orderId: order.public_id,
      address: order.shipping_address as DeliveryAddress,
      lines,
      quote: order.fulfillment_quote as FulfillmentQuote,
      paymentMethod: "prepaid",
      currency: "INR",
      gift: order.gift || undefined,
    });
    await admin.from("fulfillment_attempts").update({ status: "submitted", provider_order_id: result.providerOrderId, response_payload: result.raw || {} }).eq("idempotency_key", key);
    await admin.from("orders").update({ provider_order_id: result.providerOrderId, fulfillment_status: result.status, tracking_number: result.trackingNumber || null, tracking_url: result.trackingUrl || null, fulfillment_last_synced_at: new Date().toISOString() }).eq("id", order.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fulfillment error";
    await admin.from("fulfillment_attempts").update({ status: "failed", error_message: message }).eq("idempotency_key", key);
    await admin.from("orders").update({ fulfillment_status: "attention_required", fulfillment_last_synced_at: new Date().toISOString() }).eq("id", order.id);
    throw error;
  }
}

export async function reconcileOrderFulfillment(orderId: string) {
  const admin = getAdminSupabase(); if (!admin) return null;
  const { data: order } = await admin.from("orders").select("id,fulfillment_provider,provider_order_id,fulfillment_status").eq("id", orderId).maybeSingle();
  if (!order?.provider_order_id || ["delivered","cancelled","attention_required"].includes(order.fulfillment_status)) return order;
  const status = await getFulfillmentProvider(order.fulfillment_provider).getStatus(order.provider_order_id);
  await admin.from("orders").update({ fulfillment_status: status.status, tracking_number: status.trackingNumber || null, tracking_url: status.trackingUrl || null, estimated_delivery: status.estimatedDelivery || null, fulfillment_last_synced_at: new Date().toISOString() }).eq("id", order.id);
  return status;
}
