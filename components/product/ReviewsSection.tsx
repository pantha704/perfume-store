import type { Product } from "@/lib/types";
import { getPublishedReviews } from "@/lib/reviews";
import { ReviewForm } from "@/components/product/ReviewForm";

export function Stars({ value, label }: { value: number; label?: string }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return <span className="stars" role="img" aria-label={label || `${value} out of 5 stars`}>
    {"★".repeat(full)}<i aria-hidden="true">{"★".repeat(5 - full)}</i>
  </span>;
}

export async function ReviewsSection({ product }: { product: Product }) {
  const { reviews, average, count } = await getPublishedReviews(product.id);
  return <section className="reviews-section section-shell">
    <div className="section-title" data-reveal="up"><p className="kicker">06 / What people say</p>
      <h2>Worn, then<br/>reported back.</h2>
      {count ? <p className="review-summary"><Stars value={average}/> <b>{average} out of 5</b> · {count} review{count === 1 ? "" : "s"}</p>
        : <p className="review-summary">No reviews yet — the first wear is yours to describe.</p>}
    </div>
    {reviews.length ? <div className="review-grid">{reviews.map((r, i) => <article className="review-card" key={r.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 0.05)}>
      <header><Stars value={r.rating}/><time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</time></header>
      <h3>{r.title || r.authorName}</h3>
      {r.title ? <p className="review-author">{r.authorName}</p> : null}
      <p>{r.body}</p>
    </article>)}</div> : null}
    <ReviewForm productId={product.id} productName={product.name}/>
  </section>;
}
