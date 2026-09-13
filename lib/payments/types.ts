export type PaymentProviderKey = "mock" | "razorpay";

export interface CheckoutPaymentRequest {
  orderId: string;
  publicId: string;
  amountPaise: number;
  notes?: Record<string, string>;
}

export interface CheckoutPaymentResult {
  providerOrderId: string;
  publicKey: string | null;
  mode: "live" | "mock";
}

export interface CheckoutVerificationInput {
  providerOrderId: string;
  paymentId: string;
  signature: string;
}

export interface ParsedWebhook {
  eventId: string;
  eventType: string;
  paymentId?: string;
  providerOrderId?: string;
  succeeded: boolean;
  failed: boolean;
  raw: unknown;
}

export interface PaymentProvider {
  readonly key: PaymentProviderKey;
  isEnabled(): boolean;
  isLive(): boolean;
  createCheckout(request: CheckoutPaymentRequest): Promise<CheckoutPaymentResult>;
  verifyCheckout(input: CheckoutVerificationInput): boolean;
  parseWebhook(rawBody: string, signature: string, headers?: Headers): ParsedWebhook | null;
}
