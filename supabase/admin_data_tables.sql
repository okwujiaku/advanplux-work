-- Admin-only data: gift codes, announcements, bonus withdrawals, investment (topup/deduct) history, admin users.
-- Run after phase1_users_schema and user_wallet_deposits_withdrawals_earnings.

-- Gift codes (admin generates; users redeem)
create table if not exists public.gift_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  value_usd numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Announcements (admin posts; shown to users)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz not null default now()
);

-- Bonus withdrawals (admin creates/approves for members)
create table if not exists public.bonus_withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount_usd numeric not null default 0,
  account_number text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists bonus_withdrawals_user_id on public.bonus_withdrawals (user_id);
create index if not exists bonus_withdrawals_status on public.bonus_withdrawals (status);

-- Admin investment history (topup / deduct log)
create table if not exists public.admin_investment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  amount_usd numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists admin_investment_history_user_id on public.admin_investment_history (user_id);

-- Admin users (email + password for admin panel login)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists admin_users_email_lower on public.admin_users (lower(email));

-- Seed first admin (run once; replace email/password with your own):
-- INSERT INTO public.admin_users (email, password_hash)
-- SELECT 'your-admin@example.com', crypt('YourSecurePassword', gen_salt('bf'))
-- WHERE NOT EXISTS (SELECT 1 FROM public.admin_users LIMIT 1);
-- Or use API: POST /api/admin/admin-users with header X-Admin-Key: <ADMIN_SECRET> and body { email, password }.
