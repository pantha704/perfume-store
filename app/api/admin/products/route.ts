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
    const allow = body.entity === "variant" ? ["label","price_paise","compare_at_paise","is_active","preferred_fulfillment_provider","stock_quantity"] : ["name","eyebrow","short_description","description","family","concentration","accent","featured","is_active","metadata","notes","image_url","image_alt"];
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
    // Handover guardrails: validate product text, notes and images before persisting.
    const TEXT_LIMITS: Record<string, number> = { name: 80, eyebrow: 140, short_description: 300, description: 4000, family: 40, concentration: 80, image_url: 300, image_alt: 240, accent: 40 };
    const REQUIRED_TEXT = ["name", "family", "concentration", "image_url"];
    for (const [key, max] of Object.entries(TEXT_LIMITS)) {
      if (!(key in patch)) continue;
      const raw = patch[key];
      if (typeof raw !== "string") return json({ error: `${key} must be text.` }, 400);
      const value = raw.trim();
      if (!value && REQUIRED_TEXT.includes(key)) return json({ error: `${key} cannot be empty.` }, 400);
      if (value.length > max) return json({ error: `${key} is too long (max ${max} characters).` }, 400);
      patch[key] = value;
    }
    if ("image_url" in patch && patch.image_url && !/^(https?:\/\/|\/)/.test(String(patch.image_url))) return json({ error: "Image URL must start with / or http(s)://." }, 400);
    if ("featured" in patch && typeof patch.featured !== "boolean") return json({ error: "Featured must be true or false." }, 400);
    if ("is_active" in patch && typeof patch.is_active !== "boolean") return json({ error: "Visibility must be true or false." }, 400);
    if ("notes" in patch) {
      const notes = patch.notes as { top?: unknown; heart?: unknown; base?: unknown } | null;
      const cleanList = (list: unknown): string[] | null => {
        if (!Array.isArray(list)) return null;
        const items = list.map((item) => String(item).trim()).filter(Boolean);
        if (items.length > 24 || items.some((item) => item.length > 140)) return null;
        return items;
      };
      const top = notes ? cleanList(notes.top) : null;
      const heart = notes ? cleanList(notes.heart) : null;
      const base = notes ? cleanList(notes.base) : null;
      if (!top || !heart || !base) return json({ error: "Each note list needs up to 24 lines of 140 characters." }, 400);
      patch.notes = { top, heart, base };
    }
    const { data: before } = await admin.from(table).select("*").eq("id", body.id).maybeSingle();
    const { data: after, error } = await admin.from(table).update(patch).eq("id", body.id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    await admin.from("audit_log").insert({ actor_user_id: actor.userId, action: "update", entity_type: table, entity_id: body.id, before_state: before, after_state: after });
    return json({ ok: true, entity: after });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Update failed." }, 400); }
}
