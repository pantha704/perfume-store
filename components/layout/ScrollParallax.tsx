"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-linked parallax for marked blocks.
 *
 * Any element with `data-parallax="0.08"` drifts from +8% to -8% of its own
 * height as it crosses the viewport. Two layers of smoothing keep it silky and
 * slightly elastic without ever looking bouncy:
 *   1. scrub: 0.55  — the drift itself catches up to the scrollbar with weight
 *   2. velocity tail — a small clamped px offset (back.out overshoot) that
 *      trails fast scrolls and settles back to rest when scrolling stops
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

        // elastic settle: trails the scroll velocity, glides back with a whisper of overshoot
        const tailTo = gsap.quickTo(el, "y", { duration: 0.85, ease: "back.out(1.4)" });
        let tail = 0;

        gsap.fromTo(
          el,
          { yPercent: speed * 100 },
          {
            yPercent: speed * -100,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.55,
              onUpdate: (self) => {
                const next = gsap.utils.clamp(-18, 18, self.getVelocity() * 0.012);
                if (Math.abs(next - tail) > 0.5) {
                  tail = next;
                  tailTo(next);
                }
              },
            },
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
