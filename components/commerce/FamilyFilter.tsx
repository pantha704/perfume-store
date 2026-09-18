import Link from "next/link";
import type { Product } from "@/lib/types";

export function FamilyFilter({ products, active }: { products: Product[]; active?: string }) {
  const families = [...new Set(products.map((p) => p.family))];
  const count = (family: string) => products.filter((p) => p.family === family).length;
  return <nav className="family-filter" aria-label="Fragrance families">
    <Link href="/shop" className={!active ? "active" : ""}>All <i>{products.length}</i></Link>
    {families.map((family) => <Link key={family} href={`/shop/${family.toLowerCase()}`} className={active === family ? "active" : ""}>{family} <i>{count(family)}</i></Link>)}
  </nav>;
}
