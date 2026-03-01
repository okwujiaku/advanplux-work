# Why approved deposits sometimes don’t show in the user’s balance

## How it’s supposed to work

1. **User creates deposit**  
   `POST /api/user/deposits` (with user JWT).  
   Backend stores the row with `user_id` = JWT user id and `amount_usd` (or `amount` + `currency`).

2. **Admin approves**  
   `PATCH /api/admin/deposits` with `{ id, status: 'approved' }` and header `X-Admin-Key: <ADMIN_SECRET>`.  
   Backend:
   - Credits `user_wallet` for that deposit’s `user_id` (then marks deposit approved).
   - Returns 200 only if the wallet was updated.

3. **User sees balance**  
   Dashboard calls `GET /api/user/wallet` (with user JWT).  
   Backend returns `user_wallet.balance_usd` for the same `user_id`.

So: same `user_id` in deposit, wallet credit, and wallet read. No localStorage for balance; it comes from the API.

---

## Root causes if balance doesn’t update

### 1. Admin approval never hits the backend (most likely)

- **Symptom:** Admin clicks “Confirm”, row may look approved, but user balance stays 0.
- **Cause:**  
  - `X-Admin-Key` is missing or wrong → backend returns **401**.  
  - There used to be a fallback that updated the UI to “approved” even when the API failed, so the UI could show approved while the backend (and wallet) were never updated.
- **Fix:**  
  - In **Vercel**: set env var **`ADMIN_SECRET`** (e.g. a long random string).  
  - In the app: use the same value as **`VITE_ADMIN_SECRET`** (or set it in sessionStorage as `adminApiKey`) so the admin UI sends `X-Admin-Key` on every admin request.  
  - Ensure the admin UI **does not** mark a deposit as approved when the approval request fails (no fallback to local-only “approved”).

### 2. Backend not configured in production

- **Symptom:** Approval fails with 503 or “backend not configured”.
- **Cause:** Supabase env vars missing in Vercel (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- **Fix:** Set those in Vercel and redeploy.

### 3. Old API code in production

- **Symptom:** Admin sees “approved” and no error, but user balance still 0.
- **Cause:** Deployed API is an old version that only updates `deposits.status` and does **not** update `user_wallet` (or does it in a way that can fail without returning an error).
- **Fix:** Redeploy so production runs the current code that credits the wallet **before** marking the deposit approved and returns an error if the wallet update fails.

### 4. Wrong or missing `amount_usd` on the deposit

- **Symptom:** Backend returns 400 “Deposit has no amount in USD” (or similar).
- **Cause:** Deposit row has `amount_usd = 0` and no valid `amount` + `currency` to derive USD (NGN/CFA).
- **Fix:** Ensure the deposit form sends `amountUsd` when creating the deposit, or that the backend can derive it from `amount` + `currency` for older rows.

---

## What was changed in code

- **No “approved” without backend success:**  
  When `PATCH /api/admin/deposits` fails (401, 500, etc.), the admin UI no longer falls back to a local “approved” state. It shows an error and does not mark the deposit approved.
- **Clear errors:**  
  If the admin key is missing or the request fails, the admin sees an alert explaining that the balance was not credited and what to set (e.g. `ADMIN_SECRET`, `VITE_ADMIN_SECRET` / `adminApiKey`).
- **Backend:**  
  Approval credits `user_wallet` first; only then is the deposit marked approved. If the wallet update fails, the API returns 500 and the deposit stays pending.

---

## Checklist if a user still doesn’t see their balance after approval

1. **Vercel env:** `ADMIN_SECRET` and `VITE_ADMIN_SECRET` set (same value); `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set.  
2. **Admin key in browser:** Same value in sessionStorage `adminApiKey` or from `VITE_ADMIN_SECRET`.  
3. **Redeploy:** Production is running the latest API and frontend (no old “approve without credit” or “fallback to local approved”).  
4. **One-off fix for an already-approved deposit:** Use Admin → “Account Top up” for that user and add the deposit amount in USD (e.g. 29000 NGN ≈ 20 USD).
