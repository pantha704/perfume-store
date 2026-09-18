"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@/components/ui/Icons";
import { OFFERS } from "@/lib/offers";

export function OfferBand() {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  // Controls only exist when the rail actually has somewhere to go.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const cards = el.querySelectorAll<HTMLElement>(".offer-card");
      const leading = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft);
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - leading);
        if (distance < bestDist) { bestDist = distance; best = index; }
      });
      setActive(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function go(index: number) {
    const next = Math.max(0, Math.min(OFFERS.length - 1, index));
    rail.current?.querySelectorAll<HTMLElement>(".offer-card")[next]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActive(next);
  }

  return <section className="offer-band" aria-label="Current offers">
    <div className="offer-head" data-reveal="up">
      <div><p className="kicker">Running now</p><h2>Worth taking,<br/><em>nothing urgent.</em></h2></div>
      <div className="offer-nav" hidden={!scrollable}>
        <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous offer">←</button>
        <button onClick={() => go(active + 1)} disabled={active === OFFERS.length - 1} aria-label="Next offer">→</button>
      </div>
    </div>
    <div className="offer-rail" ref={rail}>
      {OFFERS.map((offer, index) => <Link key={offer.id} href={offer.href} className={`offer-card ${index === active ? "active" : ""}`} style={{ "--accent": offer.accent } as CSSProperties}>
        <span className="offer-glow" aria-hidden="true" />
        <span className="offer-image" aria-hidden="true" style={{ backgroundImage: `url(${offer.image})` }} />
        <div className="offer-body">
          <span className="offer-kicker">{offer.kicker}</span>
          <strong>{offer.title}</strong>
          <p>{offer.note}</p>
          <span className="offer-cta">{offer.cta} <ArrowUpRight width={16}/></span>
        </div>
      </Link>)}
    </div>
    <div className="offer-dots" role="tablist" aria-label="Offer slides" hidden={!scrollable}>
      {OFFERS.map((offer, index) => <button key={offer.id} role="tab" aria-selected={index === active} aria-label={`Offer ${index + 1}: ${offer.title}`} className={index === active ? "active" : ""} onClick={() => go(index)}/>)}
    </div>
  </section>;
}
