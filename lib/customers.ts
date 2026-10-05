import { getAdminSupabase } from "@/lib/supabase/admin";

export interface AdminCustomer {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  orders: number;
  spentPaise: number;
  lastOrderAt: string | null;
}

/** Admin customers view: profiles joined with their order history. Degrades to []. */
export async function getAdminCustomers(limit = 100): Promise<AdminCustomer[]> {
  const db = getAdminSupabase();
  if (!db) return [];
  const [{ data: profiles }, { data: orderRows }] = await Promise.all([
    db.from("profiles").select("id, email, full_name, phone, role, created_at").order("created_at", { ascending: false }).limit(limit),
    db.from("orders").select("user_id, total_paise, payment_status, created_at"),
  ]);
  const agg = new Map<string, { orders: number; spent: number; last: string | null }>();
  for (const order of orderRows || []) {
    if (!order.user_id) continue;
    const entry = agg.get(order.user_id) || { orders: 0, spent: 0, last: null };
    entry.orders += 1;
    if (order.payment_status === "paid") entry.spent += order.total_paise || 0;
    if (!entry.last || order.created_at > entry.last) entry.last = order.created_at;
    agg.set(order.user_id, entry);
  }
  return (profiles || []).map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    phone: p.phone,
    role: p.role,
    createdAt: p.created_at,
    orders: agg.get(p.id)?.orders || 0,
    spentPaise: agg.get(p.id)?.spent || 0,
    lastOrderAt: agg.get(p.id)?.last || null,
  }));
}
