import Link from "next/link";
export function Footer() {
  return <footer className="site-footer">
    <div className="footer-mark">RELAPSE<span>Embrace the everyday.</span></div>
    <div className="footer-links"><div><b>Explore</b><Link href="/shop">Shop</Link><Link href="/samples">Samples</Link><Link href="/quiz">Scent finder</Link></div><div><b>Care</b><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link><Link href="/contact">Contact</Link></div><div><b>Legal</b><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Relapse Perfumes</span><span>Built for slow discovery.</span><span>India · INR</span></div>
  </footer>;
}
