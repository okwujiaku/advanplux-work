-- Security PIN: we never store the user's 4-digit PIN in plain text.
-- We store a "hash" of it (pin_hash): a one-way fingerprint. When the user enters their PIN,
-- we hash it the same way and compare. If it matches the stored hash, the PIN is correct.
-- Even if someone gets the database, they cannot reverse the hash to get the real PIN.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  email text not null,
  password_hash text not null,
  invitation_code text not null,
  referred_by_user_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  pin_hash text null
);

create unique index if not exists users_email_unique on public.users (lower(email));
create unique index if not exists users_phone_unique on public.users (phone);
create unique index if not exists users_invitation_code_unique on public.users (invitation_code);

