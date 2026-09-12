import { json } from "@/lib/http";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/order-service";
import { submitPaidOrder } from "@/lib/fulfillment/service";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, signature)) return json({ error: "Invalid signature." }, 400);
  let event: any;
  try { event = JSON.parse(raw); } catch { return json({ error: "Invalid JSON." }, 400); }
  const eventId = request.headers.get("x-razorpay-event-id") || String(event?.payload?.payment?.entity?.id || `${event.event}:${event.created_at || "unknown"}`);
  const admin = getAdminSupabase(); if (!admin) return json({ error: "Database unavailable." }, 503);
  const { error: insertError } = await admin.from("webhook_events").insert({ provider: "razorpay", provider_event_id: eventId, event_type: event.event, payload: event });
  if (insertError?.code === "23505") return json({ ok: true, duplicate: true });
  if (insertError) return json({ error: "Could not record webhook." }, 500);

  const payment = event?.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  if (!razorpayOrderId) return json({ ok: true });
  const { data: order } = await admin.from("orders").select("id").eq("payment_order_id", razorpayOrderId).maybeSingle();
  if (!order) return json({ ok: true });
  if (["payment.captured", "order.paid"].includes(event.event)) {
    await markOrderPaid(order.id, String(payment.id || "webhook"));
    try { await submitPaidOrder(order.id); } catch (error) { console.error("webhook fulfillment", error); }
  } else if (event.event === "payment.failed") await markOrderPaymentFailed(order.id);
  return json({ ok: true });
}
