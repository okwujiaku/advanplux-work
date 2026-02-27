-- Run this if public.users already exists (adds security PIN hash column).
-- Pin hash = one-way fingerprint of the 4-digit PIN. We never store the real PIN;
-- we only store the hash and verify by hashing the entered PIN and comparing.

alter table public.users add column if not exists pin_hash text null;
