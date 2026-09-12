# Deployment — Cloudflare Workers / OpenNext

1. Complete Supabase migrations and seed only approved production data.
2. Configure Cloudflare Worker variables/secrets from `.env.example` (never commit live values).
3. Keep `FULFILLMENT_LIVE_ENABLED=false` through payment and provider sandbox testing.
4. Run `npm run verify`.
5. Run `npm run deploy` to build through OpenNext and deploy the Worker.
6. Set the custom domain and update `NEXT_PUBLIC_SITE_URL`.
7. Configure Razorpay webhook to `/api/payments/webhook` and its secret.
8. Only after end-to-end sandbox validation, set the chosen provider enabled and then explicitly enable live fulfillment.

Rollback is code/config based; provider logic is isolated so disabling live fulfillment immediately prevents new external submissions while preserving order intake for investigation.
