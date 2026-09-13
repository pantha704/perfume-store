-- 0003: persist the payment provider that created each order's payment.
-- Verification (and future refunds) must run through the adapter that created
-- the payment, even if the deployment's configured provider changes later.

alter table public.orders add column if not exists payment_provider text;

comment on column public.orders.payment_provider is 'Payment provider key that created payment_order_id (mock, razorpay, ...)';
