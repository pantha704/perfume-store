# Astro → Next.js migration notes

The visual layer was rebuilt rather than mechanically ported. Domain invariants were retained: server-authoritative pricing, provider-neutral fulfillment, payment verification, RLS, guest-token hashing, audit/analytics, and stable website SKU/provider mapping separation.

Astro pages moved to App Router server pages; React islands became bounded client components. API handlers moved to `app/api/**/route.ts`. The hand-written Worker entry was removed in favour of OpenNext output. Cloudflare config remains at the deployment edge, not inside domain services.
