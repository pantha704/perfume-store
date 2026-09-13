import { runtimeEnv } from "@/lib/runtime-env";
import type { PaymentProvider, PaymentProviderKey } from "@/lib/payments/types";
import { mockPaymentProvider } from "@/lib/payments/providers/mock";
import { razorpayPaymentProvider } from "@/lib/payments/providers/razorpay";

const providers: Record<PaymentProviderKey, PaymentProvider> = { mock: mockPaymentProvider, razorpay: razorpayPaymentProvider };

export function configuredPaymentProviderKey(): PaymentProviderKey {
  const key = runtimeEnv("PAYMENT_PROVIDER", "mock") as PaymentProviderKey;
  return key in providers ? key : "mock";
}

export function getPaymentProvider(key?: string | null): PaymentProvider {
  const selected = (key || configuredPaymentProviderKey()) as PaymentProviderKey;
  const provider = providers[selected] || mockPaymentProvider;
  if (provider.key !== "mock" && !provider.isEnabled()) throw new Error(`${provider.key} is selected but not enabled/configured.`);
  return provider;
}

export const paymentProviderRegistry = providers;
