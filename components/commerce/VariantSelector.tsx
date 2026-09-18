"use client";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { addToCart } from "@/lib/client/cart";
import { discountPercent, formatINR } from "@/lib/money";
import { sendEvent } from "@/components/layout/AnalyticsPageView";
import { ArrowUpRight, Minus, Plus } from "@/components/ui/Icons";

export function VariantSelector({ product }: { product: Product }) {
  const entry = useMemo(
    () => [...product.variants].filter((v) => v.available).sort((a, b) => a.pricePaise - b.pricePaise)[0],
    [product],
  );
  const initial = product.variants.find((v) => v.kind === "bottle" && v.available) || entry || product.variants[0];
  const [variantId, setVariantId] = useState(initial?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = useMemo(() => product.variants.find((v) => v.id === variantId) || initial, [product, variantId, initial]);
  if (!variant) return null;
  const perMl = variant.sizeMl ? Math.round(variant.pricePaise / variant.sizeMl / 100) * 100 : 0;

  function choose(id: string) {
    setVariantId(id); const next = product.variants.find((v) => v.id === id);
    if (next) sendEvent("size_changed", { productId: product.id, variantId: next.id, sizeMl: next.sizeMl });
  }
  function add() {
    addToCart(variant.id, quantity); setAdded(true); setTimeout(() => setAdded(false), 1600);
    sendEvent(variant.sizeMl <= 8 ? "sample_added" : "add_to_cart", { productId: product.id, variantId: variant.id, quantity });
  }

  return <div className="variant-selector">
    <div className="variant-heading"><span>Choose format</span><span>{formatINR(perMl)} / ml</span></div>
    <div className="variant-grid">{product.variants.map((v) => {
      const pct = discountPercent(v.pricePaise, v.compareAtPaise);
      return <button key={v.id} disabled={!v.available} className={v.id === variant.id ? "selected" : ""} onClick={() => choose(v.id)} aria-pressed={v.id === variant.id}>
        <span>{v.label}</span>
        <b>{formatINR(v.pricePaise)}{pct ? <s>{formatINR(v.compareAtPaise as number)}</s> : null}</b>
        <i className={pct ? "pct" : undefined}>{pct ? `−${pct}%` : v.kind === "travel" ? "entry" : v.kind}</i>
      </button>;
    })}</div>
    {variant.kind === "bottle" && entry && entry.id !== variant.id ? <button className="sample-escape" onClick={() => choose(entry.id)}>Not ready for {variant.sizeMl} ml? Start with the {entry.label} for {formatINR(entry.pricePaise)}.</button> : null}
    <div className="buy-row"><div className="quantity-control" aria-label="Quantity"><button onClick={() => setQuantity(Math.max(1,quantity-1))} aria-label="Decrease quantity"><Minus width={16}/></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(10,quantity+1))} aria-label="Increase quantity"><Plus width={16}/></button></div><button className="button dark-button add-button" onClick={add}>{added ? "Added to bag" : `Add · ${formatINR(variant.pricePaise * quantity)}`} <ArrowUpRight width={17}/></button></div>
    <p className="price-note">Inclusive of all taxes</p>
  </div>;
}
