# Architecture & design decisions — with the rejected alternatives

## Next.js App Router, not the previous Astro build

**Chosen:** Next.js 16 App Router. The site needs server-rendered catalogue/SEO, account/auth handling, route handlers, image optimization and a rich but bounded set of client interactions. React Server Components give us a strict default toward zero client JS.

**Why not keep Astro:** Astro was technically suitable, but the user explicitly wants Next.js and the existing visual build was too restrained. Migrating now is cheaper than carrying two mental models through payment/admin/fulfillment work.

**Cost:** larger framework surface and more deployment adapter complexity. We offset it by keeping domain services framework-agnostic.

## OpenNext on Cloudflare Workers, not Vercel-only or vinext beta

**Chosen:** OpenNext. It keeps the existing Cloudflare target while supporting the App Router and route handlers.

**Why not Vercel-only:** excellent Next.js integration, but it makes the hosting decision harder to reverse and is not required for this workload.

**Why not vinext yet:** Cloudflare recommends it for new work, but it is still a moving compatibility layer. For live payments and fulfillment, maturity beats novelty. The adapter can be revisited later without touching domain code.

## Custom editorial system, not a shadcn-looking storefront

**Chosen:** shadcn semantics/registry conventions where useful, but bespoke components and CSS for the public shop. The visual brief requires a fragrance identity rather than a recognizable component-library skin.

**Why not assemble cards + hero + feature grid:** that is exactly the templated AI-web pattern we are avoiding. Catalogue rhythm is asymmetric, typography does real compositional work, and the dark cinematic world is separated from warm commerce surfaces.

**Cost:** more CSS and more visual QA. That is intentional.

## GSAP + Lenis + Motion vocabulary, but no Three.js

**Chosen:** GSAP ScrollTrigger for long scroll choreography, Lenis for controlled smoothing, and CSS / Motion-style micro-interactions. The hero exposes a frame-sequence contract with a procedural canvas fallback.

**Why not WebGL/Three.js:** without a real optimized bottle model, WebGL would add bundle/runtime cost for fake depth. Product truth matters more than a technology demo.

**Why not autoplay video:** scroll-scrubbed frames give deterministic reversible states and a reduced-motion/static path. Real frames can be inserted without rewriting layout.

## Supabase, not Cloudflare D1

**Chosen:** PostgreSQL + Auth + RLS. Commerce benefits from transactions, row locks for credit reservation, relational constraints and a proven auth/RLS model.

**Why not D1:** it would reduce vendor count on Cloudflare, but recreating auth/RLS and transactional operational tooling would increase application risk.

## Razorpay, not manual UPI screenshots

**Chosen:** gateway-created server orders with verified signatures and webhooks.

**Why not direct UPI screenshot confirmation:** manual reconciliation is easy to spoof, hard to automate, and makes fulfillment unsafe. Gateway fees buy verification and a clean order state machine.

## FulfillmentProvider contract, not Amazon-first coupling

**Chosen:** `quote / create / status / cancel / inventory` interface plus adapter registry. `DEFAULT_FULFILLMENT_PROVIDER` decides the default; each SKU maps separately per provider.

**Why:** Amazon MCF is still a candidate, not a locked business decision. Shiprocket or another provider should be a configuration/adapter change, not a checkout rewrite.

**Cost:** adapter normalization and provider capability flags. Worth it because logistics decisions change much more often than checkout UX.

## Manual adapter is the safe default

**Chosen:** `DEFAULT_FULFILLMENT_PROVIDER=manual`, `FULFILLMENT_LIVE_ENABLED=false`.

**Why not default Amazon sandbox/live:** a cloned repo must never create external fulfillment just because credentials were added. Live submission requires two deliberate switches: configure/enable the provider and enable live fulfillment.

## Sample-first commerce, not only full bottles

**Chosen:** 2 ml → 10 ml → bottle ladder, discovery set, and store credit toward a bottle.

**Why:** fragrance is unusually hard to buy from a screen. Reducing blind-buy risk is a product decision, not a decorative upsell.

## Procedural placeholder art, not invented photoreal product imagery

**Chosen:** clearly labelled SVG/canvas placeholders and an asset manifest for replacement.

**Why not generate fake bottle photography:** product photography is evidence. Invented packaging can misrepresent shape, colour, scale and finish. The design should survive the replacement with real assets.

## URL-backed quiz, not a state-heavy SPA wizard

**Chosen:** normal GET form with six questions; JavaScript can enhance it later.

**Why:** it stays keyboard-native, shareable, debuggable, index-safe and usable if hydration fails.

## Legal placeholders are explicit, not fabricated policies

**Chosen:** returns/privacy/terms pages say merchant/legal approval is required.

**Why:** polished fiction is still fiction. A production codebase must not silently invent return rights, tax promises, authenticity claims or support contacts.
