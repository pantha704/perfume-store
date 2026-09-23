import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getProducts } from "@/lib/catalogue";
import { isDemoMode } from "@/lib/runtime-env";
import { getAdminReviewQueue, getContactMessages } from "@/lib/reviews";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ArrowUpRight } from "@/components/ui/Icons";
export default async function AdminPage(){const actor=await requireAdmin();if(!actor)return <div className="forbidden section-shell"><p className="kicker">Admin</p><h1>Restricted.</h1><p>Sign in with an account whose profile role is admin.</p><Link href="/account" className="inline-arrow">Go to sign in <ArrowUpRight width={16}/></Link></div>;const demo=isDemoMode();const admin=getAdminSupabase();const orders=!demo&&admin?(await admin.from("orders").select("id,public_id,customer_name,email,total_paise,payment_status,fulfillment_status,created_at").order("created_at",{ascending:false}).limit(50)).data||[]:[];const [reviews,messages]=await Promise.all([getAdminReviewQueue(),getContactMessages()]);return <div className="admin-page section-shell"><AdminDashboard products={await getProducts()} orders={orders} reviews={reviews} messages={messages} demo={demo}/></div>}
