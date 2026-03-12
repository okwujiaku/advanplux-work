-- Add from_user_id to earnings_history so we can attribute referral/team commission to the member who generated it.
alter table public.earnings_history
  add column if not exists from_user_id uuid references public.users(id) on delete set null;

create index if not exists earnings_history_from_user_id on public.earnings_history (from_user_id);
