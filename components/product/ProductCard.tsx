import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/money";
import { ArrowUpRight } from "@/components/ui/Icons";

export function ProductCard({ product, index = 0, feature = false }: { product: Product; index?: number; feature?: boolean }) {
  const bottle = product.variants.find((v) => v.kind === "bottle") || product.variants[0];
  const sample = product.variants.find((v) => v.kind === "sample");
  return <article className={`product-card ${feature ? "product-card-feature" : ""}`} style={{ "--accent": product.accent } as React.CSSProperties}>
    <Link href={`/product/${product.slug}`} className="product-art">
      <div className="product-index">{String(index + 1).padStart(2,"0")}</div>
      <div className="product-halo" aria-hidden="true" />
      <Image src={product.image} alt={product.imageAlt} width={640} height={820} sizes={feature ? "(max-width: 800px) 90vw, 48vw" : "(max-width: 800px) 90vw, 32vw"} />
      <span className="art-caption">placeholder bottle art</span>
    </Link>
    <div className="product-card-copy">
      <div><p className="kicker">{product.eyebrow} · {product.family}</p><h3><Link href={`/product/${product.slug}`}>{product.name}</Link></h3></div>
      <p>{product.shortDescription}</p>
      <div className="product-card-meta"><span>from {formatINR(sample?.pricePaise || bottle?.pricePaise || 0)}</span><Link href={`/product/${product.slug}`} aria-label={`Discover ${product.name}`}>Discover <ArrowUpRight width={16}/></Link></div>
    </div>
  </article>;
}
