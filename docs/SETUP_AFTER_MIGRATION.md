# Step-by-step setup after running admin_data_tables.sql

You’ve already run the SQL migration. Follow these steps in order.

---

## Step 1: Set ADMIN_SECRET in Vercel

1. Open [Vercel Dashboard](https://vercel.com) → your **advanplux** project.
2. Go to **Settings** → **Environment Variables**.
3. Add a variable:
   - **Name:** `ADMIN_SECRET`
   - **Value:** a long random string (e.g. 32+ characters). Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - **Environment:** Production (and Preview if you use it).
4. Save.

You’ll use this same value when creating the first admin and in the frontend (Step 3).

---

## Step 2: Deploy the app

From your project folder:

```bash
cd "c:\Users\HP\Documents\advanplux work"
npm run build
npx vercel --prod
```

This makes sure the new APIs and env vars are live.

---

## Step 3: Set VITE_ADMIN_SECRET in Vercel (same value as ADMIN_SECRET)

So the admin panel can call admin APIs (gift codes, announcements, bank accounts, etc.):

1. In Vercel → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `VITE_ADMIN_SECRET`
   - **Value:** the **exact same** value you used for `ADMIN_SECRET`.
   - **Environment:** Production (and Preview if needed).
3. Save.
4. Redeploy so the new variable is picked up:

```bash
npm run build
npx vercel --prod
```

---

## Step 4: Create the first admin user

Use the admin API with the secret you set.

**Option A – PowerShell (Windows):**

```powershell
$secret = "YOUR_ADMIN_SECRET_HERE"
$body = '{"email":"your-admin@example.com","password":"YourSecurePassword"}'
Invoke-RestMethod -Uri "https://www.advanplux.com/api/admin/admin-users" -Method POST -Headers @{"Content-Type"="application/json"; "X-Admin-Key"=$secret} -Body $body
```

Replace:

- `YOUR_ADMIN_SECRET_HERE` with your real `ADMIN_SECRET`.
- `your-admin@example.com` with the admin email you want.
- `YourSecurePassword` with the password (min 6 characters).

**Option B – SQL in Supabase (if you prefer DB):**

1. Generate a bcrypt hash for your password (e.g. [bcrypt-generator](https://bcrypt-generator.com/), rounds 10).
2. In Supabase SQL Editor run (replace email and hash):

```sql
INSERT INTO public.admin_users (email, password_hash)
VALUES ('your-admin@example.com', '$2a$10$YourGeneratedHashHere');
```

Use the **full** hash string from the generator (starts with `$2a$10$` or `$2b$10$`).

---

## Step 5: Log in to the admin panel

1. Open **https://www.advanplux.com/admin** (or your production URL).
2. Enter the **email** and **password** you used when creating the admin (Step 4).
3. Click **Enter**.

You should be logged in and see gift codes, announcements, bank accounts, etc. loaded from the database.

---

## Step 6: Optional – Store admin key in the browser (for API calls)

If some admin actions still fail with “Unauthorized”, the panel may need to send the admin key:

1. In the admin UI, if there is an **“Admin API key”** or **“Secret”** field, enter the same value as `ADMIN_SECRET` and save (it’s usually stored in sessionStorage for the session).
2. If there is no such field, confirm that `VITE_ADMIN_SECRET` is set in Vercel and that you redeployed after adding it (Step 3). The code uses that env value when calling admin APIs.

---

## Checklist

- [ ] Step 1: `ADMIN_SECRET` set in Vercel  
- [ ] Step 2: App deployed  
- [ ] Step 3: `VITE_ADMIN_SECRET` set (same as `ADMIN_SECRET`) and redeployed  
- [ ] Step 4: First admin created (API or SQL)  
- [ ] Step 5: Logged in at `/admin`  
- [ ] Step 6: Admin key in browser or env confirmed if needed  

After this, all admin data (gift codes, announcements, bank accounts, bonus withdrawals, etc.) is in Supabase and no longer depends on localStorage.
