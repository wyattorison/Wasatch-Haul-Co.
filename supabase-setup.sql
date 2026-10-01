-- Wasatch Haul Co. – quote requests table
-- Paste this whole file into Supabase → SQL Editor → New query, then click Run.

create table if not exists public.quote_requests (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text not null check (char_length(name) between 1 and 100),
  phone         text not null check (char_length(phone) between 7 and 30),
  zip           text check (char_length(zip) <= 10),
  customer_type text not null default 'homeowner'
                check (customer_type in ('homeowner','agent','landlord','estate')),
  load_size     text not null default 'unsure'
                check (load_size in ('single','quarter','half','three_quarter','full','unsure')),
  needed_by     date,
  details       text check (char_length(details) <= 2000),
  status        text not null default 'new'
                check (status in ('new','quoted','booked','done','lost'))
);

-- Turn on Row Level Security: nobody can do anything unless a policy allows it.
alter table public.quote_requests enable row level security;

-- Website visitors (the "anon" role) may ADD a quote request, and nothing else.
-- They cannot read, edit, or delete anyone's requests.
drop policy if exists "Public can submit quotes" on public.quote_requests;
create policy "Public can submit quotes"
  on public.quote_requests
  for insert
  to anon
  with check (status = 'new');

grant insert on public.quote_requests to anon;

-- You view and manage requests from the Supabase dashboard (Table Editor),
-- which bypasses these rules because you're the project owner.
