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
    const allow = body.entity === "variant" ? ["label","price_paise","compare_at_paise","is_active","preferred_fulfillment_provider"] : ["name","eyebrow","short_description","description","family","concentration","accent","featured","is_active","metadata"];
    const patch = Object.fromEntries(Object.entries(body.patch).filter(([key]) => allow.includes(key)));
    if (!Object.keys(patch).length) return json({ error: "No permitted fields." }, 400);
    const { data: before } = await admin.from(table).select("*").eq("id", body.id).maybeSingle();
    const { data: after, error } = await admin.from(table).update(patch).eq("id", body.id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    await admin.from("audit_log").insert({ actor_user_id: actor.userId, action: "update", entity_type: table, entity_id: body.id, before_state: before, after_state: after });
    return json({ ok: true, entity: after });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Update failed." }, 400); }
}
