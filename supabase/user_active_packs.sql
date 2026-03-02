-- Multiple active Ads Engine packs per user (stacking). Run after user_wallet_deposits_withdrawals_earnings.sql and user_wallet_active_pack.sql.
-- Each activation adds a row; Watch & Earn uses sum(ads_per_day) across all packs.

create table if not exists public.user_active_packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pack_usd numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists user_active_packs_user_id on public.user_active_packs (user_id);

comment on table public.user_active_packs is 'One row per activated Ads Engine pack; ads per day = sum of pack ads.';

-- Migrate existing single active_pack_usd into user_active_packs (run once)
insert into public.user_active_packs (user_id, pack_usd)
select user_id, active_pack_usd
from public.user_wallet
where active_pack_usd is not null
  and not exists (select 1 from public.user_active_packs uap where uap.user_id = user_wallet.user_id);
