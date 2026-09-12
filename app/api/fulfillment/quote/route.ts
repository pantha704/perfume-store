import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { priceCart, quoteShipping } from "@/lib/checkout";
import type { CartLineInput, DeliveryAddress } from "@/lib/types";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const body = await safeJson<{ lines: CartLineInput[]; address: DeliveryAddress; provider?: string }>(request);
    if (!body) return json({ error: "Invalid request." }, 400);
    const cart = await priceCart(body.lines, body.provider);
    return json({ quote: await quoteShipping(cart, body.address) });
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Quote failed." }, 400); }
}
