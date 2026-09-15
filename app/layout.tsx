import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnalyticsPageView } from "@/components/layout/AnalyticsPageView";

const display = Cormorant_Garamond({ subsets:["latin"], variable:"--font-display", display:"swap", weight:["400","500","600"] });
const sans = Inter({ subsets:["latin"], variable:"--font-sans", display:"swap" });
const script = Great_Vibes({ subsets:["latin"], variable:"--font-script", display:"swap", weight:"400" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://relapse.example"),
  title: { default:"Relapse Perfumes — Fragrance as atmosphere", template:"%s — Relapse" },
  description:"Relapse Perfumes — embrace the everyday. Five scents built in layers, with samples, travel sizes and full bottles.",
  openGraph:{title:"Relapse Perfumes",description:"Embrace the everyday.",type:"website",images:["/og.svg"]},
};
export const viewport: Viewport = { width:"device-width", initialScale:1, themeColor:"#0d0c0b", colorScheme:"light" };

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" className={`${display.variable} ${sans.variable} ${script.variable}`}><body><a className="skip-link" href="#main">Skip to content</a><SmoothScroll/><AnalyticsPageView/><Header/><main id="main">{children}</main><Footer/></body></html>;
}
