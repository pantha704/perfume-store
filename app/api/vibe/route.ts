import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { trackServerEvent } from "@/lib/analytics";
import { formatVibeRequest, parseVibeRequest } from "@/lib/vibe";

export const runtime = "nodejs";

// Get Your Vibe: bespoke blend requests, stored for the admin inbox
// (same pipeline as the contact form — no mail provider configured yet).
// Honeypot ("company") + length limits; Turnstile verified whenever configured.
export async function POST(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const body = await safeJson<Record<string, unknown> & { company?: string; turnstileToken?: string }>(request);
    if (body?.company) return json({ ok: true }); // honeypot: pretend success

    const parsed = parseVibeRequest(body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    if (!(await verifyTurnstile(String(body?.turnstileToken || ""), request.headers.get("cf-connecting-ip") || undefined))) {
      return json({ error: "Verification failed — please try again." }, 403);
    }

    const admin = getAdminSupabase();
    if (!admin) return json({ error: "The studio inbox is unavailable in this environment." }, 503);
    const blend = parsed.request;
    const { error } = await admin.from("contact_messages").insert({
      product_id: null,
      name: blend.name,
      email: blend.email,
      phone: blend.phone || null,
      message: formatVibeRequest(blend)
    });
    if (error) return json({ error: "Could not send the blend request." }, 500);
    await trackServerEvent("vibe_submitted", { families: blend.families, noteCount: blend.notes.length, strength: blend.strength, size: blend.size });
    return json({ ok: true });
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
}
