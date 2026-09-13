import { json, safeJson } from "@/lib/http";
import { assertAllowedMutationOrigin } from "@/lib/security";
import { priceCart, quoteShipping } from "@/lib/checkout";
import { createPendingOrder, attachPaymentOrder } from "@/lib/order-service";
import { getPaymentProvider } from "@/lib/payments";
import { authenticatedUser } from "@/lib/auth-server";
import { isDemoMode } from "@/lib/runtime-env";
import { verifyTurnstile } from "@/lib/turnstile";
import type { CartLineInput, DeliveryAddress, GiftOptions } from "@/lib/types";

export const runtime = "nodejs";

type Body = { lines: CartLineInput[]; address: DeliveryAddress; provider?: string; gift?: GiftOptions; applyCredit?: boolean; turnstileToken?: string };

function validAddress(a: DeliveryAddress | undefined): a is DeliveryAddress {
  return !!a && [a.name,a.phone,a.email,a.addressLine1,a.city,a.state,a.postalCode].every((v) => typeof v === "string" && v.trim().length > 1) && /^[1-9][0-9]{5}$/.test(a.postalCode) && /@/.test(a.email) && a.countryCode === "IN";
}

export async function POST(request: Request) {
  try {
    assertAllowedMutationOrigin(request);
    const body = await safeJson<Body>(request);
    if (!body || !validAddress(body.address)) return json({ error: "Please provide a complete Indian delivery address." }, 400);
    if (!(await verifyTurnstile(body.turnstileToken || "", request.headers.get("cf-connecting-ip") || undefined))) return json({ error: "Bot verification failed. Please retry." }, 400);

    const cart = await priceCart(body.lines, body.provider);
    const quote = await quoteShipping(cart, body.address);
    const user = await authenticatedUser();
    const pending = await createPendingOrder({ cart, address: body.address, quote, userId: user?.id, gift: body.gift, applyCredit: body.applyCredit });

    if (isDemoMode()) {
      return json({ mode: "demo", orderId: pending.id, publicId: pending.publicId, guestToken: pending.guestToken, amountPaise: pending.totalPaise, creditAppliedPaise: pending.creditAppliedPaise, shipping: quote, keyId: "demo" });
    }
    if (pending.totalPaise === 0) return json({ error: "Zero-value orders require manual approval." }, 409);
    const provider = getPaymentProvider();
    const payment = await provider.createCheckout({ orderId: pending.id, publicId: pending.publicId, amountPaise: pending.totalPaise, notes: { internalOrderId: pending.id, publicId: pending.publicId } });
    await attachPaymentOrder(pending.id, payment.providerOrderId, provider.key);
    return json({ mode: payment.mode, provider: provider.key, orderId: pending.id, publicId: pending.publicId, guestToken: pending.guestToken, amountPaise: pending.totalPaise, creditAppliedPaise: pending.creditAppliedPaise, shipping: quote, keyId: payment.publicKey, providerOrderId: payment.providerOrderId });
  } catch (error) {
    console.error("checkout", error);
    return json({ error: error instanceof Error ? error.message : "Checkout failed." }, 400);
  }
}
