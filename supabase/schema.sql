-- Run this once in the Supabase SQL editor for your project.

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'other' check (category in ('pokemon', 'nhl', 'other')),
  name text,
  set_name text,
  year text,
  card_number text,
  variant text,
  condition_notes text,
  image_url text,
  acquisition_cost numeric,
  acquisition_date date,
  last_sold_price numeric,
  last_listed_price numeric,
  collectr_value numeric,
  status text not null default 'held' check (status in ('held', 'sold')),
  sold_price numeric,
  sold_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table cards enable row level security;

-- Single-user personal app: the anon key is gated behind the app's own
-- passcode login, so a permissive policy is acceptable here.
create policy "allow all on cards" on cards
  for all using (true) with check (true);

-- Storage bucket for card photos.
insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', true)
on conflict (id) do nothing;

create policy "allow all on card-images" on storage.objects
  for all using (bucket_id = 'card-images') with check (bucket_id = 'card-images');
