import { getAdminSupabase } from "@/lib/supabase/admin";

export interface PublicReview {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface AdminReview {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  body: string;
  status: "pending" | "published" | "hidden";
  created_at: string;
}

export interface ContactMessage {
  id: string;
  product_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

/** Published reviews + aggregate rating for one product. Degrades to empty. */
export async function getPublishedReviews(productId: string, limit = 12): Promise<{ reviews: PublicReview[]; average: number; count: number }> {
  const db = getAdminSupabase();
  if (!db) return { reviews: [], average: 0, count: 0 };
  const [{ data }, { data: ratings }] = await Promise.all([
    db.from("reviews").select("id, author_name, rating, body, created_at")
      .eq("product_id", productId).eq("status", "published")
      .order("created_at", { ascending: false }).limit(limit),
    db.from("reviews").select("rating").eq("product_id", productId).eq("status", "published"),
  ]);
  const reviews = (data || []).map((r) => ({ id: r.id, authorName: r.author_name, rating: r.rating, body: r.body, createdAt: r.created_at }));
  const all = (ratings || []).map((r) => r.rating as number);
  const average = all.length ? Math.round((all.reduce((sum, n) => sum + n, 0) / all.length) * 10) / 10 : 0;
  return { reviews, average, count: all.length };
}

/** Admin moderation queue (newest first). */
export async function getAdminReviewQueue(limit = 60): Promise<AdminReview[]> {
  const db = getAdminSupabase();
  if (!db) return [];
  const { data } = await db.from("reviews")
    .select("id, product_id, author_name, rating, body, status, created_at")
    .order("created_at", { ascending: false }).limit(limit);
  return (data || []) as AdminReview[];
}

/** Admin contact inbox (newest first). */
export async function getContactMessages(limit = 40): Promise<ContactMessage[]> {
  const db = getAdminSupabase();
  if (!db) return [];
  const { data } = await db.from("contact_messages")
    .select("id, product_id, name, email, phone, message, status, created_at")
    .order("created_at", { ascending: false }).limit(limit);
  return (data || []) as ContactMessage[];
}
