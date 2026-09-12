"use client";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { clearCart, readCart, type ClientCartLine } from "@/lib/client/cart";
import { formatINR } from "@/lib/money";
import { sendEvent } from "@/components/layout/AnalyticsPageView";
import { TurnstileWidget } from "@/components/commerce/TurnstileWidget";
import { ArrowUpRight } from "@/components/ui/Icons";

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (response: unknown) => void) => void } }
}

export function CheckoutForm({ products, turnstileSiteKey }: { products: Product[]; turnstileSiteKey?: string }) {
  const router = useRouter();
  const [cart,setCart]=useState<ClientCartLine[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [token,setToken]=useState("");
  const [gift,setGift]=useState(false);
  const [applyCredit,setApplyCredit]=useState(true);
  useEffect(()=>{setCart(readCart()); sendEvent("checkout_start",{});},[]);
  const lines=useMemo(()=>cart.map((line)=>{for(const product of products){const variant=product.variants.find((v)=>v.id===line.variantId);if(variant)return{...line,product,variant};}return null;}).filter(Boolean) as Array<ClientCartLine&{product:Product;variant:Product["variants"][number]}>,[cart,products]);
  const subtotal=lines.reduce((s,l)=>s+l.variant.pricePaise*l.quantity,0);
  const onTurnstile=useCallback((value:string)=>setToken(value),[]);

  async function submit(formData: FormData) {
    setLoading(true); setError("");
    try {
      if (!cart.length) throw new Error("Your bag is empty.");
      const address = { name:String(formData.get("name")||""), phone:String(formData.get("phone")||""), email:String(formData.get("email")||""), addressLine1:String(formData.get("address1")||""), addressLine2:String(formData.get("address2")||""), city:String(formData.get("city")||""), state:String(formData.get("state")||""), postalCode:String(formData.get("postalCode")||""), countryCode:"IN" as const };
      const response=await fetch("/api/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({lines:cart,address,gift:{isGift:gift,note:gift?String(formData.get("giftNote")||""):undefined,hidePriceOnPackingSlip:gift},applyCredit,turnstileToken:token})});
      const data=await response.json(); if(!response.ok) throw new Error(data.error||"Checkout failed.");
      if(data.mode==="demo"){clearCart(); router.push(`/order/${encodeURIComponent(data.publicId)}?token=${encodeURIComponent(data.guestToken)}&demo=1`); return;}
      if(!window.Razorpay) throw new Error("Payment checkout did not load. Please refresh and retry.");
      sendEvent("payment_started",{orderId:data.publicId,amountPaise:data.amountPaise});
      const rz=new window.Razorpay({key:data.keyId,amount:data.amountPaise,currency:"INR",name:"Velora",description:"Fragrance order",order_id:data.razorpayOrderId,prefill:{name:address.name,email:address.email,contact:address.phone},theme:{color:"#12100e"},handler:async(result:any)=>{
        const verify=await fetch("/api/payments/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({orderId:data.orderId,...result})});
        if(!verify.ok){const p=await verify.json();setError(p.error||"Payment verification failed. Contact support before retrying.");return;}
        clearCart(); sendEvent("purchase",{orderId:data.publicId,amountPaise:data.amountPaise}); router.push(`/order/${encodeURIComponent(data.publicId)}?token=${encodeURIComponent(data.guestToken)}`);
      }});
      rz.on("payment.failed",()=>{sendEvent("payment_failed",{orderId:data.publicId});setError("Payment was not completed. No new order will be submitted to fulfillment until payment verifies.");});
      rz.open();
    } catch(e){setError(e instanceof Error?e.message:"Checkout failed.");} finally{setLoading(false);}
  }

  return <div className="checkout-layout"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/><form className="checkout-form" action={submit}><header><p className="kicker">Secure checkout</p><h1>Where should<br/><em>it arrive?</em></h1><p>Your browser never decides price or stock. We re-check every variant on the server before payment.</p></header>
    <fieldset><legend>Contact</legend><div className="field-grid"><label>Full name<input name="name" autoComplete="name" required/></label><label>Phone<input name="phone" inputMode="tel" autoComplete="tel" required/></label><label className="wide">Email<input name="email" type="email" autoComplete="email" required/></label></div></fieldset>
    <fieldset><legend>Delivery address</legend><div className="field-grid"><label className="wide">Address<input name="address1" autoComplete="address-line1" required/></label><label className="wide">Apartment / landmark <span>optional</span><input name="address2" autoComplete="address-line2"/></label><label>City<input name="city" autoComplete="address-level2" required/></label><label>State<input name="state" autoComplete="address-level1" required/></label><label>PIN code<input name="postalCode" inputMode="numeric" pattern="[1-9][0-9]{5}" autoComplete="postal-code" required/></label><label>Country<input value="India" readOnly aria-label="Country"/></label></div></fieldset>
    <fieldset><legend>Details</legend><label className="check-row"><input type="checkbox" checked={gift} onChange={(e)=>setGift(e.target.checked)}/><span><b>This is a gift</b><small>Hide prices from the packing slip and add a note.</small></span></label>{gift?<label className="gift-note">Gift note<textarea name="giftNote" rows={3} maxLength={240} placeholder="Write something human."/></label>:null}<label className="check-row"><input type="checkbox" checked={applyCredit} onChange={(e)=>setApplyCredit(e.target.checked)}/><span><b>Apply available discovery-set credit</b><small>Matched securely to this checkout email.</small></span></label></fieldset>
    <TurnstileWidget siteKey={turnstileSiteKey} onToken={onTurnstile}/>{error?<p className="form-error" role="alert">{error}</p>:null}<button className="button dark-button checkout-submit" type="submit" disabled={loading}>{loading?"Checking stock…":"Continue to secure payment"}<ArrowUpRight width={17}/></button><p className="checkout-fine">Payment is processed by Razorpay. Live fulfillment stays disabled unless the deployment explicitly enables a configured provider.</p>
  </form><aside className="checkout-summary"><p className="kicker">Your edit · {String(lines.length).padStart(2,"0")}</p>{lines.map(({product,variant,quantity})=><div className="checkout-item" key={variant.id}><span>{quantity}×</span><div><b>{product.name}</b><small>{variant.label}</small></div><strong>{formatINR(variant.pricePaise*quantity)}</strong></div>)}<hr/><div className="checkout-subtotal"><span>Subtotal</span><strong>{formatINR(subtotal)}</strong></div><p>Delivery and eligible store credit are calculated server-side before Razorpay opens.</p></aside></div>;
}
