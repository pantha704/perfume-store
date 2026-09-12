import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { verifyCheckoutSignature } from "@/lib/payments/razorpay";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/order-service";
import { submitPaidOrder } from "@/lib/fulfillment/service";
import { isDemoMode } from "@/lib/runtime-env";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const body = await safeJson<{ orderId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }>(request);
    if (!body) return json({ error: "Invalid payment verification payload." }, 400);
    if (isDemoMode()) return json({ ok: true, demo: true });
    const admin = getAdminSupabase(); if (!admin) return json({ error: "Database unavailable." }, 503);
    const { data: order } = await admin.from("orders").select("id,payment_order_id,payment_status").eq("id", body.orderId).maybeSingle();
    if (!order || order.payment_order_id !== body.razorpay_order_id) return json({ error: "Payment order mismatch." }, 400);
    if (!verifyCheckoutSignature({ razorpayOrderId: body.razorpay_order_id, razorpayPaymentId: body.razorpay_payment_id, signature: body.razorpay_signature })) {
      await markOrderPaymentFailed(body.orderId);
      return json({ error: "Payment signature verification failed." }, 400);
    }
    await markOrderPaid(body.orderId, body.razorpay_payment_id);
    try { await submitPaidOrder(body.orderId); } catch (error) { console.error("fulfillment submit after payment", error); }
    return json({ ok: true });
  } catch (error) { console.error("verify payment", error); return json({ error: "Payment verification failed." }, 500); }
}
