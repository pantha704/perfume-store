"use client";
import { useEffect, useState } from "react";

const LINES = [
  "Set of 5 — all five scents, ₹399",
  "8 ml entry size — ₹99",
  "The discovery set pays for itself — full credit back on your first bottle",
];
const STORAGE_KEY = "relapse-announce-dismissed";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  // Session-scoped dismissal; rotation pauses for reduced motion.
  useEffect(() => {
    const apply = () => { if (sessionStorage.getItem(STORAGE_KEY) !== "1") setVisible(true); };
    apply();
  }, []);

  useEffect(() => {
    if (!visible) { document.documentElement.style.removeProperty("--announce-h"); return; }
    document.documentElement.style.setProperty("--announce-h", "36px");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % LINES.length), 6000);
    return () => window.clearInterval(id);
  }, [visible]);

  if (!visible) return null;
  return <div className="announce-bar" role="region" aria-label="Current offers">
    <p className="announce-line">{LINES[index]}</p>
    <button className="announce-close" aria-label="Dismiss offers" onClick={() => { sessionStorage.setItem(STORAGE_KEY, "1"); setVisible(false); }}>×</button>
  </div>;
}
