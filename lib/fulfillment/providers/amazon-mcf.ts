import { amazonRequest } from "@/lib/amazon/client";
import { envFlag, runtimeEnv } from "@/lib/runtime-env";
import type { CreateFulfillmentRequest, FulfillmentProvider, FulfillmentQuote, FulfillmentStatusResult, InventorySnapshot } from "@/lib/fulfillment/types";

const VERSION = "2026-07-04";
const BASE = `/fulfillment/outbound/${VERSION}`;

interface AmazonPreview { shippingFee?: { amount?: string | number }; fee?: { amount?: string | number }; estimatedArrivalDate?: string; deliveryDate?: string }
interface AmazonPreviewResponse { fulfillmentPreviews?: AmazonPreview[]; previews?: AmazonPreview[]; offers?: AmazonPreview[] }
interface AmazonOrderResponse { orderId?: string }
interface AmazonPackage { status?: string; trackingNumber?: string; tracking?: { trackingNumber?: string }; trackingUrl?: string; estimatedArrivalDate?: string }
interface AmazonStatusResponse extends AmazonPackage { packages?: AmazonPackage[]; shipments?: AmazonPackage[] }
interface AmazonInventorySummary { sellerSku?: string; asin?: string; inventoryDetails?: { fulfillableQuantity?: number }; totalQuantity?: number }
interface AmazonInventoryResponse { payload?: { inventorySummaries?: AmazonInventorySummary[] }; inventorySummaries?: AmazonInventorySummary[] }

function addressPayload(address: CreateFulfillmentRequest["address"]) {
  return { name: address.name, addressLine1: address.addressLine1, ...(address.addressLine2 ? { addressLine2: address.addressLine2 } : {}), city: address.city, stateOrRegion: address.state, countryCode: address.countryCode, postalCode: address.postalCode, phoneNumber: address.phone };
}
function linesPayload(lines: CreateFulfillmentRequest["lines"]) {
  return lines.map((line) => {
    if (!line.providerSku || line.providerSku.startsWith("REPLACE-")) throw new Error(`Missing live Amazon MCF amazonSku mapping for ${line.sku}`);
    return { lineItemId: line.lineId, product: { productIdentifier: { amazonSku: line.providerSku }, perUnitDeclaredValue: { currencyCode: "INR", amount: (line.unitPricePaise / 100).toFixed(2) } }, amount: { unit: "EACHES", value: String(line.quantity) } };
  });
}
function normalizeStatus(value: string | undefined): FulfillmentStatusResult["status"] {
  const s = (value || "").toUpperCase();
  if (s.includes("DELIVERED")) return "delivered";
  if (s.includes("OUT_FOR_DELIVERY")) return "out_for_delivery";
  if (s.includes("TRANSIT") || s.includes("SHIPPING")) return "in_transit";
  if (s.includes("SHIP")) return "shipped";
  if (s.includes("CANCEL")) return "cancelled";
  if (s.includes("PROCESS") || s.includes("PLANN")) return "processing";
  if (s.includes("ERROR") || s.includes("INVALID")) return "attention_required";
  return "submitted";
}

export const amazonMcfProvider: FulfillmentProvider = {
  key: "amazon_mcf",
  capabilities: { quotes: true, tracking: true, cancellation: true, inventorySync: true, cod: false },
  isEnabled: () => envFlag("AMAZON_MCF_ENABLED", false),
  validateLines(lines) { linesPayload(lines); },
  async quote(request) {
    const body = { fulfillmentConfiguration: { serviceLevel: { serviceTiers: [runtimeEnv("AMAZON_MCF_SERVICE_TIER", "STANDARD")] }, action: "SHIP", policy: "FILL_ALL_AVAILABLE" }, origin: { countryCode: runtimeEnv("AMAZON_COUNTRY_CODE", "IN") }, destination: { deliveryAddress: addressPayload(request.address) }, lineItems: linesPayload(request.lines) };
    const raw = await amazonRequest<AmazonPreviewResponse>(`${BASE}/previews`, { method: "POST", body: JSON.stringify(body) });
    const options = raw?.fulfillmentPreviews || raw?.previews || raw?.offers || [];
    const quote: FulfillmentQuote = { provider: "amazon_mcf", serviceCode: runtimeEnv("AMAZON_MCF_SERVICE_TIER", "STANDARD"), serviceName: "Amazon Multi-Channel Fulfillment", amountPaise: Math.round(Number(options?.[0]?.shippingFee?.amount || options?.[0]?.fee?.amount || 0) * 100), estimatedDelivery: options?.[0]?.estimatedArrivalDate || options?.[0]?.deliveryDate || null, raw };
    return [quote];
  },
  async create(request) {
    const body: Record<string, unknown> = { orderId: request.orderId, fulfillmentConfiguration: { serviceLevel: { serviceTiers: [request.quote?.serviceCode || runtimeEnv("AMAZON_MCF_SERVICE_TIER", "STANDARD")] }, action: "SHIP", policy: "FILL_ALL_AVAILABLE" }, origin: { countryCode: runtimeEnv("AMAZON_COUNTRY_CODE", "IN") }, destination: { deliveryAddress: addressPayload(request.address) }, lineItems: linesPayload(request.lines), channel: "D2C" };
    const raw = await amazonRequest<AmazonOrderResponse>(`${BASE}/orders`, { method: "POST", body: JSON.stringify(body) });
    return { provider: "amazon_mcf", providerOrderId: String(raw?.orderId || request.orderId), status: "submitted", raw };
  },
  async getStatus(providerOrderId) {
    const raw = await amazonRequest<AmazonStatusResponse>(`${BASE}/orders/${encodeURIComponent(providerOrderId)}`);
    const shipment: AmazonPackage = raw?.packages?.[0] || raw?.shipments?.[0] || {};
    return { provider: "amazon_mcf", providerOrderId, status: normalizeStatus(raw?.status || shipment?.status), trackingNumber: shipment?.trackingNumber || shipment?.tracking?.trackingNumber || null, trackingUrl: shipment?.trackingUrl || null, estimatedDelivery: shipment?.estimatedArrivalDate || raw?.estimatedArrivalDate || null, raw };
  },
  async cancel(providerOrderId) { await amazonRequest(`${BASE}/orders/${encodeURIComponent(providerOrderId)}/cancel`, { method: "PUT", body: "{}" }); },
  async syncInventory(providerSkus): Promise<InventorySnapshot[]> {
    const marketplaceId = runtimeEnv("AMAZON_MARKETPLACE_ID", "A21TJRUUN4KGV");
    const sellerSkus = providerSkus.map(encodeURIComponent).join(",");
    const path = `/fba/inventory/v1/summaries?granularityType=Marketplace&granularityId=${encodeURIComponent(marketplaceId)}&marketplaceIds=${encodeURIComponent(marketplaceId)}&details=true&sellerSkus=${sellerSkus}`;
    const raw = await amazonRequest<AmazonInventoryResponse>(path);
    const summaries = raw?.payload?.inventorySummaries || raw?.inventorySummaries || [];
    const capturedAt = new Date().toISOString();
    return summaries.map((summary) => ({ provider: "amazon_mcf", providerSku: String(summary.sellerSku || summary.asin || ""), availableQuantity: Number(summary?.inventoryDetails?.fulfillableQuantity || summary?.totalQuantity || 0), capturedAt, raw: summary }));
  },
};
