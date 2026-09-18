import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Contact inbox status (read / archived). Same demo-mode reasoning as reviews:
// content operations stay available in the demo console.
export async function PATCH(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const actor = await requireAdmin();
    if (!actor) return json({ error: "Forbidden." }, 403);
    const body = await safeJson<{ id?: string; action?: "read" | "archive" }>(request);
    if (!body?.id || (body.action !== "read" && body.action !== "archive")) return json({ error: "Invalid inbox request." }, 400);
    const admin = getAdminSupabase();
    if (!admin) return json({ error: "Database unavailable." }, 503);
    const { error } = await admin.from("contact_messages")
      .update({ status: body.action === "archive" ? "archived" : "read" })
      .eq("id", body.id);
    if (error) return json({ error: "Update failed." }, 500);
    return json({ ok: true });
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
}
