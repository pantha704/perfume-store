import { getProducts } from "@/lib/catalogue";
import { CinematicHero } from "@/components/cinematic/CinematicHero";
import { FeaturedEdit } from "@/components/cinematic/FeaturedEdit";
import { ScentFamilies } from "@/components/cinematic/ScentFamilies";
import { DiscoveryBand } from "@/components/cinematic/DiscoveryBand";
import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/Icons";

export default async function HomePage(){
  const products=await getProducts(); const discovery=products.find(p=>p.isDiscoverySet);
  return <><CinematicHero/><div className="paper-world"><FeaturedEdit products={products}/><ScentFamilies products={products}/><DiscoveryBand discovery={discovery}/><section className="manifesto section-shell"><p className="manifesto-number" data-parallax="0.12">03:17</p><div data-parallax="0.05"><p className="kicker">A note on choosing</p><h2>A perfume is not<br/>a profile picture.</h2><p>It moves with weather, skin and time. We show the first spray, the third hour and the trace left after. That is why every full bottle has a smaller way in.</p><Link href="/quiz" className="inline-arrow">Find your atmosphere <ArrowUpRight width={17}/></Link></div></section></div></>;
}
