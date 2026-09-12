import { getProducts } from "@/lib/catalogue";
import { CartPage } from "@/components/commerce/CartPage";
export default async function Cart(){return <div className="commerce-page section-shell"><CartPage products={await getProducts()}/></div>}
