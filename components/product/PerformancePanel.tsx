import type { Product } from "@/lib/types";
const sillage = { intimate: 1, close: 2, noticeable: 3, "room-filling": 4 } as const;
export function PerformancePanel({ product }: { product: Product }) {
  const p = product.performance;
  return <div className="performance-panel">
    <div className="performance-main"><p className="kicker">How it behaves</p><h2>{p.wearsLike}.</h2></div>
    <div className="performance-data">
      <div><span>Longevity</span><strong>{p.longevityHours[0]}—{p.longevityHours[1]} h</strong><div className="meter"><i style={{width:`${Math.min(100,p.longevityHours[1]/12*100)}%`}}/></div></div>
      <div><span>Presence</span><strong>{p.sillage}</strong><div className="dot-meter">{[1,2,3,4].map((n)=><i key={n} className={n<=sillage[p.sillage]?"filled":""}/>)}</div></div>
      <div><span>Best in</span><strong>{p.seasons.slice(0,2).join(" · ")}</strong></div>
      <div><span>Wears well</span><strong>{p.occasions.slice(0,2).join(" · ")}</strong></div>
      <div><span>Day / night</span><strong>{p.dayNight}</strong></div>
      <div><span>Concentration</span><strong>{product.concentration}</strong></div>
    </div>
  </div>;
}
