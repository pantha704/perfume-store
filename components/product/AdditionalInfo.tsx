import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/money";

export function AdditionalInfo({ product }: { product: Product }) {
  const formats = [...product.variants].filter((v) => v.available).sort((a, b) => a.pricePaise - b.pricePaise);
  return <section className="info-section section-shell">
    <div className="section-title"><p className="kicker">07 / The label</p>
      <h2>Details,<br/>in plain print.</h2>
    </div>
    <dl className="info-grid">
      <div><dt>Price</dt><dd>{formats.map((v) => `${v.label} — ${formatINR(v.pricePaise)}`).join("  ·  ")}<small>MRP inclusive of all taxes. Compare-at price is shown on each format.</small></dd></div>
      <div><dt>Best before</dt><dd>24 months from the date of manufacture</dd></div>
      <div><dt>Marketed by</dt><dd>Relapse India — Jiban Ratan Dhar Road, Kolkata, West Bengal<small>Full address pending client confirmation.</small></dd></div>
      <div><dt>Manufactured by</dt><dd>Relapse Perfumes — Gopal Bose Lane, Kolkata, West Bengal<small>Full address pending client confirmation.</small></dd></div>
      <div><dt>Country of origin</dt><dd>India</dd></div>
    </dl>
  </section>;
}
