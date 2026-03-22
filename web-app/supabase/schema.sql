-- Infinit Code · Supabase Schema
-- Run this in your Supabase SQL editor

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  created_at  timestamptz default now()
);

create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references users(id) on delete cascade,
  stripe_subscription_id   text unique not null,
  status                   text not null,  -- active | past_due | canceled
  plan                     text default 'pro',
  current_period_end       timestamptz,
  created_at               timestamptz default now()
);

create table if not exists licenses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete cascade unique,
  subscription_id uuid references subscriptions(id),
  key             text unique not null,
  plan            text default 'pro',
  created_at      timestamptz default now()
);

create table if not exists license_validations (
  id            uuid primary key default gen_random_uuid(),
  license_id    uuid references licenses(id),
  source        text,   -- 'vscode-extension' | etc
  ip            text,
  validated_at  timestamptz default now()
);

-- Indexes
create index if not exists idx_licenses_key             on licenses(key);
create index if not exists idx_subscriptions_stripe_id  on subscriptions(stripe_subscription_id);
create index if not exists idx_validations_license_id   on license_validations(license_id);

-- Row Level Security
alter table users           enable row level security;
alter table subscriptions   enable row level security;
alter table licenses        enable row level security;

-- Policy: users can only see their own data
create policy "users: own data"         on users         for all using (auth.uid() = id);
create policy "subscriptions: own data" on subscriptions for all using (user_id = auth.uid());
create policy "licenses: own data"      on licenses      for all using (user_id = auth.uid());

-- Service role can do everything (for webhook/API)
-- (Service key bypasses RLS automatically)
