import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://challenges.cloudflare.com https://*.posthog.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://challenges.cloudflare.com https://*.posthog.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\")" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.r2.dev" }
    ]
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
