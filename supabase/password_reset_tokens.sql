-- Run this to enable email-based "forgot password" reset links.
-- Tokens are hashed; we send the raw token in the email link and verify by comparing hash.

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_id on public.password_reset_tokens (user_id);
create index if not exists password_reset_tokens_expires_at on public.password_reset_tokens (expires_at);
