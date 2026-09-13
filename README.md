# RELAPSE — cinematic fragrance commerce

A production-oriented **Next.js App Router** storefront for a single fragrance house. The visual system is editorial and cinematic; the commerce core remains deliberately boring, auditable, and provider-neutral.

## What ships

- Cinematic scroll hero with a safe procedural bottle fallback and a real frame-sequence asset contract.
- Asymmetric editorial catalogue, family collections, note vocabulary routes, sample-first buying, discovery-set credit, quiz, gift mode, cart and checkout.
- Server-authoritative pricing and stock lookup. The browser never submits a trusted price.
- Razorpay payment order + checkout signature verification + raw webhook verification/idempotency.
- Supabase PostgreSQL/Auth/RLS, guest order tracking via a SHA-256 hashed secret, customer account views and admin role checks.
- Replaceable fulfillment contract with `amazon_mcf`, `shiprocket`, and `manual` adapters. Live fulfillment is **off by default**.
- Cloudflare Workers deployment through OpenNext; no service-specific code leaks into checkout.
- Architecture/security tests, unit tests, Playwright scenarios, Lighthouse budget config, and CI.

## Start safely

```bash
cp .env.example .env.local
npm install
npm run preflight
npm run dev
```

The default configuration is demo/read-only commerce with live fulfillment disabled. See `START_HERE.md`, `SECRETS_AND_KEYS.md`, and `LAUNCH_CHECKLIST.md` before changing those gates.

## Important

The bundled bottle SVGs and procedural canvas are **placeholder art**, intentionally labelled in the UI. Replace them with merchant-approved product photography / frame sequences before launch. Legal copy, return terms, support address, tax wording, final prices and provider mappings also require merchant approval.
