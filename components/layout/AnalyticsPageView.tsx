"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

function anonId() {
  const key = "relapse-anon";
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}
export function sendEvent(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event, anonymousId: anonId(), properties }), keepalive: true });
}
export function AnalyticsPageView() {
  const pathname = usePathname();
  useEffect(() => { sendEvent("page_view", { path: pathname }); }, [pathname]);
  return null;
}
