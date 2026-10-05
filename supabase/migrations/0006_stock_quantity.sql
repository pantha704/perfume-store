-- 0006: per-variant stock counts (admin back-office, Oct 2026)
-- null = not tracked (current behaviour); 0 = sold out; >0 = units on hand.
-- The storefront treats a variant as available when is_active AND
-- (stock_quantity is null OR stock_quantity > 0).

alter table public.variants add column if not exists stock_quantity integer;

alter table public.variants
  add constraint variants_stock_quantity_nonnegative
  check (stock_quantity is null or stock_quantity >= 0);
