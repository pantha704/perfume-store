import { getVariantsByIds } from "@/lib/catalogue";
import { getFulfillmentProvider, configuredProviderKey } from "@/lib/fulfillment";
import type { FulfillmentLine, FulfillmentProviderKey, FulfillmentQuote } from "@/lib/fulfillment/types";
import type { CartLineInput, DeliveryAddress, Product, ProductVariant } from "@/lib/types";
import { envFlag, runtimeEnv } from "@/lib/runtime-env";

export interface PricedLine {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
  providerSku?: string;
  inventorySku?: string;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotalPaise: number;
  provider: FulfillmentProviderKey;
}

function clampQuantity(qty: number) {
  if (!Number.isSafeInteger(qty) || qty < 1 || qty > 10) throw new Error("Quantity must be between 1 and 10.");
  return qty;
}

export async function priceCart(inputs: CartLineInput[], requestedProvider?: string | null): Promise<PricedCart> {
  if (!Array.isArray(inputs) || inputs.length < 1 || inputs.length > 30) throw new Error("Cart must contain between 1 and 30 lines.");
  const normalized = inputs.map((line) => ({ variantId: String(line.variantId || ""), quantity: clampQuantity(Number(line.quantity)) }));
  const uniqueIds = [...new Set(normalized.map((line) => line.variantId))];
  const records = await getVariantsByIds(uniqueIds);
  if (records.length !== uniqueIds.length) throw new Error("One or more variants are no longer available.");

  const provider = (requestedProvider || configuredProviderKey()) as FulfillmentProviderKey;
  const priced: PricedLine[] = normalized.map((input) => {
    const record = records.find((r) => r.variant.id === input.variantId);
    if (!record || !record.variant.available) throw new Error("A selected variant is unavailable.");
    const mapping = provider === "manual"
      ? record.variant.fulfillmentMappings.find((m) => m.provider === "manual" && m.enabled)
      : record.variant.fulfillmentMappings.find((m) => m.provider === provider && m.enabled);
    if (!mapping) throw new Error(`${record.product.name} ${record.variant.label} is not configured for ${provider}.`);
    return {
      product: record.product,
      variant: record.variant,
      quantity: input.quantity,
      unitPricePaise: record.variant.pricePaise,
      lineTotalPaise: record.variant.pricePaise * input.quantity,
      providerSku: mapping.providerSku,
      inventorySku: mapping.inventorySku,
    };
  });
  return { lines: priced, subtotalPaise: priced.reduce((sum, line) => sum + line.lineTotalPaise, 0), provider };
}

export function toFulfillmentLines(cart: PricedCart): FulfillmentLine[] {
  return cart.lines.map((line) => ({
    lineId: line.variant.id,
    variantId: line.variant.id,
    sku: line.variant.sku,
    providerSku: line.providerSku,
    inventorySku: line.inventorySku,
    name: `${line.product.name} — ${line.variant.label}`,
    quantity: line.quantity,
    unitPricePaise: line.unitPricePaise,
    weightGrams: line.variant.weightGrams,
  }));
}

export async function quoteShipping(cart: PricedCart, address: DeliveryAddress): Promise<FulfillmentQuote> {
  const fallback: FulfillmentQuote = {
    provider: cart.provider,
    serviceCode: "STANDARD",
    serviceName: "Standard delivery",
    amountPaise: Number(runtimeEnv("FALLBACK_SHIPPING_PAISE", "0")) || 0,
    estimatedDelivery: null,
  };
  if (!envFlag("FULFILLMENT_LIVE_ENABLED", false)) return fallback;
  const fulfillment = getFulfillmentProvider(cart.provider);
  fulfillment.validateLines?.(toFulfillmentLines(cart));
  const quotes = await fulfillment.quote({ address, lines: toFulfillmentLines(cart) });
  return quotes.sort((a, b) => a.amountPaise - b.amountPaise)[0] || fallback;
}
