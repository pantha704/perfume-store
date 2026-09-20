import type { Product } from "@/lib/types";
import { ContactForm } from "@/components/product/ContactForm";

export function ContactSection({ product }: { product: Product }) {
  return <section className="contact-section section-shell">
    <div className="section-title" data-reveal="up"><p className="kicker">08 / Contact</p>
      <h2>Questions,<br/>before or after.</h2>
      <p>A question about this scent, an order or a return — write to us and it lands in the studio inbox. We reply by email.</p>
    </div>
    <ContactForm productId={product.id} productName={product.name}/>
  </section>;
}
