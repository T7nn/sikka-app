-- Sikka dynamic taxonomy: categories table + safe delete RPC
-- Run in Supabase SQL editor or via CLI migration.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text not null check (sector in ('Food', 'Services', 'Events')),
  created_at timestamptz not null default now(),
  unique (name, sector)
);

alter table public.events
  add column if not exists category text;

create or replace function public.delete_category_safely(category_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cat_name text;
  cat_sector text;
begin
  select c.name, c.sector
  into cat_name, cat_sector
  from public.categories c
  where c.id = category_id;

  if cat_name is null then
    return;
  end if;

  if cat_sector in ('Food', 'Services') then
    update public.businesses b
    set activities = array_remove(b.activities, cat_name)
    where b.main_category = cat_sector
      and b.activities @> array[cat_name];
  elsif cat_sector = 'Events' then
    update public.events e
    set category = null
    where e.category = cat_name;

    update public.events e
    set event_type = null
    where e.event_type = cat_name;
  end if;

  delete from public.categories where id = category_id;
end;
$$;

-- Seed default taxonomy (idempotent)
insert into public.categories (name, sector) values
  ('Coffee', 'Food'),
  ('Dessert', 'Food'),
  ('Pastry', 'Food'),
  ('Lemonade', 'Food'),
  ('Beverages', 'Food'),
  ('Consulting', 'Services'),
  ('Maintenance', 'Services'),
  ('Tech Support', 'Services'),
  ('Design', 'Services'),
  ('Legal', 'Services'),
  ('Festival', 'Events'),
  ('Pop-up', 'Events'),
  ('Market', 'Events'),
  ('Workshop', 'Events'),
  ('Concert', 'Events')
on conflict (name, sector) do nothing;
