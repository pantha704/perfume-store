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
  const [active, setActive] = useState(1);
  return <div className="note-pyramid-wrap">
    <div className="note-pyramid" role="tablist" aria-label="Fragrance note timing">{layers.map((layer,index) => <button key={layer.key} role="tab" aria-selected={active===index} onClick={() => setActive(index)} className={active===index ? "active" : ""} style={{width:`${58 + index*20}%`}}><span>{layer.label}</span><b>{layer.time}</b></button>)}</div>
    <div className="note-detail"><div><p className="kicker">{layers[active].kind} · {layers[active].time} · {layers[active].copy}</p><h3>{layers[active].label}</h3></div><div className="note-chips">{product.notes[layers[active].key].map((note) => <Link key={note} href={`/notes/${encodeURIComponent(note.toLowerCase().replaceAll(" ","-"))}`}>{note}</Link>)}</div></div>
  </div>;
}
