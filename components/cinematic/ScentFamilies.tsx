import Link from "next/link";
import type { Product } from "@/lib/types";
import { ArrowUpRight } from "@/components/ui/Icons";

export function ScentFamilies({ products }: { products: Product[] }) {
  const families = ["Woody","Floral","Smoky","Fresh"];
  return <section className="family-band">
    <div className="family-band-intro"><p className="kicker light">Navigate by temperature</p><h2>What kind of air<br/>do you want?</h2></div>
    <div className="family-list">{families.map((family,index) => {
      const p = products.find((product) => product.family === family);
      return <Link href={`/shop/${family.toLowerCase()}`} className="family-row" key={family} style={{"--accent":p?.accent || "#ad8a58"} as React.CSSProperties}><span>0{index+1}</span><strong>{family}</strong><em>{family === "Woody" ? "dry · textural · grounded" : family === "Floral" ? "petal · spice · skin" : family === "Smoky" ? "embers · leather · resin" : "mineral · citrus · air"}</em><ArrowUpRight width={22}/></Link>;
    })}</div>
  </section>;
}
