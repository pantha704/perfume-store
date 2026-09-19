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
  const [tail, setTail] = useState(0);

  // Controls only exist when the rail actually has somewhere to go.
  // A trailing spacer lets the LAST cards reach the leading edge too
  // (otherwise scroll clamping makes the active card/dot misread).
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const measure = () => {
      const card = el.querySelector<HTMLElement>(".offer-card");
      const last = el.querySelector<HTMLElement>(".offer-card:last-of-type");
      if (!card || !last) return;
      const cs = getComputedStyle(el);
      const padR = parseFloat(cs.paddingRight);
      const contentEnd = last.offsetLeft + last.offsetWidth + padR;
      const canScroll = contentEnd > el.clientWidth + 2;
      setScrollable(canScroll);
      setTail(canScroll ? Math.max(0, el.clientWidth - card.offsetWidth - parseFloat(cs.paddingLeft) - padR) : 0);
    };
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
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 2) { setActive(0); return; }
      if (max > 0 && el.scrollLeft >= max - 2) { setActive(cards.length - 1); return; }
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

  // Mouse click-and-drag: pointer capture, snap disabled while dragging,
  // smooth snap to the nearest card on release, click suppressed after a drag.
  function beginDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // touch keeps native swipe
    const el = rail.current;
    if (!el) return;
    const startX = e.clientX;
    const startLeft = el.scrollLeft;
    let moved = false;
    let prevSnap = "";

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        // only now claim the pointer: capturing on pointerdown would steal the
        // click from the card links (click target becomes the rail).
        moved = true;
        prevSnap = el.style.scrollSnapType;
        el.style.scrollSnapType = "none";
        el.classList.add("dragging");
        try { el.setPointerCapture(ev.pointerId); } catch { /* noop */ }
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };
    const finish = (ev: PointerEvent) => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", finish);
      el.removeEventListener("pointercancel", finish);
      if (!moved) return;
      el.style.scrollSnapType = prevSnap;
      el.classList.remove("dragging");
      try { el.releasePointerCapture(ev.pointerId); } catch { /* noop */ }
      el.dataset.dragged = "1";
      const cards = Array.from(el.querySelectorAll<HTMLElement>(".offer-card"));
      const leading = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft);
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - leading);
        if (distance < bestDist) { bestDist = distance; best = index; }
      });
      const padL = parseFloat(getComputedStyle(el).paddingLeft);
      const max = el.scrollWidth - el.clientWidth;
      el.scrollTo({ left: Math.min(max, Math.max(0, cards[best].offsetLeft - padL)), behavior: "smooth" });
      window.setTimeout(() => { delete el.dataset.dragged; }, 0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
  }

  return <section className="offer-band" aria-label="Current offers">
    <div className="offer-head" data-reveal="up">
      <div><p className="kicker">Running now</p><h2>Worth taking,<br/><em>nothing urgent.</em></h2></div>
      <div className="offer-nav" hidden={!scrollable}>
        <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous offer">←</button>
        <button onClick={() => go(active + 1)} disabled={active === OFFERS.length - 1} aria-label="Next offer">→</button>
      </div>
    </div>
    <div className="offer-rail" ref={rail} onPointerDown={beginDrag} onDragStart={(e) => e.preventDefault()}>
      {OFFERS.map((offer, index) => <Link key={offer.id} href={offer.href} draggable={false} className={`offer-card ${index === active ? "active" : ""}`} style={{ "--accent": offer.accent } as CSSProperties} onClickCapture={(e) => { if (rail.current?.dataset.dragged) { e.preventDefault(); e.stopPropagation(); } }}>
        <span className="offer-glow" aria-hidden="true" />
        <span className="offer-image" aria-hidden="true" style={{ backgroundImage: `url(${offer.image})` }} />
        <div className="offer-body">
          <span className="offer-kicker">{offer.kicker}</span>
          <strong>{offer.title}</strong>
          <p>{offer.note}</p>
          <span className="offer-cta">{offer.cta} <ArrowUpRight width={16}/></span>
        </div>
      </Link>)}
      {tail > 0 ? <span className="offer-tail" aria-hidden="true" style={{ flexBasis: tail }} /> : null}
    </div>
    <div className="offer-dots" role="tablist" aria-label="Offer slides" hidden={!scrollable}>
      {OFFERS.map((offer, index) => <button key={offer.id} role="tab" aria-selected={index === active} aria-label={`Offer ${index + 1}: ${offer.title}`} className={index === active ? "active" : ""} onClick={() => go(index)}/>)}
    </div>
  </section>;
}
