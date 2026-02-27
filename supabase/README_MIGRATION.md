# Supabase migration – wallet, deposits, withdrawals, earnings, admin

## 1. Run SQL in Supabase (in order)

In Supabase → SQL Editor, run:

1. **user_wallet_deposits_withdrawals_earnings.sql**  
   Creates: `user_wallet`, `deposits`, `withdrawals`, `earnings_history`.

2. **admin_platform_bank_accounts.sql**  
   Creates: `platform_bank_accounts` (for admin payout accounts).

(You should already have run `user_withdrawal_details.sql` and `phase1_users_schema.sql` earlier.)

## 2. Environment variables (Vercel / host)

- **AUTH_JWT_SECRET** – already used for user auth.
- **SUPABASE_URL** – already set.
- **SUPABASE_SERVICE_ROLE_KEY** – already set.
- **ADMIN_SECRET** (new) – shared secret for admin-only APIs. Set this in Vercel (e.g. a long random string). Admin requests must send header: `X-Admin-Key: <ADMIN_SECRET>`.

## 3. User data (when user is logged in)

- Wallet, deposits, withdrawals, and earnings are stored in Supabase and loaded/saved via the existing user JWT.
- If the user has no token (e.g. invitation-code only), data stays in localStorage as before.

## 4. Admin data (platform bank accounts, deposits, withdrawals)

- **Platform bank accounts:** Table `platform_bank_accounts` and API:
  - `GET /api/admin/platform-bank-accounts` – list (header: `X-Admin-Key: <ADMIN_SECRET>`).
  - `POST /api/admin/platform-bank-accounts` – add.
  - `DELETE /api/admin/platform-bank-accounts?id=<uuid>` – delete.

- **Deposits (all):**  
  - `GET /api/admin/deposits` – list all.  
  - `PATCH /api/admin/deposits` – body `{ id, status: 'approved'|'rejected'|'reversed' }`.

- **Withdrawals (all):**  
  - `GET /api/admin/withdrawals` – list all.  
  - `PATCH /api/admin/withdrawals` – body `{ id, status: 'approved'|'rejected'|'reversed' }`.  
  Approve/reverse update `user_wallet` in Supabase.

To use these from the admin panel you can add an optional “Admin API key” field (same value as `ADMIN_SECRET`), store it in sessionStorage, and send it as `X-Admin-Key` when calling these endpoints. Until then, the admin panel keeps using localStorage for bank accounts and useApp() for deposits/withdrawals.
