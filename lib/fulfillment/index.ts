import { runtimeEnv } from "@/lib/runtime-env";
import type { FulfillmentProvider, FulfillmentProviderKey } from "@/lib/fulfillment/types";
import { amazonMcfProvider } from "@/lib/fulfillment/providers/amazon-mcf";
import { shiprocketProvider } from "@/lib/fulfillment/providers/shiprocket";
import { manualProvider } from "@/lib/fulfillment/providers/manual";

const providers: Record<FulfillmentProviderKey, FulfillmentProvider> = { amazon_mcf: amazonMcfProvider, shiprocket: shiprocketProvider, manual: manualProvider };

export function configuredProviderKey(): FulfillmentProviderKey {
  const key = runtimeEnv("DEFAULT_FULFILLMENT_PROVIDER", "manual") as FulfillmentProviderKey;
  return key in providers ? key : "manual";
}

export function getFulfillmentProvider(key?: string | null): FulfillmentProvider {
  const selected = (key || configuredProviderKey()) as FulfillmentProviderKey;
  const provider = providers[selected] || manualProvider;
  if (provider.key !== "manual" && !provider.isEnabled()) throw new Error(`${provider.key} is selected but not enabled/configured.`);
  return provider;
}

export const fulfillmentProviderRegistry = providers;
