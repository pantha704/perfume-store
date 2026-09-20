import type { Metadata } from "next";
import { getProducts } from "@/lib/catalogue";
import { ProductCard } from "@/components/product/ProductCard";
import { FamilyFilter } from "@/components/commerce/FamilyFilter";
import { OfferBand } from "@/components/cinematic/OfferBand";
export const metadata:Metadata={title:{absolute:"Relapse Perfumes"},description:"Explore the Relapse fragrance collection by family, format and atmosphere."};
export default async function ShopPage(){const products=(await getProducts()).filter(p=>!p.isDiscoverySet);return <><OfferBand/><div className="shop-page section-shell"><header className="shop-header"><div data-reveal="up"><p className="kicker">The collection · {String(products.length).padStart(2,"0")}</p><h1>Choose the<br/><em>temperature.</em></h1></div><div data-reveal="up" data-reveal-delay="0.08"><p>Not by gender. Not by occasion labels first. Start with the kind of air you want around you, then decide how much of it you want to carry.</p><p className="shop-note">Every scent starts at 8 ml — ₹99. Full formats to 50 ml, set of five for ₹399.</p></div></header><FamilyFilter products={products}/><div className="shop-grid">{products.map((product,index)=><ProductCard key={product.id} product={product} index={index} feature={index%5===0} reveal="up" revealDelay={(index%3)*0.07} parallax={index%5===0 ? 0.06 : undefined}/>)}</div></div></>}
