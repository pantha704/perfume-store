import { getAdminSupabase } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/runtime-env";

export const analyticsEvents = new Set([
  "page_view", "product_view", "add_to_cart", "remove_from_cart", "checkout_start", "payment_started", "payment_failed", "purchase", "wishlist_added", "size_changed", "sample_added", "sample_to_full_bottle_viewed", "credit_applied", "quiz_completed", "buy_on_amazon_clicked"
]);

export async function trackServerEvent(eventName: string, properties: Record<string, unknown> = {}, anonymousId?: string | null, userId?: string | null) {
  if (isDemoMode()) return;
  const supabase = getAdminSupabase();
  if (!supabase || !analyticsEvents.has(eventName)) return;
  await supabase.from("analytics_events").insert({ event_name: eventName, properties, anonymous_id: anonymousId || null, user_id: userId || null });
}
