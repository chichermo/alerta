create extension if not exists "pgcrypto";

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  confidence text not null default 'observacion',
  lat double precision not null,
  lng double precision not null,
  reports_count integer not null default 1,
  source text not null default 'ciudadano',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  evidence_url text,
  source text not null default 'ciudadano',
  created_at timestamptz not null default now()
);

create index if not exists incidents_type_idx on public.incidents (type);
create index if not exists incidents_updated_idx on public.incidents (updated_at);
create index if not exists incidents_lat_lng_idx on public.incidents (lat, lng);

alter table public.incidents enable row level security;
alter table public.reports enable row level security;

create policy "public read incidents"
  on public.incidents
  for select
  to anon
  using (true);

create policy "public insert incidents"
  on public.incidents
  for insert
  to anon
  with check (true);

create policy "public update incidents"
  on public.incidents
  for update
  to anon
  using (true)
  with check (true);

create policy "public read reports"
  on public.reports
  for select
  to anon
  using (true);

create policy "public insert reports"
  on public.reports
  for insert
  to anon
  with check (true);
