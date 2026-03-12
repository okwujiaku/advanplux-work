# Clean up test users before production launch

## What this does

- **Removes all registered members** from `public.users` (the "Registered Members" list in admin).
- **Automatically clears related data** (via foreign key CASCADE):
  - Wallets, balances
  - Deposits (all)
  - Withdrawals (all)
  - Earnings history
  - Withdrawal details (payout accounts)
  - Bonus withdrawals
  - Admin investment (topup/deduct) history
  - Active Ads Engine packs
  - Password reset tokens
- **Does NOT touch:**
  - `admin_users` (admin panel login – your admin account stays)
  - `gift_codes`, `announcements`, `platform_bank_accounts`

## Before you run the script

1. **Backup**  
   In Supabase: Dashboard → Database → Backups, or export the `public` schema / key tables.

2. **Confirm environment**  
   Make sure you are in the **correct Supabase project** (production). Check the project name and URL in the SQL editor.

3. **Optional: keep one “real” user**  
   If you have a single non-test account in `public.users` you want to keep (e.g. your own member account), note its email or id and use the **optional** version of the script that excludes it (see comments in the SQL file).

## How to run

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Open `supabase/clear_test_users.sql`.
3. Run **Step 1 (dry run)** first: it only **SELECT**s and shows what would be removed. Review the counts and rows.
4. If everything looks correct, run **Step 2** in a new query: it **DELETE**s all test users. All related rows are removed by CASCADE.

## After running

- Registered Members in admin will be empty.
- Deposits, Withdrawals, and other user-related admin lists will be empty.
- New signups will appear as the only members.
- Your admin login (`admin_users`) is unchanged.
