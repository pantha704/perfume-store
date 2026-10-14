// Transactional email templates (pure functions — unit-tested).
// Inline styles only: email clients strip <style> blocks and classes.
import { formatINR } from "@/lib/money";

export interface OrderEmailItem {
  productName: string;
  variantLabel: string;
  quantity: number;
  lineTotalPaise: number;
}

export interface OrderEmailData {
  publicId: string;
  customerName: string;
  totalPaise: number;
  items: OrderEmailItem[];
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

export const escapeHtml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const shell = (title: string, body: string): string => `<!doctype html><html><body style="margin:0;background:#f3efe8;font-family:Arial,Helvetica,sans-serif;color:#12100e">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px">
    <p style="letter-spacing:.28em;font-size:12px;margin:0 0 22px">RELAPSE <span style="color:#ad8a58">PERFUME</span></p>
    <div style="background:#fbf8f2;border:1px solid #e2d9cc;padding:26px">
      <h1 style="font-size:20px;margin:0 0 14px">${title}</h1>
      ${body}
    </div>
    <p style="font-size:11px;color:#5f5a54;margin:16px 0 0">Relapse Perfumes · small-batch fragrance · India</p>
  </div>
</body></html>`;

const itemsTable = (items: OrderEmailItem[], totalPaise: number): string => `<table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0">
  ${items.map((item) => `<tr><td style="padding:7px 0;border-bottom:1px solid #eee6da">${escapeHtml(item.productName)} — ${escapeHtml(item.variantLabel)} × ${item.quantity}</td><td style="padding:7px 0;border-bottom:1px solid #eee6da;text-align:right">${formatINR(item.lineTotalPaise)}</td></tr>`).join("")}
  <tr><td style="padding:9px 0;font-weight:bold">Total</td><td style="padding:9px 0;text-align:right;font-weight:bold">${formatINR(totalPaise)}</td></tr>
</table>`;

export function orderConfirmedEmail(data: OrderEmailData): { subject: string; html: string } {
  return {
    subject: `Order ${data.publicId} confirmed — Relapse Perfumes`,
    html: shell(
      "Your order is confirmed",
      `<p style="font-size:13px;line-height:1.6;margin:0 0 4px">Thank you, ${escapeHtml(data.customerName)} — we have your order and payment.</p>
       ${itemsTable(data.items, data.totalPaise)}
       <p style="font-size:12px;color:#5f5a54;margin:12px 0 0">We dispatch via India Post and will email you again with the tracking number as soon as it ships. Keep order id <b>${escapeHtml(data.publicId)}</b> handy for any question.</p>`
    )
  };
}

export function orderDispatchedEmail(data: OrderEmailData): { subject: string; html: string } {
  const tracking = data.trackingNumber
    ? `<p style="font-size:13px;margin:12px 0 0">Tracking number: <b>${escapeHtml(data.trackingNumber)}</b>${data.trackingUrl ? ` — <a href="${escapeHtml(data.trackingUrl)}" style="color:#8a6a3c">open carrier tracking</a>` : ""}</p>`
    : "";
  return {
    subject: `Order ${data.publicId} is on its way — Relapse Perfumes`,
    html: shell(
      "Your order is on its way",
      `<p style="font-size:13px;line-height:1.6;margin:0 0 4px">Hi ${escapeHtml(data.customerName)} — your order just left the studio, dispatched via India Post.</p>
       ${tracking}
       ${itemsTable(data.items, data.totalPaise)}
       <p style="font-size:12px;color:#5f5a54;margin:12px 0 0">Any question about order <b>${escapeHtml(data.publicId)}</b>? Just reply to this email.</p>`
    )
  };
}
