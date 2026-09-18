import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Review moderation (publish / hide). Deliberately NOT gated on demo mode —
// commerce mutations are demo read-only, but content moderation must work in
// the demo console.
export async function PATCH(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const actor = await requireAdmin();
    if (!actor) return json({ error: "Forbidden." }, 403);
    const body = await safeJson<{ id?: string; action?: "publish" | "hide" }>(request);
    if (!body?.id || (body.action !== "publish" && body.action !== "hide")) return json({ error: "Invalid moderation request." }, 400);
    const admin = getAdminSupabase();
    if (!admin) return json({ error: "Database unavailable." }, 503);
    const { error } = await admin.from("reviews")
      .update({ status: body.action === "publish" ? "published" : "hidden", published_at: body.action === "publish" ? new Date().toISOString() : null })
      .eq("id", body.id);
    if (error) return json({ error: "Update failed." }, 500);
    return json({ ok: true });
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
}
