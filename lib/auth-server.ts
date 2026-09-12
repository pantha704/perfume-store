import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/runtime-env";

export async function authenticatedUser(): Promise<{ id: string; email?: string } | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: String(data.claims.sub), email: typeof data.claims.email === "string" ? data.claims.email : undefined };
}

export async function requireAdmin(): Promise<{ userId: string } | null> {
  if (isDemoMode()) return { userId: "demo-admin" };
  const user = await authenticatedUser();
  const admin = getAdminSupabase();
  if (!user || !admin) return null;
  const { data } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin" ? { userId: user.id } : null;
}
