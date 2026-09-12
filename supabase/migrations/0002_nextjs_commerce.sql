-- Additive migration for the Next.js cinematic storefront.
-- Safe to apply after 0001_schema.sql; no destructive rewrites.

alter table public.products add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.variants add column if not exists kind text not null default 'bottle'
  check (kind in ('sample','travel','bottle','discovery'));

alter table public.orders add column if not exists gift jsonb not null default '{"isGift":false}'::jsonb;
alter table public.orders add column if not exists credit_applied_paise integer not null default 0 check (credit_applied_paise >= 0);
alter table public.orders add column if not exists store_credit_id uuid;
alter table public.order_items add column if not exists variant_kind text not null default 'bottle'
  check (variant_kind in ('sample','travel','bottle','discovery'));
alter table public.order_items add column if not exists weight_grams integer not null default 300
  check (weight_grams > 0);

create table if not exists public.store_credits (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source_order_id uuid references public.orders(id) on delete set null,
  amount_paise integer not null check (amount_paise > 0),
  remaining_paise integer not null check (remaining_paise >= 0),
  reserved_order_id uuid references public.orders(id) on delete set null,
  reserved_paise integer not null default 0 check (reserved_paise >= 0),
  reserved_until timestamptz,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists store_credits_email_idx on public.store_credits(lower(email), expires_at, created_at);
create index if not exists store_credits_reservation_idx on public.store_credits(reserved_order_id, reserved_until);

do $$ begin
  alter table public.orders add constraint orders_store_credit_fk
    foreign key (store_credit_id) references public.store_credits(id) on delete set null;
exception when duplicate_object then null; end $$;

alter table public.store_credits enable row level security;

-- Customers may inspect credits attached to their verified account email. Server/service role creates and reserves credits.
do $$ begin
  create policy "users read own store credits" on public.store_credits
    for select using (
      lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    );
exception when duplicate_object then null; end $$;

create or replace function public.set_store_credit_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop triggger if exists store_credit_updated on public.store_credits;
create trigger store_credit_updated before update on public.store_credits
for each row execute function public.set_store_credit_updated_at();

-- Reserve at most one credit row per checkout. Uses a row lock so concurrent checkouts cannot spend it twice.
create or replace function public.reserve_store_credit(
  p_email text,
  p_order_id uuid,
  p_max_paise integer) returns table(credit_id uuid, reserved_paise integer)
language plpgsql security definer set search_path = public as $$
declare
  c public.store_credits%rowtype;
  amount integer;
begin
  if p_max_paise <= 0 then return; end if;

  -- Release stale reservation on a matching credit before selecting.
  update public.store_credits
     set reserved_order_id = null, reserved_paise = 0, reserved_until = null
   where lower(email) = lower(p_email)
     and reserved_until is not null and reserved_until < now()
     and consumed_at is null;

  select * into c
    from public.store_credits
   where lower(email) = lower(p_email)
     and remaining_paise > 0
     and consumed_at is null
     and expires_at > now()
     and (reserved_order_id is null or reserved_order_id = p_order_id)
   order by expires_at asc, created_at asc
   for update skip locked
   limit 1;

  if not found then return; end if;
  amount := least(c.remaining_paise, p_max_paise);

  update public.store_credits
     set reserved_order_id = p_order_id,
         reserved_paise = amount,
         reserved_until = now() + interval '20 minutes'
   where id = c.id;

  credit_id := c.id;
  reserved_paise := amount;
  return next;
end $$;

create or replace function public.consume_store_credit(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  c public.store_credits%rowtype;
begin
  select * into c from public.store_credits
   where reserved_order_id = p_order_id
     and consumed_at is null
     and reserved_until > now()
   for update;
  if not found then return; end if;

  update public.store_credits
     set remaining_paise = greatest(0, remaining_paise - reserved_paise),
         consumed_at = case when remaining_paise - reserved_paise <= 0 then now() else null end,
         reserved_order_id = null,
         reserved_paise = 0,
         reserved_until = null
   where id = c.id;
end $$;

create or replace function public.release_store_credit(p_order_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.store_credits
     set reserved_order_id = null, reserved_paise = 0, reserved_until = null
   where reserved_order_id = p_order_id and consumed_at is null;
$$;

-- Operational functions are server-only. Do not grant direct client execution.
revoke all on function public.reserve_store_credit(text, uuid, integer) from public, anon, authenticated;
revoke all on function public.consume_store_credit(uuid) from public, anon, authenticated;
revoke all on function public.release_store_credit(uuid) from public, anon, authenticated;
grant execute on function public.reserve_store_credit(text, uuid, integer) to service_role;
grant execute on function public.consume_store_credit(uuid) to service_role;
grant execute on function public.release_store_credit(uuid) to service_role;
