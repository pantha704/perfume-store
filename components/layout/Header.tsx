"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bag, Menu, X } from "@/components/ui/Icons";
import { CartBadge } from "@/components/layout/CartBadge";

const nav = [["Shop","/shop"],["Samples","/samples"],["Find your scent","/quiz"],["Our story","/about"]] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onCinematicHome = pathname === "/";
  return <>
    <header className={`site-header ${onCinematicHome ? "site-header-night" : "site-header-paper"}`}>
      <Link href="/" className="wordmark" aria-label="Relapse home"><span>RELAPSE</span><small>perfume</small></Link>
      <nav className="desktop-nav" aria-label="Primary">{nav.map(([label,href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="header-actions">
        <Link href="/account" className="header-text-link">Account</Link>
        <Link href="/cart" className="cart-link"><Bag width={18}/><CartBadge/></Link>
        <button className="menu-button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X width={22}/> : <Menu width={22}/>}</button>
      </div>
    </header>
    <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="mobile-menu-inner">{nav.map(([label,href], index) => <Link key={href} href={href} onClick={() => setOpen(false)}><span>0{index+1}</span>{label}</Link>)}<Link href="/account" onClick={() => setOpen(false)}><span>05</span>Account</Link></div>
      <p>Small-batch fragrance.<br/>India, after dark.</p>
    </div>
  </>;
}
