"use client";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { addToCart } from "@/lib/client/cart";
import { formatINR } from "@/lib/money";
import { sendEvent } from "@/components/layout/AnalyticsPageView";
import { ArrowUpRight, Minus, Plus } from "@/components/ui/Icons";

export function VariantSelector({ product }: { product: Product }) {
  const initial = product.variants.find((v) => v.kind === "bottle" && v.available) || product.variants.find((v) => v.available) || product.variants[0];
  const [variantId, setVariantId] = useState(initial?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = useMemo(() => product.variants.find((v) => v.id === variantId) || initial, [product, variantId, initial]);
  if (!variant) return null;
  const perMl = variant.sizeMl ? Math.round(variant.pricePaise / variant.sizeMl / 100) * 100 : 0;
  const sample = product.variants.find((v) => v.kind === "sample" && v.available);

  function choose(id: string) {
    setVariantId(id); const next = product.variants.find((v) => v.id === id);
    if (next) sendEvent("size_changed", { productId: product.id, variantId: next.id, sizeMl: next.sizeMl });
  }
  function add() {
    addToCart(variant.id, quantity); setAdded(true); setTimeout(() => setAdded(false), 1600);
    sendEvent(variant.kind === "sample" ? "sample_added" : "add_to_cart", { productId: product.id, variantId: variant.id, quantity });
  }
  return <div className="variant-selector">
    <div className="variant-heading"><span>Choose format</span><span>{formatINR(perMl)} / ml</span></div>
    <div className="variant-grid">{product.variants.map((v) => <button key={v.id} disabled={!v.available} className={v.id === variant.id ? "selected" : ""} onClick={() => choose(v.id)} aria-pressed={v.id === variant.id}><span>{v.label}</span><b>{formatINR(v.pricePaise)}</b><i>{v.kind === "sample" ? "try first" : v.kind}</i></button>)}</div>
    {variant.kind === "bottle" && sample ? <button className="sample-escape" onClick={() => choose(sample.id)}>Not ready for {variant.sizeMl} ml? Start with the {sample.label} for {formatINR(sample.pricePaise)}.</button> : null}
    <div className="buy-row"><div className="quantity-control" aria-label="Quantity"><button onClick={() => setQuantity(Math.max(1,quantity-1))} aria-label="Decrease quantity"><Minus width={16}/></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(10,quantity+1))} aria-label="Increase quantity"><Plus width={16}/></button></div><button className="button dark-button add-button" onClick={add}>{added ? "Added to bag" : `Add · ${formatINR(variant.pricePaise * quantity)}`} <ArrowUpRight width={17}/></button></div>
  </div>;
}
