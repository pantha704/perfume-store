"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-linked parallax for marked blocks.
 *
 * Any element with `data-parallax="0.08"` drifts from +8% to -8% of its own
 * height as it crosses the viewport (scrubbed 1:1 with scroll, transform-only).
 * Different speeds on sibling blocks give the layered, non-glued behaviour.
 *
 * Skipped entirely for reduced motion and on phones; ScrollTrigger is refreshed
 * after fonts and images settle so start/end positions stay accurate.
 */
export function ScrollParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 680px)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const raw = parseFloat(el.dataset.parallax || "0.06");
        const speed = Number.isFinite(raw) ? Math.min(0.2, Math.max(0.01, raw)) : 0.06;
        gsap.fromTo(
          el,
          { yPercent: speed * 100 },
          {
            yPercent: speed * -100,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    if (typeof document.fonts !== "undefined") document.fonts.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);
  return null;
}
