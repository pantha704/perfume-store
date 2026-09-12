import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowUpRight } from "@/components/ui/Icons";

export function FeaturedEdit({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.featured && !p.isDiscoverySet).slice(0, 3);
  return <section className="featured-edit section-shell">
    <header className="editorial-heading"><p className="kicker">The current edit · 01—03</p><h2>Three ways to<br/><em>stay remembered.</em></h2><div><p>Fragrance chosen by atmosphere, not category. Start with what you want the room to feel like after you leave it.</p><Link href="/shop" className="inline-arrow">See the full collection <ArrowUpRight width={17}/></Link></div></header>
    <div className="editorial-products">
      {featured.map((product,index) => <ProductCard key={product.id} product={product} index={index} feature={index===0}/>) }
    </div>
  </section>;
}
