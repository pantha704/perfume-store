import type { CheckoutPaymentResult, CheckoutVerificationInput, ParsedWebhook, PaymentProvider } from "@/lib/payments/types";

/**
 * Synthetic provider used until the client's merchant gateway is chosen.
 * It exercises the full checkout -> verify -> order lifecycle with fake data
 * and never contacts an external service. Mock payments are never "live".
 */
export const mockPaymentProvider: PaymentProvider = {
  key: "mock",
  isLive: () => false,
  isEnabled: () => true,
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
