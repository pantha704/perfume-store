import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnalyticsPageView } from "@/components/layout/AnalyticsPageView";

const display = Cormorant_Garamond({ subsets:["latin"], variable:"--font-display", display:"swap", weight:["400","500","600"] });
const sans = Inter({ subsets:["latin"], variable:"--font-sans", display:"swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://velora.example"),
  title: { default:"Velora — Fragrance as atmosphere", template:"%s — Velora" },
  description:"Small-batch fragrance built in layers. Samples, travel sizes and full bottles, with a sample-first way to discover what works on skin.",
  openGraph:{title:"Velora",description:"Leave a trace.",type:"website",images:["/og.svg"]},
};
export const viewport: Viewport = { width:"device-width", initialScale:1, themeColor:"#0d0c0b", colorScheme:"light" };

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" className={`${display.variable} ${sans.variable}`}><body><a className="skip-link" href="#main">Skip to content</a><SmoothScroll/><AnalyticsPageView/><Header/><main id="main">{children}</main><Footer/></body></html>;
}
