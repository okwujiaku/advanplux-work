-- Add active_pack_usd to user_wallet: the Ads Engine package the user has activated (paid from balance).
-- Run after user_wallet_deposits_withdrawals_earnings.sql
alter table public.user_wallet
  add column if not exists active_pack_usd numeric null;

comment on column public.user_wallet.active_pack_usd is 'Ads Engine pack activated (e.g. 20, 50, 100 USD). Set when user activates a pack from balance.';
