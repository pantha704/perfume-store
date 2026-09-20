import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { authenticatedUser } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

// User-submitted reviews: signed-in only, validated, stored as "pending" for
// admin moderation. One pending review per user per product.
export async function POST(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const user = await authenticatedUser();
    if (!user) return json({ error: "Sign in to write a review." }, 401);

    const body = await safeJson<{ productId?: string; rating?: number; body?: string; title?: string; displayName?: string; turnstileToken?: string }>(request);
    const productId = (body?.productId || "").trim().slice(0, 80);
    const rating = Math.round(Number(body?.rating));
    const text = (body?.body || "").trim();
    const reviewTitle = (body?.title || "").trim().slice(0, 80);
    const displayName = (body?.displayName || "").trim().slice(0, 40);

    if (!productId) return json({ error: "Product is required." }, 400);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return json({ error: "Choose a rating from 1 to 5." }, 400);
    if (text.length < 10 || text.length > 800) return json({ error: "Write between 10 and 800 characters." }, 400);
    if (displayName.length < 2) return json({ error: "Add a display name." }, 400);
    if (!(await verifyTurnstile(body?.turnstileToken || "", request.headers.get("cf-connecting-ip") || undefined))) {
      return json({ error: "Verification failed — please try again." }, 403);
    }

    const admin = getAdminSupabase();
    if (!admin) return json({ error: "Reviews are unavailable in this environment." }, 503);

    const { data: existing } = await admin.from("reviews")
      .select("id").eq("product_id", productId).eq("user_id", user.id).eq("status", "pending").maybeSingle();
    if (existing) return json({ error: "Your review for this scent is already awaiting moderation." }, 409);

    const { error } = await admin.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      author_name: displayName,
      title: reviewTitle || null,
      rating,
      body: text,
      status: "pending",
    });
    if (error) return json({ error: "Could not save the review." }, 500);
    return json({ ok: true });
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
}
