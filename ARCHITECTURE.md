# Architecture

## System boundary

```text
Browser
  ├─ Next.js App Router UI (Server Components first)
  ├─ small client islands: motion, cart, checkout, quiz enhancement, admin actions
  ↓
Next.js route handlers on Cloudflare Workers / OpenNext
  ├─ catalogue + auth → Supabase
  ├─ payment service → Razorpay
  ├─ analytics + audit → Supabase
  └─ fulfillment service → FulfillmentProvider contract
                              ├─ Amazon MCF adapter
                              ├─ Shiprocket adapter
                              └─ Manual adapter
```

Checkout, order persistence and payment code never import Amazon or Shiprocket. They ask the fulfillment registry for the configured adapter. Website SKU is stable; provider IDs live in `variant_fulfillment_mappings`. This is the seam that lets fulfillment change later without rewriting commerce.

## Trust boundaries

The browser sends `variantId + quantity + address + gift preferences`. `lib/checkout.ts` reloads every variant, price, active state and fulfillment mapping server-side. Money is integer paise. Razorpay signatures are verified on the server; webhook verification uses the raw body and deduplicates provider event IDs. Guest tracking stores only a SHA-256 hash of the secret token.

## Data model

Core tables: `products → variants → variant_fulfillment_mappings`; `profiles`, `addresses`; `orders → order_items → fulfillment_attempts`; `webhook_events`; `analytics_events`; `audit_log`; additive migration `0002_nextjs_commerce.sql` adds product metadata, variant kind, gift fields and `store_credits`.

Store-credit reservation is transactional in PostgreSQL so two simultaneous checkouts cannot spend the same discovery credit. Credit is consumed only after payment is verified and released if payment fails/expires.

## Rendering

Catalogue/PDP shells, policy content, SEO routes and account shells are Server Components. Client JS is limited to interactions that actually need browser state: the cinematic timeline, cart local storage, variant selection, payment checkout, note tabs and admin actions.

## Deployment

Next.js runs through `@opennextjs/cloudflare` on Workers with `nodejs_compat`. `middleware.ts` is retained intentionally for OpenNext compatibility. The application can also run with normal `next dev` / `next build` locally.
