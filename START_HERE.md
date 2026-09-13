# Start here

1. Install Node 22+, then `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Leave `NEXT_PUBLIC_DEMO_MODE=true` and `FULFILLMENT_LIVE_ENABLED=false` for the first run.
4. Run `npm run dev` and review `/`, `/shop`, `/product/invictus`, `/samples`, `/quiz`, `/cart`, `/checkout`, `/account`, `/admin`.
5. Create a Supabase project and apply `0001_schema.sql`, then `0002_nextjs_commerce.sql`; `supabase/seed.sql` is intentionally empty until the client confirms real catalogue data (the old demo catalogue is archived under `docs/legacy/`).
6. Add Razorpay test credentials and webhook secret; keep provider submission off while payment paths are tested.
7. Decide fulfillment: Amazon MCF, Shiprocket, or another adapter. Map every live SKU and validate quotes/tracking/cancellation before enabling it.
8. Replace all placeholder product art, merchant/legal placeholder copy and demo prices.
9. Run `npm run verify` plus Playwright/Lighthouse checks, then deploy.
