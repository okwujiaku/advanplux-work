-- Platform bank accounts (admin-managed payout accounts for deposits).
-- Admin panel will read/write via API with admin auth.
create table if not exists public.platform_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

-- Admin users: for admin panel login (email + password). Optional: run after adding first admin.
-- create table if not exists public.admin_users (
--   id uuid primary key default gen_random_uuid(),
--   email text not null unique,
--   password_hash text not null,
--   created_at timestamptz not null default now()
-- );
