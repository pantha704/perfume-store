// Order-email orchestration: load the order, build the template, send.
// Never throws — email failures must never break checkout or dispatch.
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { orderConfirmedEmail, orderDispatchedEmail, type OrderEmailData } from "@/lib/emails";

interface OrderRow {
  public_id: string;
  email: string;
  customer_name: string;
  total_paise: number;
  tracking_number?: string | null;
  tracking_url?: string | null;
  order_items?: Array<{ product_name: string; variant_label: string; quantity: number; line_total_paise: number }>;
}

async function loadOrder(orderId: string): Promise<{ to: string; data: OrderEmailData } | null> {
  const db = getAdminSupabase();
  if (!db) return null;
  const { data } = await db
    .from("orders")
    .select("public_id,email,customer_name,total_paise,tracking_number,tracking_url,order_items(product_name,variant_label,quantity,line_total_paise)")
    .eq("id", orderId)
    .maybeSingle();
  const row = data as OrderRow | null;
  if (!row?.email) return null;
  return {
    to: row.email,
    data: {
      publicId: row.public_id,
      customerName: row.customer_name,
      totalPaise: row.total_paise,
      trackingNumber: row.tracking_number ?? null,
      trackingUrl: row.tracking_url ?? null,
      items: (row.order_items || []).map((item) => ({
        productName: item.product_name,
        variantLabel: item.variant_label,
        quantity: item.quantity,
        lineTotalPaise: item.line_total_paise
      }))
    }
  };
}

export async function sendOrderConfirmedEmail(orderId: string): Promise<boolean> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return false;
    const template = orderConfirmedEmail(loaded.data);
    return await sendEmail({ to: loaded.to, subject: template.subject, html: template.html });
  } catch {
    return false;
  }
}

export async function sendOrderDispatchedEmail(orderId: string): Promise<boolean> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return false;
    const template = orderDispatchedEmail(loaded.data);
    return await sendEmail({ to: loaded.to, subject: template.subject, html: template.html });
  } catch {
    return false;
  }
}
