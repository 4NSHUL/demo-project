-- Complaint Register demo schema.
-- This intentionally allows anonymous access for an event demo. Do not use
-- these grants or this security posture for a production community system.

create extension if not exists pgcrypto;

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique,
  resident_name text not null,
  block_number text not null check (block_number in ('Block A', 'Block B', 'Block C', 'Block D', 'Block E')),
  flat_number text not null,
  phone_number text,
  complaint_category text not null check (complaint_category in ('Individual', 'Community')),
  complaint_type text not null,
  created_date date not null default current_date,
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Resolved', 'Closed')),
  estimated_resolution_date date,
  comment text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  from_status text,
  to_status text not null check (to_status in ('Open', 'In Progress', 'Resolved', 'Closed')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists complaints_updated_at_idx on public.complaints(updated_at desc);
create index if not exists complaint_history_complaint_idx
  on public.complaint_status_history(complaint_id, created_at);

create or replace function public.set_complaint_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at
before update on public.complaints
for each row execute function public.set_complaint_updated_at();

alter table public.complaints disable row level security;
alter table public.complaint_status_history disable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on public.complaints to anon;
grant select, insert, update, delete on public.complaint_status_history to anon;
