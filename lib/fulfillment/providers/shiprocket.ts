import { envFlag, runtimeEnv } from "@/lib/runtime-env";
import type { FulfillmentProvider, FulfillmentStatusResult } from "@/lib/fulfillment/types";

let cachedToken: { token: string; expiresAt: number } | null = null;
const base = () => runtimeEnv("SHIPROCKET_API_BASE", "https://apiv2.shiprocket.in/v1/external").replace(/\/$/, "");

async function token(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const email = runtimeEnv("SHIPROCKET_EMAIL");
  const password = runtimeEnv("SHIPROCKET_PASSWORD");
  if (!email || !password) throw new Error("Shiprocket credentials are not configured.");
  const response = await fetch(`${base()}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" });
  if (!response.ok) throw new Error(`Shiprocket authentication failed (${response.status}).`);
  const payload = (await response.json()) as { token: string };
  cachedToken = { token: payload.token, expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
  return payload.token;
}
async function sr<T>(path: string, init: RequestInit = {}): Promise<T> {
  const auth = await token();
  const response = await fetch(`${base()}${path}`, { ...init, cache: "no-store", headers: { "content-type": "application/json", authorization: `Bearer ${auth}`, ...(init.headers || {}) } });
  const raw = await response.text(); let payload: unknown = null; try { payload = raw ? JSON.parse(raw) : null; } catch { payload = raw; }
  if (!response.ok) throw new Error(`Shiprocket ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  return payload as T;
}
function mapStatus(status: string | undefined): FulfillmentStatusResult["status"] {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered")) return "delivered";
  if (s.includes("out for delivery")) return "out_for_delivery";
  if (s.includes("transit")) return "in_transit";
  if (s.includes("shipped") || s.includes("pickup")) return "shipped";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("error") || s.includes("lost")) return "attention_required";
  return "processing";
}

export const shiprocketProvider: FulfillmentProvider = {
  key: "shiprocket",
  capabilities: { quotes: true, tracking: true, cancellation: true, inventorySync: false, cod: true },
  isEnabled: () => envFlag("SHIPROCKET_ENABLED", false),
  async quote(request) {
    const weightKg = Math.max(0.5, request.lines.reduce((sum, line) => sum + (line.weightGrams || 250) * line.quantity, 0) / 1000);
    const params = new URLSearchParams({ pickup_postcode: runtimeEnv("SHIPROCKET_PICKUP_POSTCODE"), delivery_postcode: request.address.postalCode, weight: weightKg.toFixed(2), cod: "0" });
    const raw = await sr<Record<string, any>>(`/courier/serviceability/?${params}`);
    const couriers = raw?.data?.available_courier_companies || [];
    return couriers.slice(0, 5).map((c: any) => ({ provider: "shiprocket" as const, serviceCode: String(c.courier_company_id), serviceName: String(c.courier_name), amountPaise: Math.round(Number(c.rate || 0) * 100), estimatedDelivery: c.etd || null, raw: c }));
  },
  async create(request) {
    const body = {
      order_id: request.orderId, order_date: new Date().toISOString().slice(0, 10), pickup_location: runtimeEnv("SHIPROCKET_PICKUP_LOCATION"),
      billing_customer_name: request.address.name, billing_last_name: "", billing_address: request.address.addressLine1, billing_address_2: request.address.addressLine2 || "", billing_city: request.address.city, billing_pincode: request.address.postalCode, billing_state: request.address.state, billing_country: "India", billing_email: request.address.email, billing_phone: request.address.phone, shipping_is_billing: true,
      order_items: request.lines.map((line) => ({ name: line.name, sku: line.sku, units: line.quantity, selling_price: (line.unitPricePaise / 100).toFixed(2) })), payment_method: request.paymentMethod === "cod" ? "COD" : "Prepaid",
      sub_total: (request.lines.reduce((s, line) => s + line.unitPricePaise * line.quantity, 0) / 100).toFixed(2), length: 12, breadth: 8, height: 16, weight: Math.max(0.5, request.lines.reduce((s, line) => s + (line.weightGrams || 250) * line.quantity, 0) / 1000), comment: request.gift?.note ? `Gift order. Note: ${request.gift.note.slice(0, 160)}` : `Website order ${request.orderId}`,
    };
    const raw = await sr<Record<string, any>>("/orders/create/adhoc", { method: "POST", body: JSON.stringify(body) });
    return { provider: "shiprocket", providerOrderId: String(raw.shipment_id || raw.order_id || request.orderId), status: "submitted", trackingNumber: raw.awb_code || null, raw };
  },
  async getStatus(providerOrderId) {
    const raw = await sr<Record<string, any>>(`/courier/track/shipment/${encodeURIComponent(providerOrderId)}`);
    const tracking = raw?.tracking_data || raw?.[0]?.tracking_data || raw;
    return { provider: "shiprocket", providerOrderId, status: mapStatus(tracking?.shipment_status || tracking?.track_status), trackingNumber: tracking?.awb_code || null, trackingUrl: tracking?.track_url || null, estimatedDelivery: tracking?.etd || null, raw };
  },
  async cancel(providerOrderId) { await sr("/orders/cancel", { method: "POST", body: JSON.stringify({ ids: [Number(providerOrderId) || providerOrderId] }) }); },
};
