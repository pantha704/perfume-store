import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { isDemoMode } from "@/lib/runtime-env";

export const runtime = "nodejs";

// Shipment stages the merchant advances a manual (India Post) order through.
// "unfulfilled" is the initial state written at checkout; the customer tracker
// renders it as the first stage.
const LADDER = ["processing", "shipped", "in_transit", "out_for_delivery", "delivered"];

function nextStage(current: string): string | null {
  if (current === "delivered" || current === "cancelled" || current === "attention_required") return null;
  const idx = LADDER.indexOf(current === "unfulfilled" ? "processing" : current);
  if (idx === -1) return "shipped";
  return idx + 1 < LADDER.length ? LADDER[idx + 1] : null;
}

export async function PATCH(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const actor = await requireAdmin(); if (!actor) return json({ error: "Forbidden." }, 403);
    if (isDemoMode()) return json({ error: "Demo admin is read-only." }, 409);
    const body = await safeJson<{
      orderId: string;
      action: "dispatch" | "advance_status" | "cancel_fulfillment" | "mark_attention";
      trackingNumber?: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
    }>(request);
    if (!body?.orderId) return json({ error: "Order is required." }, 400);
    const admin = getAdminSupabase(); if (!admin) return json({ error: "Database unavailable." }, 503);
    const { data: order } = await admin.from("orders").select("*").eq("id", body.orderId).maybeSingle();
    if (!order) return json({ error: "Order not found." }, 404);

    let patch: Record<string, unknown>;
    if (body.action === "dispatch") {
      const trackingNumber = (body.trackingNumber || "").trim();
      if (trackingNumber.length < 4 || trackingNumber.length > 40) return json({ error: "Add the India Post tracking number (4-40 characters)." }, 400);
      const trackingUrl = (body.trackingUrl || "").trim().slice(0, 300);
      const estimatedDelivery = (body.estimatedDelivery || "").trim().slice(0, 10);
      patch = {
        fulfillment_status: "shipped",
        tracking_number: trackingNumber,
        tracking_url: trackingUrl || null,
        estimated_delivery: estimatedDelivery || null,
        fulfillment_last_synced_at: new Date().toISOString(),
      };
    } else if (body.action === "advance_status") {
      const next = nextStage(String(order.fulfillment_status || "unfulfilled"));
      if (!next) return json({ error: "This order cannot advance further." }, 409);
      patch = { fulfillment_status: next, fulfillment_last_synced_at: new Date().toISOString() };
    } else if (body.action === "cancel_fulfillment") {
      if (order.provider_order_id) await getFulfillmentProvider(order.fulfillment_provider).cancel(order.provider_order_id);
      patch = { fulfillment_status: "cancelled" };
    } else if (body.action === "mark_attention") {
      patch = { fulfillment_status: "attention_required" };
    } else {
      return json({ error: "Invalid action." }, 400);
    }

    const { data: after, error } = await admin.from("orders").update(patch).eq("id", order.id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    await admin.from("audit_log").insert({ actor_user_id: actor.userId, action: body.action, entity_type: "orders", entity_id: order.id, before_state: order, after_state: after });
    return json({ ok: true, fulfillment_status: after.fulfillment_status, tracking_number: after.tracking_number });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Order update failed." }, 400); }
}
