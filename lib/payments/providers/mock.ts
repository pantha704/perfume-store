import { envFlag } from "@/lib/runtime-env";
import type { CheckoutPaymentResult, CheckoutVerificationInput, ParsedWebhook, PaymentProvider } from "@/lib/payments/types";

/**
 * Synthetic provider used for test/staging QA until the client's merchant
 * gateway is chosen. It exercises the full checkout -> verify -> order
 * lifecycle with fake data and never contacts an external service.
 *
 * Safety: opt-in via MOCK_PAYMENTS_ENABLED and forcibly disabled whenever the
 * deployment is configured to take real payments or submit real fulfillment,
 * so a mock "paid" order can never coexist with live money or live shipping.
 */
export const mockPaymentProvider: PaymentProvider = {
  key: "mock",
  isLive: () => false,
  isEnabled: () => envFlag("MOCK_PAYMENTS_ENABLED", false) && !envFlag("PAYMENTS_LIVE_ENABLED", false) && !envFlag("FULFILLMENT_LIVE_ENABLED", false),
  async createCheckout(): Promise<CheckoutPaymentResult> {
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    return { providerOrderId: `mock_order_${id}`, publicKey: null, mode: "mock" };
  },
  verifyCheckout(input: CheckoutVerificationInput): boolean {
    return input.providerOrderId.startsWith("mock_order_") && input.signature.startsWith("mock_");
  },
  parseWebhook(rawBody: string): ParsedWebhook | null {
    try {
      const body = JSON.parse(rawBody) as { id?: string; type?: string };
      return { eventId: body.id || `mock:${Date.now()}`, eventType: body.type || "mock", succeeded: body.type === "payment.captured", failed: body.type === "payment.failed", raw: body };
    } catch { return null; }
  },
};
