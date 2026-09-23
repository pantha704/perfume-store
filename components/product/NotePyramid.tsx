"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";

const layers = [
  { key: "top" as const, label: "Opening", kind: "Top note", time: "0—15 min", copy: "the first flash" },
  { key: "heart" as const, label: "Heart", kind: "Middle note", time: "15 min—3 h", copy: "the shape of the scent" },
  { key: "base" as const, label: "Drydown", kind: "Base note", time: "3 h+", copy: "what stays on skin" },
];
export function NotePyramid({ product }: { product: Product }) {
  // only stages that actually carry notes: the client positions each material,
  // and a scent without a top note should not show an empty opening stage.
  const visible = layers.filter((layer) => (product.notes[layer.key] || []).length > 0);
  const [active, setActive] = useState(() => Math.max(0, visible.findIndex((layer) => layer.key === "heart")));
  return <div className="note-pyramid-wrap">
    <div className="note-pyramid" role="tablist" aria-label="Fragrance note timing">{visible.map((layer,index) => <button key={layer.key} role="tab" aria-selected={active===index} onClick={() => setActive(index)} className={active===index ? "active" : ""} style={{width:`${58 + index*20}%`}}><span>{layer.label}</span><b>{layer.time}</b></button>)}</div>
    <div className="note-detail"><div><p className="kicker">{visible[active].kind} · {visible[active].time} · {visible[active].copy}</p><h3>{visible[active].label}</h3></div><div className="note-chips">{product.notes[visible[active].key].map((note) => <Link key={note} href={`/notes/${encodeURIComponent(note.toLowerCase().replaceAll(" ","-"))}`}>{note}</Link>)}</div></div>
  </div>;
}
