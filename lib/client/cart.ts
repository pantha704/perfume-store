"use client";

export interface ClientCartLine { variantId: string; quantity: number }
const KEY = "relapse-cart-v2";
const EVENT = "relapse:cart";

export function readCart(): ClientCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]") as ClientCartLine[];
    return Array.isArray(parsed) ? parsed.filter((x) => x?.variantId && Number.isInteger(x.quantity) && x.quantity > 0).slice(0, 30) : [];
  } catch { return []; }
}

export function writeCart(lines: ClientCartLine[]) {
  if (typeof window === "undefined") return;
  const normalized = lines.filter((x) => x.variantId && x.quantity > 0).map((x) => ({ variantId: x.variantId, quantity: Math.min(10, Math.max(1, Math.floor(x.quantity))) }));
  window.localStorage.setItem(KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function addToCart(variantId: string, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((line) => line.variantId === variantId);
  if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
  else cart.push({ variantId, quantity: Math.min(10, Math.max(1, quantity)) });
  writeCart(cart);
}

export function removeFromCart(variantId: string) { writeCart(readCart().filter((line) => line.variantId !== variantId)); }
export function clearCart() { writeCart([]); }
export const CART_EVENT = EVENT;

const EMPTY_CART: ClientCartLine[] = [];
let snapshot: ClientCartLine[] | null = null;

export function subscribeCart(onChange: () => void) {
  const update = () => { snapshot = null; onChange(); };
  window.addEventListener(EVENT, update);
  window.addEventListener("storage", update);
  return () => { window.removeEventListener(EVENT, update); window.removeEventListener("storage", update); };
}

export function getCartSnapshot(): ClientCartLine[] {
  if (snapshot === null) snapshot = readCart();
  return snapshot;
}

export function getServerCartSnapshot(): ClientCartLine[] { return EMPTY_CART; }
