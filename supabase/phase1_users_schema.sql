create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  email text not null,
  password_hash text not null,
  invitation_code text not null,
  referred_by_user_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists users_email_unique on public.users (lower(email));
create unique index if not exists users_phone_unique on public.users (phone);
create unique index if not exists users_invitation_code_unique on public.users (invitation_code);

