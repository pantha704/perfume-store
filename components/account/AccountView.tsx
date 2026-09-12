"use client";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/money";

export function AccountView({ profile, orders, addresses, credits }: { profile:any; orders:any[]; addresses:any[]; credits:any[] }) {
  async function signOut(){const c=createClient();await c?.auth.signOut();window.location.reload();}
  return <div className="account-view"><header><div><p className="kicker">Account</p><h1>Welcome back,<br/><em>{profile?.full_name||"collector"}.</em></h1></div><button className="text-button" onClick={signOut}>Sign out</button></header><div className="account-grid"><section><p className="kicker">Recent orders</p>{orders.length?orders.map((order)=><article className="account-order" key={order.id}><div><b>{order.public_id}</b><span>{new Date(order.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span></div><div><span>{String(order.fulfillment_status).replaceAll("_"," ")}</span><strong>{formatINR(order.total_paise)}</strong></div></article>):<p className="account-empty">No orders yet.</p>}</section><aside><div className="account-box"><p className="kicker">Discovery credit</p><strong>{formatINR(credits.reduce((s,c)=>s+Number(c.remaining_paise||0),0))}</strong><span>available toward a full bottle</span></div><div className="account-box"><p className="kicker">Saved addresses</p><strong>{addresses.length}</strong><span>{addresses[0]?.city?`Primary · ${addresses[0].city}`:"Add one during checkout"}</span></div></aside></div></div>;
}
