"use client";
import Script from "next/script";
import { useEffect, useRef } from "react";

declare global { interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void } } }
export function TurnstileWidget({ siteKey, onToken }: { siteKey?: string; onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  useEffect(() => {
    if (!siteKey || !ref.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(ref.current, { sitekey: siteKey, theme: "light", callback: (token: string) => onToken(token), "expired-callback": () => onToken("") });
    return () => { if (widget.current && window.turnstile) window.turnstile.remove(widget.current); widget.current = null; };
  }, [siteKey,onToken]);
  if (!siteKey) return null;
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => { if(siteKey && ref.current && window.turnstile && !widget.current) widget.current=window.turnstile.render(ref.current,{sitekey:siteKey,theme:"light",callback:(token:string)=>onToken(token),"expired-callback":()=>onToken("")}); }}/><div className="turnstile-slot" ref={ref}/></>;
}
