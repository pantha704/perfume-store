-- 0004: reviews + contact messages (client batch, Sep 2026)
-- Reviews are user-submitted and moderated from the admin console.
-- Contact messages are stored for the admin inbox (no mail provider configured yet).

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending','published','hidden')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists reviews_product_status_idx on public.reviews (product_id, status, created_at desc);

alter table public.reviews enable row level security;

-- Public can read published reviews; everything else goes through the server
-- (service role) after auth + validation.
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select using (status = 'published');

-- Contact messages: insert-only via the server route; no public read.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','archived')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);

alter table public.contact_messages enable row level security;
