import { createHmac, timingSafeEqual } from "node:crypto";
import { envFlag, runtimeEnv } from "@/lib/runtime-env";
import type { CheckoutPaymentRequest, CheckoutPaymentResult, CheckoutVerificationInput, ParsedWebhook, PaymentProvider } from "@/lib/payments/types";

const razorpayBase = "https://api.razorpay.com/v1";

function credentials() {
  const keyId = runtimeEnv("RAZORPAY_KEY_ID");
  const keySecret = runtimeEnv("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) throw new Error("Razorpay credentials are not configured.");
  return { keyId, keySecret };
}

async function razorpayRequest<T>(path: string, init: RequestInit): Promise<T> {
  const { keyId, keySecret } = credentials();
  const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
  const response = await fetch(`${razorpayBase}${path}`, {
    ...init,
    cache: "no-store",
    headers: { authorization, "content-type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) throw new Error(`Razorpay ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  return payload as T;
}

export async function createRazorpayOrder(input: { amountPaise: number; receipt: string; notes?: Record<string, string> }) {
  return razorpayRequest<{ id: string; amount: number; currency: string; status: string }>("/orders", {
    method: "POST",
    body: JSON.stringify({ amount: input.amountPaise, currency: "INR", receipt: input.receipt.slice(0, 40), notes: input.notes || {} }),
  });
}

export async function createRazorpayRefund(paymentId: string, amountPaise?: number) {
  return razorpayRequest<{ id: string; status: string }>(`/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: "POST",
    body: JSON.stringify(amountPaise ? { amount: amountPaise } : {}),
  });
}

function secureHexEqual(a: string, b: string): boolean {
  try {
    const aa = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    return aa.length === bb.length && timingSafeEqual(aa, bb);
  } catch { return false; }
}

export function verifyCheckoutSignature(input: { razorpayOrderId: string; razorpayPaymentId: string; signature: string }): boolean {
  const secret = runtimeEnv("RAZORPAY_KEY_SECRET");
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`).digest("hex");
  return secureHexEqual(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = runtimeEnv("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return secureHexEqual(expected, signature);
}

export function publicRazorpayKey(): string { return runtimeEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID", runtimeEnv("RAZORPAY_KEY_ID")); }

interface RazorpayWebhookPayload { event?: string; created_at?: number; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } }

export const razorpayPaymentProvider: PaymentProvider = {
  key: "razorpay",
  isLive: () => true,
  isEnabled: () => envFlag("PAYMENTS_LIVE_ENABLED", false) && !!runtimeEnv("RAZORPAY_KEY_ID") && !!runtimeEnv("RAZORPAY_KEY_SECRET"),
  async createCheckout(request: CheckoutPaymentRequest): Promise<CheckoutPaymentResult> {
    const order = await createRazorpayOrder({ amountPaise: request.amountPaise, receipt: request.publicId, notes: request.notes });
    return { providerOrderId: order.id, publicKey: publicRazorpayKey(), mode: "live" };
  },
  verifyCheckout(input: CheckoutVerificationInput): boolean {
    return verifyCheckoutSignature({ razorpayOrderId: input.providerOrderId, razorpayPaymentId: input.paymentId, signature: input.signature });
  },
  parseWebhook(rawBody: string, signature: string, headers?: Headers): ParsedWebhook | null {
    if (!verifyWebhookSignature(rawBody, signature)) return null;
    let event: RazorpayWebhookPayload;
    try { event = JSON.parse(rawBody) as RazorpayWebhookPayload; } catch { return null; }
    const payment = event?.payload?.payment?.entity;
    const eventType = event.event || "unknown";
    const eventId = headers?.get("x-razorpay-event-id") || String(payment?.id || `${eventType}:${event.created_at || "unknown"}`);
    return { eventId, eventType, paymentId: payment?.id, providerOrderId: payment?.order_id, succeeded: ["payment.captured", "order.paid"].includes(eventType), failed: eventType === "payment.failed", raw: event };
  },
};
