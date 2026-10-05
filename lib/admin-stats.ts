import { getAdminSupabase } from "@/lib/supabase/admin";

export interface AdminStats {
  revenueTodayPaise: number;
  revenue7Paise: number;
  revenue30Paise: number;
  orders30: number;
  paid30: number;
  aovPaise: number;
  awaitingDispatch: number;
  inTransit: number;
  delivered30: number;
  soldOut: number;
  lowStock: number;
  lowStockNames: string[];
  customersTotal: number;
  newCustomers7: number;
}

export interface AdminActivity {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  actor: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
// The store trades in IST; "today" means the IST calendar day.
function startOfIstDay(now = Date.now()): number {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now + IST_OFFSET_MS);
  return Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()) - IST_OFFSET_MS;
}

/** Everything the console glance needs, in one pass. Degrades to zeros. */
export async function getAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = { revenueTodayPaise: 0, revenue7Paise: 0, revenue30Paise: 0, orders30: 0, paid30: 0, aovPaise: 0, awaitingDispatch: 0, inTransit: 0, delivered30: 0, soldOut: 0, lowStock: 0, lowStockNames: [], customersTotal: 0, newCustomers7: 0 };
  const db = getAdminSupabase();
  if (!db) return empty;
  const now = Date.now();
  const dayStart = new Date(startOfIstDay(now)).toISOString();
  const weekAgo = new Date(now - 7 * DAY_MS).toISOString();
  const monthAgo = new Date(now - 30 * DAY_MS).toISOString();

  const [ordersRes, variantsRes, customersRes, newCustomersRes] = await Promise.all([
    db.from("orders").select("total_paise,payment_status,fulfillment_status,created_at").gte("created_at", monthAgo),
    db.from("variants").select("label,stock_quantity,products(name)").not("stock_quantity", "is", null),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
  ]);

  const orders = ordersRes.data || [];
  const paid = (row: { payment_status: string }) => row.payment_status === "paid";
  const revenue = (since: string) => orders.filter((row) => paid(row) && row.created_at >= since).reduce((sum, row) => sum + (row.total_paise || 0), 0);
  const paid30Rows = orders.filter(paid);

  const awaitingDispatch = orders.filter((row) => paid(row) && (row.fulfillment_status === "unfulfilled" || row.fulfillment_status === "processing")).length;
  const inTransit = orders.filter((row) => paid(row) && ["shipped", "in_transit", "out_for_delivery"].includes(row.fulfillment_status)).length;
  const delivered30 = orders.filter((row) => row.fulfillment_status === "delivered").length;

  const stocks = (variantsRes.data || []).map((row) => ({
    label: String((row.products as { name?: string } | null)?.name || "") + " · " + String(row.label || ""),
    stock: Number(row.stock_quantity),
  }));
  const soldOut = stocks.filter((row) => row.stock === 0).length;
  const lowStockRows = stocks.filter((row) => row.stock > 0 && row.stock <= 3);

  return {
    revenueTodayPaise: revenue(dayStart),
    revenue7Paise: revenue(weekAgo),
    revenue30Paise: revenue(monthAgo),
    orders30: orders.length,
    paid30: paid30Rows.length,
    aovPaise: paid30Rows.length ? Math.round(paid30Rows.reduce((sum, row) => sum + (row.total_paise || 0), 0) / paid30Rows.length) : 0,
    awaitingDispatch,
    inTransit,
    delivered30,
    soldOut,
    lowStock: lowStockRows.length,
    lowStockNames: lowStockRows.slice(0, 3).map((row) => row.label + " (" + row.stock + ")"),
    customersTotal: customersRes.count || 0,
    newCustomers7: newCustomersRes.count || 0,
  };
}

/** Last admin actions, newest first (joins the actor's email when available). */
export async function getRecentActivity(limit = 6): Promise<AdminActivity[]> {
  const db = getAdminSupabase();
  if (!db) return [];
  const { data } = await db.from("audit_log").select("id,action,entity_type,created_at,actor_user_id").order("created_at", { ascending: false }).limit(limit);
  const rows = data || [];
  if (!rows.length) return [];
  const actorIds = [...new Set(rows.map((row) => row.actor_user_id).filter(Boolean))] as string[];
  const { data: profiles } = actorIds.length ? await db.from("profiles").select("id,email").in("id", actorIds) : { data: [] };
  const mail = new Map((profiles || []).map((p) => [p.id, p.email]));
  return rows.map((row) => ({ id: row.id, action: row.action, entityType: row.entity_type, createdAt: row.created_at, actor: row.actor_user_id ? mail.get(row.actor_user_id) || null : null }));
}
