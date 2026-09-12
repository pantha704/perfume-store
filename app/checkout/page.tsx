import { getProducts } from "@/lib/catalogue";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
export default async function CheckoutPage(){return <div className="commerce-page section-shell"><CheckoutForm products={await getProducts()} turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}/></div>}
