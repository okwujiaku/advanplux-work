# Step-by-step: Clear test users before production launch

Follow these steps in order. Do not skip the dry run (Step 4).

---

## Step 1: Back up your database (or do a quick export if you can’t)

**If you have backups (Pro plan):**

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Open your **production** project (the one used by advanplux.com).
3. In the left sidebar, click **Database** → **Backups**.
4. Create a backup if your plan allows it, and wait until it finishes.

**If you’re on the Free Plan (no project backups):**

You can still run the cleanup safely. The delete only removes test users and their related data; it does **not** change your schema or admin account. To keep a simple safety copy of what you’re about to remove:

1. Open **SQL Editor** and run the **Step 1 (dry run)** from `clear_test_users.sql` (see Step 4 below).
2. In the results, use **Download CSV** (or copy the result tables) for the user list and the counts. Save that file somewhere (e.g. `users_before_cleanup.csv`).
3. Optionally, run:  
   `SELECT * FROM public.users;`  
   then **Download CSV** and save it. That’s your “backup” of the current members.

Then continue from Step 2. Not having a full backup won’t spoil things; you’re only clearing test data you chose to remove.

---

## Step 2: Confirm you are in the right project

1. In the Supabase dashboard, check the **project name** at the top (e.g. “Advanplux production”).
2. Check the **project URL** under **Settings → General** (e.g. `https://xxxxx.supabase.co`).
3. Be sure this is the project that your live site (e.g. www.advanplux.com) uses.  
   If you have a separate staging project, do **not** use that for the real cleanup.

---

## Step 3: Open the SQL Editor and the cleanup script

1. In the left sidebar, click **SQL Editor**.
2. Click **New query** (or the + icon) so you have a blank query tab.
3. On your computer, open the file:  
   `supabase/clear_test_users.sql`  
   (in your “advanplux work” project folder).
4. Copy **only** the Step 1 block into the SQL Editor (see Step 4 for what to copy).

---

## Step 4: Run the dry run (Step 1) – no data is deleted

1. In `clear_test_users.sql`, find the section that starts with:
   - `-- STEP 1: DRY RUN`
2. Copy from the line **`SELECT COUNT(*) AS users_to_delete FROM public.users;`**  
   down to and including:
   - **`SELECT COUNT(*) AS admin_users_unchanged FROM public.admin_users;`**
3. Do **not** copy the Step 2 section (the part with `BEGIN;` and `DELETE`).
4. Paste into the Supabase SQL Editor.
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter).
6. Check the results:
   - **users_to_delete** – number of registered members that will be removed.
   - **Table of users** – list of those users (email, id, etc.).
   - **table_name / rows_affected** – how many rows will be removed from deposits, withdrawals, etc.
   - **admin_users_unchanged** – number of admin logins (should stay as is, e.g. 1).
7. If these numbers look correct and you see only test users in the list, go to Step 5.  
   If something looks wrong, stop and re-check your project and backup before doing any delete.

---

## Step 5: Uncomment the delete (Step 2) in the script

1. Open `supabase/clear_test_users.sql` again on your computer.
2. Find the block that says:
   ```text
   -- BEGIN;
   -- DELETE FROM public.users;
   -- COMMIT;
   ```
3. Remove the two dashes at the start of each of those three lines so it becomes:
   ```text
   BEGIN;
   DELETE FROM public.users;
   COMMIT;
   ```
4. Save the file.  
   (Do **not** uncomment the optional “keep one user” block unless you really want to keep one specific member by email.)

---

## Step 6: Run the delete in Supabase

1. In Supabase **SQL Editor**, open a **new** query tab (or clear the previous one).
2. Copy **only** these three lines into the editor:
   ```sql
   BEGIN;
   DELETE FROM public.users;
   COMMIT;
   ```
3. Click **Run**.
4. Wait for the query to finish. You should see a message like “Success. No rows returned” or similar.
5. The database has now removed all rows from `public.users`. All related data (deposits, withdrawals, wallets, etc.) is removed automatically by CASCADE.

---

## Step 7: Confirm the cleanup

1. In Supabase, go to **Table Editor** (left sidebar).
2. Open the **users** table. It should be **empty** (0 rows).
3. Check **deposits** and **withdrawals** – they should also be empty.
4. In your admin panel (e.g. www.advanplux.com/admin or your admin URL), log in with your admin account.
5. Open **Registered Members**. The list should be empty.
6. Open **Deposits** and **Withdrawals** (or Pending Deposits / Pending Withdrawals). They should be empty.
7. Your admin login should still work; only member data was cleared.

---

## Step 8: Optional – re-comment the delete for safety

1. Open `supabase/clear_test_users.sql` again.
2. Put the two dashes back in front of the three lines:
   ```text
   -- BEGIN;
   -- DELETE FROM public.users;
   -- COMMIT;
   ```
3. Save the file.  
   This avoids accidentally running the delete again later.

---

## Summary checklist

- [ ] Step 1: Backup created or confirmed  
- [ ] Step 2: Confirmed correct (production) project  
- [ ] Step 3: SQL Editor open, script file open  
- [ ] Step 4: Dry run (Step 1) run and results reviewed  
- [ ] Step 5: Delete block (Step 2) uncommented and saved  
- [ ] Step 6: `BEGIN; DELETE FROM public.users; COMMIT;` run in SQL Editor  
- [ ] Step 7: Checked `users`, `deposits`, `withdrawals` and admin panel  
- [ ] Step 8: Delete block commented again in the script  

After this, new signups will be the only members, and deposits/withdrawals will only show new activity.
