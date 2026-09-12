import type { FulfillmentProvider } from "@/lib/fulfillment/types";

export const manualProvider: FulfillmentProvider = {
  key: "manual",
  capabilities: { quotes: false, tracking: false, cancellation: false, inventorySync: false, cod: true },
  isEnabled: () => true,
  async quote() { return [{ provider: "manual", serviceCode: "MANUAL", serviceName: "Standard delivery", amountPaise: 0, estimatedDelivery: null }]; },
  async create(request) { return { provider: "manual", providerOrderId: request.orderId, status: "processing" }; },
  async getStatus(providerOrderId) { return { provider: "manual", providerOrderId, status: "processing" }; },
  async cancel() { return; },
};
