# Launch checklist

- [ ] Real brand name, logo, domain and support details approved.
- [ ] Every perfume name is legally/merchant-approved; no accidental third-party trademark/dupe positioning.
- [ ] Real product photography replaces labelled placeholder SVG/canvas art.
- [ ] Final prices, GST/tax treatment, SKU, weight and inventory approved.
- [ ] Return/refund/privacy/terms text approved by merchant/legal counsel.
- [ ] Supabase production project: migrations applied, RLS tested as anon/customer/admin.
- [ ] Razorpay test mode passed: success, failure, refresh, webhook replay/idempotency, refund workflow.
- [ ] Fulfillment provider chosen and each provider mapping validated; quote/create/status/cancel tested in sandbox/test mode.
- [ ] Perfume/dangerous-goods courier eligibility confirmed for the actual formula and shipment method.
- [ ] `FULFILLMENT_LIVE_ENABLED` stays false until the exact launch cutover.
- [ ] Turnstile/CSP/analytics configured for production domains.
- [ ] CI green: lint, architecture tests, unit tests, typecheck, production build.
- [ ] Playwright desktop/mobile/reduced-motion paths green; no horizontal overflow.
- [ ] Lighthouse/accessibility budgets reviewed on deployed preview.
- [ ] Backup/restore, incident contact and order-reconciliation procedure documented.
