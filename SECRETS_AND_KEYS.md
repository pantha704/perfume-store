# Secrets and keys

Copy `.env.example` to `.env.local` locally. In Cloudflare, set server secrets with Wrangler/dashboard encrypted secrets rather than committing them.

**Public/baked into browser:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, optional Turnstile site key, optional PostHog public key, optional hero frame base.

**Server-only:** `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, all Amazon LWA/SP-API values, all Shiprocket credentials.

Do not use `NEXT_PUBLIC_` for a secret. Do not commit `.env.local` or `.dev.vars`.
