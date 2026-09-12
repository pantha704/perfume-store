import { Suspense } from "react";
import { OrderTracker } from "@/components/commerce/OrderTracker";
export default async function OrderPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <div className="commerce-page section-shell"><Suspense fallback={<div className="tracker-loading">Loading secure tracking…</div>}><OrderTracker publicId={decodeURIComponent(id)}/></Suspense></div>}
