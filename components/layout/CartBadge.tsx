"use client";
import { useEffect, useState } from "react";
import { CART_EVENT, readCart } from "@/lib/client/cart";

export function CartBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readCart().reduce((sum, line) => sum + line.quantity, 0));
    update(); window.addEventListener(CART_EVENT, update); window.addEventListener("storage", update);
    return () => { window.removeEventListener(CART_EVENT, update); window.removeEventListener("storage", update); };
  }, []);
  return <span className="cart-count" aria-label={`${count} items in cart`}>{String(count).padStart(2,"0")}</span>;
}
