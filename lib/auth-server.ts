import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function authenticatedUser(): Promise<{ id: string; email?: string } | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: String(data.claims.sub), email: typeof data.claims.email === "string" ? data.claims.email : undefined };
}

// Admin access always requires a real session with role = admin, in demo mode
// too. Demo mode only relaxes commerce mutations (read-only there); it must
// never open moderation or the contact inbox to anonymous visitors.
export async function requireAdmin(): Promise<{ userId: string } | null> {
  const user = await authenticatedUser();
  const admin = getAdminSupabase();
  if (!user || !admin) return null;
  const { data } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin" ? { userId: user.id } : null;
}
