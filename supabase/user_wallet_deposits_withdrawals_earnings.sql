-- User wallet: one row per user (balance in USD).
create table if not exists public.user_wallet (
  user_id uuid primary key references public.users(id) on delete cascade,
  balance_usd numeric not null default 0 check (balance_usd >= 0),
  updated_at timestamptz not null default now()
);

-- Deposits: user deposit requests (pack purchase payments).
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount text,
  amount_usd numeric not null default 0,
  currency text,
  country text,
  payment_type text,
  account_name text,
  account_number text,
  bank_name text,
  account_used text,
  pack jsonb,
  date timestamptz not null default now(),
  status text not null default 'pending',
  approved_at timestamptz,
  rejected_at timestamptz,
  reversed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists deposits_user_id on public.deposits (user_id);
create index if not exists deposits_status on public.deposits (status);

-- Withdrawals: user withdrawal requests.
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount_usd numeric not null default 0,
  fee_usd numeric default 0,
  net_amount_usd numeric default 0,
  currency text,
  account_number text,
  account_name text,
  bank_name text,
  date timestamptz not null default now(),
  status text not null default 'pending',
  approved_at timestamptz,
  rejected_at timestamptz,
  reversed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists withdrawals_user_id on public.withdrawals (user_id);
create index if not exists withdrawals_status on public.withdrawals (status);

-- Earnings history: watch-ads, referral, team-salary, etc.
create table if not exists public.earnings_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source text not null,
  amount_usd numeric not null default 0,
  note text,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists earnings_history_user_id on public.earnings_history (user_id);
