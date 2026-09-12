import { createHmac, timingSafeEqual } from "node:crypto";
import { runtimeEnv } from "@/lib/runtime-env";

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
