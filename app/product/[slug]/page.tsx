import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/catalogue";
import { VariantSelector } from "@/components/commerce/VariantSelector";
import { NotePyramid } from "@/components/product/NotePyramid";
import { PerformancePanel } from "@/components/product/PerformancePanel";
import { PdpGallery } from "@/components/product/PdpGallery";
import { UsageGuide } from "@/components/product/UsageGuide";
import { AdditionalInfo } from "@/components/product/AdditionalInfo";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ContactSection } from "@/components/product/ContactSection";
import { StickyBuyBar } from "@/components/commerce/StickyBuyBar";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";

export async function generateStaticParams(){return (await getProducts()).filter(p=>!p.isDiscoverySet).map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=await getProductBySlug(slug);return p?{title:p.name,description:p.shortDescription,openGraph:{title:`${p.name} — Relapse`,description:p.shortDescription,images:[p.image]}}:{};}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=await getProductBySlug(slug);if(!p||p.isDiscoverySet)notFound();const all=await getProducts();const related=all.filter(x=>x.id!==p.id&&!x.isDiscoverySet&&(x.family===p.family||x.notes.base.some(n=>p.notes.base.includes(n)))).slice(0,2);return <div className="pdp" style={{"--accent":p.accent} as React.CSSProperties}>
  <ProductViewTracker productId={p.id} slug={p.slug}/>
  <section className="pdp-hero"><PdpGallery images={[p.image, ...(p.gallery || [])]} alt={p.imageAlt} orbit={<>{p.family}<span>•</span>{p.concentration}</>} caption="supplied house artwork · studio shoot pending" /><div className="pdp-buy"><p className="kicker">{p.eyebrow} · {p.family}</p><h1>{p.name}</h1><p className="pdp-lead">{p.shortDescription}</p><div className="pdp-rule"/><VariantSelector product={p}/><div className="pdp-trust"><span>Authenticity recorded by batch</span><span>Opened-bottle returns policy shown clearly</span><span>Secure server-verified checkout</span></div></div></section>
  <section className="pdp-story section-shell"><p className="story-index" data-reveal="up">01 / THE SHAPE</p><div data-reveal="up" data-reveal-delay="0.06"><h2>{p.story||p.description}</h2><p>{p.description}</p></div><blockquote data-reveal="up" data-reveal-delay="0.12">“{p.performance.wearsLike}.”</blockquote></section>
  <section className="notes-section section-shell"><div className="section-title" data-reveal="up"><p className="kicker">02 / How it unfolds</p><h2>Three moments,<br/>not one list.</h2><p>Tap a stage to see what takes the foreground. Each material opens into its own vocabulary page.</p></div><NotePyramid product={p}/></section>
  <section className="performance-section"><div className="section-shell"><PerformancePanel product={p}/></div></section>
  <section className="scale-section section-shell"><div className="scale-copy" data-reveal="up"><p className="kicker">04 / Scale & ritual</p><h2>Know what<br/>you are buying.</h2><p>Final product photography should include an in-hand frame or a known object beside every bottle. Placeholder artwork is intentionally labelled until those assets exist.</p></div><div className="scale-figure" data-reveal="up" data-reveal-delay="0.08" data-parallax="0.08"><Image src={p.image} alt={`Scale placeholder for ${p.name}`} width={420} height={540}/><div className="scale-line"><span>approx.</span><i/><b>50 ml format</b></div></div></section>
  <UsageGuide/>
  <ReviewsSection product={p}/>
  <AdditionalInfo product={p}/>
  <ContactSection product={p}/>
  {related.length?<section className="related section-shell"><header data-reveal="up"><p className="kicker">If this is close</p><h2>Follow the material,<br/><em>not the dupe.</em></h2></header><div>{related.map((r,i)=><ProductCard key={r.id} product={r} index={i} reveal="up" revealDelay={i*0.08}/>)}</div></section>:null}
  <StickyBuyBar product={p}/>
</div>}
