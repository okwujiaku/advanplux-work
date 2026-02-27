-- One row per user: withdrawal payout account. Add once, no updates (enforced in API).
create table if not exists public.user_withdrawal_details (
  user_id uuid primary key references public.users(id) on delete cascade,
  currency text not null default 'NGN',
  account_name text not null,
  account_number text not null,
  bank_name text not null,
  created_at timestamptz not null default now()
);

comment on table public.user_withdrawal_details is 'Payout account for withdrawals; set once per user.';
