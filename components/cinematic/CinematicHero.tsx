"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@/components/ui/Icons";

gsap.registerPlugin(ScrollTrigger);

function drawBottle(canvas: HTMLCanvasElement, progress: number, frame?: HTMLImageElement, framesActive = false) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,rect.width,rect.height);

  const w = rect.width, h = rect.height;
  if (framesActive) {
    // Rendered sequence is the visual source; never fall back to procedural art
    // mid-flight (that flash would read as a glitch). Empty stage until ready.
    if (frame?.complete && frame.naturalWidth) {
      const scale = Math.min(w / frame.naturalWidth, h / frame.naturalHeight);
      const dw = frame.naturalWidth * scale, dh = frame.naturalHeight * scale;
      ctx.drawImage(frame, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    return;
  }
  if (frame?.complete && frame.naturalWidth) {
    const scale = Math.min(w / frame.naturalWidth, h / frame.naturalHeight);
    const dw = frame.naturalWidth * scale, dh = frame.naturalHeight * scale;
    ctx.drawImage(frame, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return;
  }
  const drift = Math.sin(progress * Math.PI * 1.5) * Math.min(26, w * 0.03);
  const cx = w * 0.53 + drift;
  const bodyH = Math.min(h * 0.58, 520);
  const baseW = Math.min(w * 0.42, 310);
  const turn = Math.cos(progress * Math.PI * 2.2);
  const bodyW = baseW * (0.74 + Math.abs(turn) * 0.26);
  const bodyY = h * 0.22 + Math.sin(progress * Math.PI) * -12;
  const capH = bodyH * 0.17;
  const neckH = bodyH * 0.11;

  // atmospheric halo
  const halo = ctx.createRadialGradient(cx, bodyY + bodyH * .45, 0, cx, bodyY + bodyH * .45, bodyH * .72);
  halo.addColorStop(0, `rgba(173,138,88,${0.18 + progress * .04})`);
  halo.addColorStop(.45, "rgba(110,75,45,.07)"); halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo; ctx.fillRect(0,0,w,h);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 48; ctx.shadowOffsetY = 28;
  const x = cx - bodyW/2;
  const y = bodyY + capH + neckH;
  const radius = Math.max(16, bodyW * .075);
  const liquid = ctx.createLinearGradient(x,y,x+bodyW,y+bodyH);
  liquid.addColorStop(0,"rgba(198,150,94,.34)"); liquid.addColorStop(.20,"rgba(65,44,29,.92)"); liquid.addColorStop(.62,"rgba(25,19,15,.98)"); liquid.addColorStop(1,"rgba(117,73,38,.82)");
  ctx.beginPath();
  ctx.roundRect(x, y, bodyW, bodyH - capH - neckH, radius);
  ctx.fillStyle = liquid; ctx.fill();
  ctx.shadowColor = "transparent";
  const glass = ctx.createLinearGradient(x,y,x+bodyW,y);
  glass.addColorStop(0,"rgba(255,255,255,.20)"); glass.addColorStop(.09,"rgba(255,255,255,.025)"); glass.addColorStop(.52,"rgba(255,255,255,.02)"); glass.addColorStop(.89,"rgba(255,255,255,.13)"); glass.addColorStop(1,"rgba(255,255,255,.03)");
  ctx.fillStyle = glass; ctx.fill();
  ctx.strokeStyle = "rgba(255,245,225,.22)"; ctx.lineWidth = 1; ctx.stroke();

  // neck + cap
  const neckW = bodyW * .34;
  ctx.fillStyle = "rgba(34,29,25,.98)"; ctx.fillRect(cx-neckW/2, bodyY+capH*.85, neckW, neckH*1.2);
  const capW = bodyW * .48 * (0.9 + Math.abs(turn)*.1);
  const capGrad = ctx.createLinearGradient(cx-capW/2,bodyY,cx+capW/2,bodyY);
  capGrad.addColorStop(0,"#171513"); capGrad.addColorStop(.35,"#4a4036"); capGrad.addColorStop(.55,"#201d1a"); capGrad.addColorStop(1,"#090807");
  ctx.fillStyle = capGrad; ctx.beginPath(); ctx.roundRect(cx-capW/2, bodyY, capW, capH, 5); ctx.fill();

  // label
  const labelW = bodyW * .62;
  const labelH = bodyH * .24;
  const labelY = y + bodyH*.25;
  ctx.fillStyle = "rgba(236,228,213,.94)"; ctx.fillRect(cx-labelW/2,labelY,labelW,labelH);
  ctx.fillStyle = "#17130f"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `${Math.max(10, labelW*.075)}px Georgia, serif`; ctx.letterSpacing = "0.14em";
  ctx.fillText("RELAPSE",cx,labelY+labelH*.37);
  ctx.font = `${Math.max(8, labelW*.046)}px Arial, sans-serif`; ctx.fillStyle = "#5d554b";
  ctx.fillText("INVICTUS",cx,labelY+labelH*.65);
  ctx.restore();

  // floor reflection
  const floorY = y + bodyH - capH - neckH + 32;
  const reflection = ctx.createRadialGradient(cx,floorY,0,cx,floorY,bodyW*.85);
  reflection.addColorStop(0,"rgba(173,138,88,.13)"); reflection.addColorStop(1,"rgba(173,138,88,0)");
  ctx.fillStyle = reflection; ctx.fillRect(cx-bodyW, floorY-30, bodyW*2, 90);
}

export function CinematicHero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    const el = root.current, c = canvas.current; if (!el || !c) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameBase = process.env.NEXT_PUBLIC_HERO_FRAME_BASE || "";
    const mobile = window.matchMedia("(max-width: 680px)").matches;
    const frameCount = mobile ? 60 : 150;
    const frames: Array<HTMLImageElement | undefined> = new Array(frameCount);
    const frameUrl = (index: number) => frameBase
      .replace("{index}", String(index + 1).padStart(4, "0"))
      .replace("{width}", mobile ? "960" : "1600");
    const loadFrame = (index: number) => {
      if (!frameBase || frames[index]) return;
      const image = new Image();
      image.decoding = "async";
      image.src = frameUrl(index);
      image.onload = () => { if (index === Math.round(progress.current * (frameCount - 1))) render(); };
      frames[index] = image;
    };
    const render = () => {
      const index = Math.min(frameCount - 1, Math.max(0, Math.round(progress.current * (frameCount - 1))));
      let ready = index;
      while (ready > 0 && !(frames[ready]?.complete && frames[ready]?.naturalWidth)) ready -= 1;
      drawBottle(c, progress.current, frames[ready], Boolean(frameBase));
    };
    if (frameBase) {
      for (let index = 0; index < Math.min(20, frameCount); index += 1) loadFrame(index);
      const idle = () => { for (let index = 20; index < frameCount; index += 1) loadFrame(index); };
      if ("requestIdleCallback" in window) (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(idle, { timeout: 2200 }); else setTimeout(idle, 900);
    }
    const onResize = () => render();
    window.addEventListener("resize", onResize); render();
    if (reduced) return () => window.removeEventListener("resize", onResize);

    const state = { p: 0 };
    const context = gsap.context(() => {
      gsap.to(state, { p: 1, ease: "none", onUpdate: () => { progress.current = state.p; render(); }, scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: .55 } });
      gsap.to("[data-hero-intro]", { yPercent: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: el, start: "8% top", end: "22% top", scrub: true } });
      gsap.fromTo("[data-beat='1']", { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "20% top", end: "31% top", scrub: true } });
      gsap.to("[data-beat='1']", { y: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: el, start: "34% top", end: "43% top", scrub: true } });
      gsap.fromTo("[data-beat='2']", { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "38% top", end: "50% top", scrub: true } });
      gsap.to("[data-beat='2']", { y: -25, opacity: 0, ease: "none", scrollTrigger: { trigger: el, start: "55% top", end: "64% top", scrub: true } });
      gsap.fromTo("[data-hero-final]", { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "63% top", end: "78% top", scrub: true } });
    }, el);
    return () => { context.revert(); window.removeEventListener("resize", onResize); };
  }, []);

  return <section ref={root} className="cinematic-hero" aria-label="Relapse fragrance introduction">
    <div className="cinematic-sticky">
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-orbit" aria-hidden="true"><span>01</span><span>EAU DE PARFUM</span><span>INDIA</span></div>
      <canvas ref={canvas} className="hero-canvas" aria-label="Animated placeholder bottle artwork for Relapse Invictus" />
      <div data-hero-intro className="hero-intro">
        <p className="kicker light">A fragrance house built in layers</p>
        <h1><span>Leave</span><span>a trace.</span></h1>
        <p className="hero-deck">Five scents. Embrace the everyday.</p>
      </div>
      <div data-beat="1" className="hero-beat hero-beat-one"><span>01 / OPENING</span><h2>Bright enough<br/>to disappear.</h2><p>Black pepper and bergamot cut through the first minute before the composition slows down.</p></div>
      <div data-beat="2" className="hero-beat hero-beat-two"><span>02 / DRYDOWN</span><h2>Then the room<br/>gets quieter.</h2><p>Suede, cedar and amber sit close. A scent that changes distance instead of volume.</p></div>
      <div data-hero-final className="hero-final"><p className="kicker light">Invictus · the first edit</p><h2>Wear the<br/><em>afterimage.</em></h2><div className="hero-final-actions"><Link href="/product/invictus" className="button light-button">Discover Invictus <ArrowUpRight width={17}/></Link><Link href="/samples" className="text-link-light">Start with 2 ml</Link></div></div>
      <div className="hero-scroll-marker"><span>Scroll to unfold</span><i/></div>
    </div>
  </section>;
}
