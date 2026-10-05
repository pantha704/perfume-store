import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/runtime-env";

export const runtime = "nodejs";
export async function PATCH(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const actor = await requireAdmin(); if (!actor) return json({ error: "Forbidden." }, 403);
    if (isDemoMode()) return json({ error: "Demo admin is read-only." }, 409);
    const body = await safeJson<{ entity: "product"|"variant"; id: string; patch: Record<string, unknown> }>(request);
    if (!body?.id || !body.patch) return json({ error: "Invalid request." }, 400);
    const admin = getAdminSupabase(); if (!admin) return json({ error: "Database unavailable." }, 503);
    const table = body.entity === "variant" ? "variants" : "products";
    const allow = body.entity === "variant" ? ["label","price_paise","compare_at_paise","is_active","preferred_fulfillment_provider","stock_quantity"] : ["name","eyebrow","short_description","description","family","concentration","accent","featured","is_active","metadata"];
    const patch = Object.fromEntries(Object.entries(body.patch).filter(([key]) => allow.includes(key)));
    if (!Object.keys(patch).length) return json({ error: "No permitted fields." }, 400);
    if ("stock_quantity" in patch) {
      const raw = patch.stock_quantity;
      const stock = raw === null || raw === "" ? null : Math.round(Number(raw));
      if (stock !== null && (!Number.isFinite(stock) || stock < 0)) return json({ error: "Stock must be a whole number of 0 or more." }, 400);
      patch.stock_quantity = stock;
    }
    if ("price_paise" in patch) {
      const price = Math.round(Number(patch.price_paise));
      if (!Number.isFinite(price) || price < 0) return json({ error: "Price must be a number of 0 or more." }, 400);
      patch.price_paise = price;
    }
    if ("compare_at_paise" in patch) {
      const raw = patch.compare_at_paise;
      const compare = raw === null || raw === "" ? null : Math.round(Number(raw));
      if (compare !== null && (!Number.isFinite(compare) || compare < 0)) return json({ error: "Compare-at price must be a number of 0 or more." }, 400);
      patch.compare_at_paise = compare;
    }
    const { data: before } = await admin.from(table).select("*").eq("id", body.id).maybeSingle();
    const { data: after, error } = await admin.from(table).update(patch).eq("id", body.id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    await admin.from("audit_log").insert({ actor_user_id: actor.userId, action: "update", entity_type: table, entity_id: body.id, before_state: before, after_state: after });
    return json({ ok: true, entity: after });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Update failed." }, 400); }
}
