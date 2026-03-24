-- ════════════════════════════════════════════════════════════
-- Infinit Code · Billing Schema v1
-- Aplica no Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════

-- ════════════════════════════════════
-- USUÁRIOS
-- ════════════════════════════════════
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  avatar_url    text,
  provider      text not null default 'google', -- 'google' | 'github'
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- ════════════════════════════════════
-- ASSINATURAS
-- ════════════════════════════════════
create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references users(id) on delete cascade,
  pagarme_customer_id      text unique,
  pagarme_subscription_id  text unique,
  pagarme_plan_id          text,
  status                   text not null default 'pending',
  -- status: pending | active | past_due | canceled | expired
  payment_method           text,
  -- payment_method: credit_card | pix | boleto
  period_start             timestamptz,
  period_end               timestamptz,
  cancel_at_cycle_end      boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_subscriptions_status  on subscriptions(status);

-- ════════════════════════════════════
-- LICENÇAS
-- ════════════════════════════════════
create table if not exists license_keys (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  key           text unique not null,
  -- formato: INFT-XXXX-XXXX-XXXX-XXXX
  status        text not null default 'active',
  -- status: active | revoked | expired
  activated_at  timestamptz,
  validated_at  timestamptz,
  device_id     text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_license_keys_user_id on license_keys(user_id);
create index if not exists idx_license_keys_key     on license_keys(key);

-- ════════════════════════════════════
-- PAGAMENTOS
-- ════════════════════════════════════
create table if not exists payments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references users(id) on delete cascade,
  pagarme_charge_id  text unique,
  pagarme_invoice_id text,
  amount_cents       int not null,
  currency           text not null default 'BRL',
  payment_method     text,
  status             text not null,
  -- status: paid | failed | pending | refunded | waiting_payment
  type               text not null,
  -- type: new | renewal | reactivation
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists idx_payments_user_id on payments(user_id);
create index if not exists idx_payments_status  on payments(status);

-- ════════════════════════════════════
-- EVENTOS (audit trail completo)
-- ════════════════════════════════════
create table if not exists events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete set null,
  type       text not null,
  -- purchased | renewed | canceled | reactivated | payment_failed
  -- pix_generated | boleto_generated | license_activated | license_revoked
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_user_id on events(user_id);
create index if not exists idx_events_type    on events(type);
create index if not exists idx_events_created on events(created_at desc);

-- ════════════════════════════════════
-- RLS (Row Level Security)
-- ════════════════════════════════════
alter table users          enable row level security;
alter table subscriptions  enable row level security;
alter table license_keys   enable row level security;
alter table payments       enable row level security;

-- Usuário só vê seus próprios dados (portal do cliente)
create policy "users_own"         on users         for all using (auth.uid() = id);
create policy "subscriptions_own" on subscriptions for all using (auth.uid() = user_id);
create policy "licenses_own"      on license_keys  for all using (auth.uid() = user_id);
create policy "payments_own"      on payments      for all using (auth.uid() = user_id);

-- events: apenas service role (webhook) — sem policy pública
-- dashboard admin usa SUPABASE_SERVICE_KEY no servidor (nunca no browser)
