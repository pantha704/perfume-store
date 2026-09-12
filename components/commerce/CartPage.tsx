"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { CART_EVENT, readCart, removeFromCart, writeCart, type ClientCartLine } from "@/lib/client/cart";
import { formatINR } from "@/lib/money";
import { ArrowUpRight, Minus, Plus } from "@/components/ui/Icons";

export function CartPage({ products }: { products: Product[] }) {
  const [cart,setCart]=useState<ClientCartLine[]>([]);
  useEffect(()=>{const update=()=>setCart(readCart()); update(); window.addEventListener(CART_EVENT,update); return()=>window.removeEventListener(CART_EVENT,update);},[]);
  const lines=useMemo(()=>cart.map((line)=>{for(const product of products){const variant=product.variants.find((v)=>v.id===line.variantId);if(variant)return{...line,product,variant};}return null;}).filter(Boolean) as Array<ClientCartLine & {product:Product;variant:Product["variants"][number]}>,[cart,products]);
  const subtotal=lines.reduce((s,l)=>s+l.variant.pricePaise*l.quantity,0);
  function qty(id:string,q:number){writeCart(cart.map((line)=>line.variantId===id?{...line,quantity:Math.min(10,Math.max(1,q))}:line));}
  if(!lines.length) return <div className="empty-cart"><p className="kicker">Your bag · 00</p><h1>Nothing here<br/><em>yet.</em></h1><p>Start with a sample if you do not know what your skin will do to the scent.</p><Link href="/samples" className="button dark-button">Browse samples <ArrowUpRight width={17}/></Link></div>;
  return <div className="cart-layout"><div className="cart-lines"><header><p className="kicker">Your bag · {String(lines.length).padStart(2,"0")}</p><h1>Chosen<br/><em>for skin.</em></h1></header>{lines.map(({product,variant,quantity})=><article className="cart-line" key={variant.id}><div className="cart-thumb" style={{"--accent":product.accent} as React.CSSProperties}><Image src={product.image} alt="" width={180} height={220}/></div><div className="cart-line-main"><p>{product.family} · {product.concentration}</p><h2>{product.name}</h2><span>{variant.label}</span><button className="remove-link" onClick={()=>removeFromCart(variant.id)}>Remove</button></div><div className="cart-line-side"><b>{formatINR(variant.pricePaise*quantity)}</b><div className="quantity-control"><button onClick={()=>qty(variant.id,quantity-1)}><Minus width={14}/></button><span>{quantity}</span><button onClick={()=>qty(variant.id,quantity+1)}><Plus width={14}/></button></div></div></article>)}</div><aside className="cart-summary"><p className="kicker">Order summary</p><div><span>Subtotal</span><b>{formatINR(subtotal)}</b></div><div><span>Delivery</span><b>calculated at checkout</b></div><hr/><div className="cart-total"><span>Estimated total</span><strong>{formatINR(subtotal)}</strong></div><p>Prices include applicable taxes. Any discovery-set credit is checked securely at checkout.</p><Link href="/checkout" className="button dark-button full-button">Continue to checkout <ArrowUpRight width={17}/></Link><Link href="/shop" className="continue-link">Continue browsing</Link></aside></div>;
}
