import { notFound } from "next/navigation";
import { getAllNotes } from "@/lib/catalogue";
import { noteDescription } from "@/lib/note-copy";
import { ProductCard } from "@/components/product/ProductCard";
export async function generateStaticParams(){return (await getAllNotes()).map(n=>({note:n.name.toLowerCase().replaceAll(" ","-")}));}
export default async function NotePage({params}:{params:Promise<{note:string}>}){const {note}=await params;const all=await getAllNotes();const found=all.find(n=>n.name.toLowerCase().replaceAll(" ","-")===decodeURIComponent(note).toLowerCase());if(!found)notFound();return <div className="note-page section-shell"><header data-reveal="up"><p className="kicker">Material vocabulary</p><h1>{found.name}.</h1><p>{noteDescription(found.name)}.</p></header><div className="note-divider" data-reveal="up" data-reveal-delay="0.06"><span>Found in {found.products.length} composition{found.products.length===1?"":"s"}</span><i/></div><div className="shop-grid compact-grid">{found.products.map((p,i)=><ProductCard key={p.id} product={p} index={i} reveal="up" revealDelay={(i%3)*0.07}/>)}</div></div>}
