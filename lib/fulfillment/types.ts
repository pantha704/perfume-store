import type { DeliveryAddress, FulfillmentState } from "@/lib/types";

export type FulfillmentProviderKey = "amazon_mcf" | "shiprocket" | "manual";

export interface FulfillmentLine {
  lineId: string;
  variantId: string;
  sku: string;
  providerSku?: string;
  inventorySku?: string;
  name: string;
  quantity: number;
  unitPricePaise: number;
  weightGrams?: number;
}

export interface FulfillmentQuoteRequest { orderId?: string; address: DeliveryAddress; lines: FulfillmentLine[]; }
export interface FulfillmentQuote {
  provider: FulfillmentProviderKey;
  serviceCode: string;
  serviceName: string;
  amountPaise: number;
  estimatedDelivery?: string | null;
  expiresAt?: string | null;
  raw?: unknown;
}
export interface CreateFulfillmentRequest extends FulfillmentQuoteRequest {
  orderId: string;
  quote?: FulfillmentQuote | null;
  paymentMethod: "prepaid" | "cod";
  currency: "INR";
  gift?: { note?: string; hidePriceOnPackingSlip?: boolean };
}
export interface FulfillmentCreateResult {
  provider: FulfillmentProviderKey;
  providerOrderId: string;
  status: Extract<FulfillmentState, "submitted" | "processing" | "attention_required">;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  raw?: unknown;
}
export interface FulfillmentStatusResult {
  provider: FulfillmentProviderKey;
  providerOrderId: string;
  status: Exclude<FulfillmentState, "unfulfilled">;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  raw?: unknown;
}
export interface InventorySnapshot { provider: FulfillmentProviderKey; providerSku: string; availableQuantity: number; capturedAt: string; raw?: unknown; }

export interface FulfillmentProvider {
  readonly key: FulfillmentProviderKey;
  readonly capabilities: { quotes: boolean; tracking: boolean; cancellation: boolean; inventorySync: boolean; cod: boolean; };
  isEnabled(): boolean;
  validateLines?(lines: FulfillmentLine[]): void;
  quote(request: FulfillmentQuoteRequest): Promise<FulfillmentQuote[]>;
  create(request: CreateFulfillmentRequest): Promise<FulfillmentCreateResult>;
  getStatus(providerOrderId: string): Promise<FulfillmentStatusResult>;
  cancel(providerOrderId: string): Promise<void>;
  syncInventory?(providerSkus: string[]): Promise<InventorySnapshot[]>;
}
