"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function PdpGallery({ images, alt, orbit, caption }: { images: string[]; alt: string; orbit: React.ReactNode; caption: string }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const multi = images.length > 1;

  function go(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  useEffect(() => {
    if (!multi) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [multi]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="pdp-art">
    <div className="pdp-art-orbit">{orbit}</div>
    <div className="pdp-halo" />
    <div className="pdp-slides"
      onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}>
      {images.map((src, i) => <div key={src} className={`pdp-slide ${i === index ? "active" : ""}`} aria-hidden={i !== index}>
        <Image src={src} alt={i === 0 ? alt : `${alt} — view ${i + 1}`} width={900} height={1100} priority={i === 0} sizes="(max-width: 900px) 100vw, 52vw" />
      </div>)}
    </div>
    {multi ? <>
      <div className="pdp-slide-nav">
        <button onClick={() => go(-1)} aria-label="Previous photo">←</button>
        <span>{index + 1} / {images.length}</span>
        <button onClick={() => go(1)} aria-label="Next photo">→</button>
      </div>
      <div className="pdp-thumbs">{images.map((src, i) => <button key={src} className={i === index ? "active" : ""} onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`} aria-current={i === index}><Image src={src} alt="" width={90} height={110} /></button>)}</div>
    </> : null}
    <span className="art-caption">{caption}</span>
  </div>;
}
