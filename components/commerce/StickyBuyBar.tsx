"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { addToCart } from "@/lib/client/cart";
import { formatINR } from "@/lib/money";

export function StickyBuyBar({ product }: { product: Product }) {
  const variant = product.variants.find((v)=>v.kind==="bottle"&&v.available) || product.variants.find((v)=>v.available);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{ const on=()=>setVisible(window.scrollY>window.innerHeight*.8); on(); window.addEventListener("scroll",on,{passive:true}); return()=>window.removeEventListener("scroll",on);},[]);
  if(!variant) return null;
  return <div className={`sticky-buy ${visible?"visible":""}`}><div><span>{product.name}</span><small>{variant.label} · {formatINR(variant.pricePaise)}</small></div><button onClick={()=>addToCart(variant.id,1)}>Add to bag</button></div>;
}
