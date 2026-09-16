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

    // phones get a gentler version: same layering, ~55% amplitude
    const phone = window.matchMedia("(max-width: 680px)").matches;
    const damp = phone ? 0.55 : 1;

    const ctx = gsap.context(() => {
      // ---- entry reveals: one-shot, directional, professional pattern ----
      // sides for objects that live in a column, bottom-fade for text.
      const REVEAL: Record<string, [number, number]> = {
        left: [-36, 0],
        right: [36, 0],
        up: [0, 30],
        down: [0, -30],
      };
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        // phones: always enter from below — side offsets would widen the document
        const dir = phone ? "up" : el.dataset.reveal || "up";
        const [dx, dy] = REVEAL[dir] ?? REVEAL.up;
        const delay = parseFloat(el.dataset.revealDelay || "0") || 0;
        gsap.set(el, { autoAlpha: 0, x: dx, y: dy });
        gsap.to(el, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.95,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // classic parallax: drift across each block's own viewport crossing
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const raw = parseFloat(el.dataset.parallax || "0.06");
        const speed = (Number.isFinite(raw) ? Math.min(0.2, Math.max(0.01, raw)) : 0.06) * damp;

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

      // hero exit parallax: only after the frame sequence completes and the next
      // section starts entering (hero bottom hits viewport bottom → hero leaves).
      // Starts from zero so the hero composition is untouched during the sequence;
      // blocks lag progressively as the section exits.
      gsap.utils.toArray<HTMLElement>("[data-parallax-end]").forEach((el) => {
        const raw = parseFloat(el.dataset.parallaxEnd || "0.06");
        const speed = Number.isFinite(raw) ? Math.min(0.2, Math.max(0.01, raw)) : 0.06;
        const scope = el.closest<HTMLElement>(".cinematic-hero") || el;
        // respect any CSS transform the element already carries (e.g. translateY(-50%) centering)
        const base = Number(gsap.getProperty(el, "yPercent")) || 0;

        const tailTo = gsap.quickTo(el, "y", { duration: 0.85, ease: "back.out(1.4)" });
        let tail = 0;

        gsap.fromTo(
          el,
          { yPercent: base },
          {
            yPercent: base + speed * 100,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: scope,
              start: "bottom bottom",
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
