-- Perfume storefront schema. PostgreSQL / Supabase.
create extension if not exists pgcrypto;

create type public.profile_role as enum ('customer','admin');
create type public.payment_status as enum ('pending','paid','failed','refund_pending','refunded');
create type public.fulfillment_status as enum ('unfulfilled','submitted','processing','shipped','in_transit','out_for_delivery','delivered','cancelled','attention_required');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.profile_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country_code text not null default 'IN',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  eyebrow text not null default '',
  short_description text not null default '',
  description text not null default '',
  family text not null,
  concentration text not null default 'Eau de Parfum',
  image_url text not null,
  image_alt text not null default '',
  accent text not null default '#8d6c4f',
  notes jsonb not null default '{"top":[],"heart":[],"base":[]}'::jsonb,
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  label text not null,
  size_ml integer not null check (size_ml > 0),
  price_paise integer not null check (price_paise >= 0),
  compare_at_paise integer,
  weight_grams integer not null default 300,
  preferred_fulfillment_provider text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Provider-neutral mapping: the website SKU is stable; each provider gets its own identifier/config.
create table public.variant_fulfillment_mappings (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.variants(id) on delete cascade,
  provider text not null check (provider in ('amazon_mcf','shiprocket','manual')),
  provider_sku text,
  inventory_sku text,
  priority integer not null default 100,
  enabled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (variant_id, provider)
);

create table public.inventory_snapshots (
  id bigint generated always as identity primary key,
  variant_id uuid references public.variants(id) on delete cascade,
  provider text not null,
  provider_sku text not null,
  available_quantity integer not null default 0,
  raw_payload jsonb,
  captured_at timestamptz not null default now()
);
create index inventory_latest_idx on public.inventory_snapshots(provider, provider_sku, captured_at desc);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text not null,
  customer_name text not null,
  shipping_address jsonb not null,
  currency text not null default 'INR',
  subtotal_paise integer not null check (subtotal_paise >= 0),
  shipping_paise integer not null default 0 check (shipping_paise >= 0),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  total_paise integer not null check (total_paise >= 0),
  payment_status public.payment_status not null default 'pending',
  payment_order_id text unique,
  payment_id text,
  refund_id text,
  paid_at timestamptz,
  fulfillment_provider text,
  fulfillment_service_code text,
  fulfillment_quote jsonb,
  provider_order_id text,
  fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  fulfillment_last_synced_at timestamptz,
  tracking_number text,
  tracking_url text,
  estimated_delivery text,
  guest_access_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id, created_at desc);
create index orders_fulfillment_idx on public.orders(fulfillment_status, created_at);
create index orders_provider_idx on public.orders(fulfillment_provider, provider_order_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.variants(id) on delete set null,
  product_name text not null,
  variant_label text not null,
  sku text not null,
  provider_sku text,
  quantity integer not null check (quantity > 0),
  unit_price_paise integer not null check (unit_price_paise >= 0),
  line_total_paise integer not null check (line_total_paise >= 0),
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);

create table public.fulfillment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  idempotency_key text not null unique,
  status text not null,
  provider_order_id text,
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text,
  payload jsonb,
  processed_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index analytics_events_name_created_idx on public.analytics_events(event_name, created_at desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger products_updated before update on public.products for each row execute function public.set_updated_at();
create trigger variants_updated before update on public.variants for each row execute function public.set_updated_at();
create trigger mappings_updated before update on public.variant_fulfillment_mappings for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();
create trigger fulfillment_attempts_updated before update on public.fulfillment_attempts for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email,full_name) values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.variant_fulfillment_mappings enable row level security;
alter table public.inventory_snapshots enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.fulfillment_attempts enable row level security;
alter table public.webhook_events enable row level security;
alter table public.analytics_events enable row level security;
alter table public.audit_log enable row level security;

-- Public catalogue is readable, operational/provider mapping is not.
create policy "public read active products" on public.products for select using (is_active = true);
create policy "public read active variants" on public.variants for select using (is_active = true);

create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "users manage own addresses" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "users read own order items" on public.order_items for select using (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Service-role server bypasses RLS for checkout, payments, webhooks, provider calls and admin operations.
