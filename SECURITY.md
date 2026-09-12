# Security model

1. **Price/stock authority:** browser values are never trusted. Checkout reloads variants and price.
2. **Payments:** Razorpay orders are created server-side. Checkout signature is HMAC-verified. Webhook signature is verified over the raw body and webhook event IDs are unique/idempotent.
3. **Fulfillment:** paid order required; external submission is gated by `FULFILLMENT_LIVE_ENABLED`; provider adapters are server-only.
4. **Secrets:** service-role, Razorpay secret, Amazon and Shiprocket credentials are never `NEXT_PUBLIC_*`.
5. **Guest orders:** tracking token is random; only SHA-256 digest is stored.
6. **Database:** RLS remains enabled on all client-visible/operational tables; service role is restricted to server code.
7. **Admin:** authenticated user + `profiles.role='admin'`; demo admin mutations fail closed.
8. **Mutation origin:** route handlers reject foreign Origin values.
9. **Turnstile:** optional but supported for checkout; if a secret is configured, a token becomes mandatory.
10. **Headers:** CSP, frame denial, nosniff, referrer and Permissions Policy are applied in Next config.

Before production: rotate all test credentials, configure webhook URLs/secrets, confirm CSP against actual PostHog/asset hosts, run dependency/security scanning, test RLS with anonymous/customer/admin accounts, and exercise payment/fulfillment idempotency in sandboxes.
