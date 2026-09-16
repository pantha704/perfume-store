import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/money";
import { ArrowUpRight } from "@/components/ui/Icons";

export function DiscoveryBand({ discovery }: { discovery?: Product }) {
  if (!discovery) return null;
  const variant = discovery.variants[0];
  return <section className="discovery-band section-shell">
    <div className="discovery-copy" data-parallax="0.09"><p className="kicker">The low-risk first step</p><h2>Five scents.<br/><em>No blind bottle.</em></h2><p>Wear each one for a full day. The discovery set is designed for skin, weather, commute and the hours after first spray—not a paper strip.</p><div className="discovery-credit"><b>{formatINR(variant.pricePaise)} back</b><span>as store credit toward your next full bottle · 90 days</span></div><Link href="/samples" className="button dark-button">Build your discovery <ArrowUpRight width={17}/></Link></div>
    <div className="discovery-art" data-parallax="0.15" style={{"--accent":discovery.accent} as React.CSSProperties}><span>5 × 2 ml</span><Image src={discovery.image} alt={discovery.imageAlt} width={640} height={820}/><i>wear before you decide</i></div>
  </section>;
}
