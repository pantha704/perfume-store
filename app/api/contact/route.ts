import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

// Contact form: open to everyone, stored for the admin inbox.
// Honeypot field ("company") + length limits; Turnstile is verified whenever a
// secret is configured.
export async function POST(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const body = await safeJson<{ name?: string; email?: string; phone?: string; message?: string; productId?: string; company?: string; turnstileToken?: string }>(request);
    if (body?.company) return json({ ok: true }); // honeypot: pretend success

    const name = (body?.name || "").trim().slice(0, 80);
    const email = (body?.email || "").trim().slice(0, 120);
    const phone = (body?.phone || "").trim().slice(0, 24);
    const message = (body?.message || "").trim().slice(0, 1200);
    const productId = (body?.productId || "").trim().slice(0, 80) || null;

    if (name.length < 2) return json({ error: "Add your name." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Add a valid email." }, 400);
    if (message.length < 10) return json({ error: "Tell us a little more (10+ characters)." }, 400);
    if (!(await verifyTurnstile(body?.turnstileToken || "", request.headers.get("cf-connecting-ip") || undefined))) {
      return json({ error: "Verification failed — please try again." }, 403);
    }

    const admin = getAdminSupabase();
    if (!admin) return json({ error: "Contact is unavailable in this environment." }, 503);
    const { error } = await admin.from("contact_messages").insert({ product_id: productId, name, email, phone: phone || null, message });
    if (error) return json({ error: "Could not send the message." }, 500);
    return json({ ok: true });
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
}
