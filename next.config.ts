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
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com https://challenges.cloudflare.com https://*.posthog.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://cdn.razorpay.com https://challenges.cloudflare.com https://*.posthog.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com",
  // Only upgrade to HTTPS when the deployed site is actually served over HTTPS.
  // Over plain http (local dev, CI test server) the directive forces assets onto
  // https and everything the server can't answer 403s.
  ...(process.env.NODE_ENV === "production" && (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https://") ? ["upgrade-insecure-requests"] : [])
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
    // Serve the source files directly. The worker-side optimizer was asked to
    // UPSCALE pre-optimized webp posters to w=3840 in the isolate, which blew the
    // 128MB memory ceiling and produced Error 1102 ("exceededResources") under
    // real traffic. Every image shipped here is already web-optimized by hand
    // (100-180KB webp), so in-worker resizing buys nothing and costs CPU/memory.
    unoptimized: true,
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
