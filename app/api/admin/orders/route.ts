import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { isDemoMode } from "@/lib/runtime-env";

export const runtime = "nodejs";
export async function PATCH(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const actor = await requireAdmin(); if (!actor) return json({ error: "Forbidden." }, 403);
    if (isDemoMode()) return json({ error: "Demo admin is read-only." }, 409);
    const body = await safeJson<{ orderId: string; action: "cancel_fulfillment"|"mark_attention" }>(request);
    if (!body?.orderId) return json({ error: "Order is required." }, 400);
    const admin = getAdminSupabase(); if (!admin) return json({ error: "Database unavailable." }, 503);
    const { data: order } = await admin.from("orders").select("*").eq("id", body.orderId).maybeSingle();
    if (!order) return json({ error: "Order not found." }, 404);
    if (body.action === "cancel_fulfillment" && order.provider_order_id) await getFulfillmentProvider(order.fulfillment_provider).cancel(order.provider_order_id);
    const status = body.action === "cancel_fulfillment" ? "cancelled" : "attention_required";
    const { data: after, error } = await admin.from("orders").update({ fulfillment_status: status }).eq("id", order.id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    await admin.from("audit_log").insert({ actor_user_id: actor.userId, action: body.action, entity_type: "orders", entity_id: order.id, before_state: order, after_state: after });
    return json({ ok: true });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Order update failed." }, 400); }
}
