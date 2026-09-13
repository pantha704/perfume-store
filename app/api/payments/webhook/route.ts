import { json } from "@/lib/http";
import { razorpayPaymentProvider } from "@/lib/payments/providers/razorpay";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/order-service";
import { submitPaidOrder } from "@/lib/fulfillment/service";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!razorpayPaymentProvider.isEnabled()) return json({ error: "Payment provider is not enabled." }, 503);
  const event = razorpayPaymentProvider.parseWebhook(raw, signature, request.headers);
  if (!event) return json({ error: "Invalid signature." }, 400);
  const admin = getAdminSupabase(); if (!admin) return json({ error: "Database unavailable." }, 503);
  const { error: insertError } = await admin.from("webhook_events").insert({ provider: "razorpay", provider_event_id: event.eventId, event_type: event.eventType, payload: event.raw });
  if (insertError?.code === "23505") return json({ ok: true, duplicate: true });
  if (insertError) return json({ error: "Could not record webhook." }, 500);

  const razorpayOrderId = event.providerOrderId;
  if (!razorpayOrderId) return json({ ok: true });
  const { data: order } = await admin.from("orders").select("id").eq("payment_order_id", razorpayOrderId).maybeSingle();
  if (!order) return json({ ok: true });
  if (event.succeeded) {
    await markOrderPaid(order.id, String(event.paymentId || "webhook"));
    try { await submitPaidOrder(order.id); } catch (error) { console.error("webhook fulfillment", error); }
  } else if (event.failed) await markOrderPaymentFailed(order.id);
  return json({ ok: true });
}
