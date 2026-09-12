"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatINR } from "@/lib/money";
import { ArrowUpRight } from "@/components/ui/Icons";

const stages=["submitted","processing","shipped","in_transit","out_for_delivery","delivered"];
export function OrderTracker({ publicId }: { publicId: string }) {
  const params=useSearchParams(); const token=params.get("token")||""; const demo=params.get("demo")==="1";
  const [order,setOrder]=useState<any>(demo?{public_id:publicId,payment_status:"paid",fulfillment_status:"processing",total_paise:0,fulfillment_provider:"manual",order_items:[]}:null);
  const [error,setError]=useState("");
  useEffect(()=>{if(demo)return;if(!token){setError("This tracking link is missing its private access token.");return;}fetch(`/api/orders/track?id=${encodeURIComponent(publicId)}&token=${encodeURIComponent(token)}`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setOrder(d.order);}).catch(e=>setError(e.message));},[demo,publicId,token]);
  if(error)return <div className="tracker-empty"><p className="kicker">Order tracking</p><h1>Link not<br/><em>recognized.</em></h1><p>{error}</p><Link className="text-link" href="/contact">Contact support</Link></div>;
  if(!order)return <div className="tracker-loading">Loading order securely…</div>;
  const idx=Math.max(0,stages.indexOf(order.fulfillment_status));
  return <div className="order-tracker"><header><p className="kicker">Order {order.public_id}</p><h1>{order.fulfillment_status==="delivered"?"It arrived.":"On its way."}</h1><p>{demo?"Demo mode — this is a safe preview and no shipment was created.":`Payment ${order.payment_status}. Fulfillment via ${String(order.fulfillment_provider||"pending").replaceAll("_"," ")}.`}</p></header><div className="tracking-line">{stages.map((stage,i)=><div key={stage} className={i<=idx?"done":""}><i/><span>{stage.replaceAll("_"," ")}</span></div>)}</div>{order.tracking_number?<div className="tracking-card"><span>Tracking</span><b>{order.tracking_number}</b>{order.tracking_url?<a href={order.tracking_url} target="_blank" rel="noreferrer">Open carrier tracking <ArrowUpRight width={15}/></a>:null}</div>:null}<div className="order-items">{(order.order_items||[]).map((item:any)=><div key={item.id}><div><b>{item.product_name}</b><span>{item.variant_label} × {item.quantity}</span></div><strong>{formatINR(item.line_total_paise)}</strong></div>)}</div><div className="order-total"><span>Total paid</span><strong>{demo?"Demo":formatINR(order.total_paise)}</strong></div><Link href="/shop" className="button dark-button">Return to collection <ArrowUpRight width={17}/></Link></div>;
}
