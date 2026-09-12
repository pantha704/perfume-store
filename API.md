# API surface

- `POST /api/checkout` — server-price cart, quote shipping, create pending order, create Razorpay order.
- `POST /api/fulfillment/quote` — server-authoritative quote preview.
- `POST /api/payments/verify` — verify Razorpay checkout signature; mark paid; submit fulfillment only if live gate is enabled.
- `POST /api/payments/webhook` — raw-body signature verification + idempotent event recording.
- `GET /api/orders/track?id=...&token=...` — guest tracking; token hash is compared server-side.
- `POST /api/analytics` — allowlisted first-party events.
- `PATCH /api/admin/products` — admin-only product/variant mutations + audit log.
- `PATCH /api/admin/orders` — admin-only fulfillment cancellation/attention transitions + audit log.
