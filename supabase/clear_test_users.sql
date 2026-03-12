-- =============================================================================
-- CLEAR TEST USERS (production launch)
-- Run in Supabase SQL Editor. Does NOT touch admin_users (admin panel login).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: DRY RUN – run this first and review counts (no data is deleted)
-- -----------------------------------------------------------------------------

-- How many users will be removed (all registered members; admin is in admin_users)
SELECT COUNT(*) AS users_to_delete FROM public.users;

-- Optional: list them (emails and ids)
SELECT id, email, phone, invitation_code, created_at
FROM public.users
ORDER BY created_at;

-- Counts of related rows that will be removed (CASCADE when users are deleted)
SELECT 'user_wallet' AS table_name, COUNT(*) AS rows_affected FROM public.user_wallet
UNION ALL
SELECT 'deposits', COUNT(*) FROM public.deposits
UNION ALL
SELECT 'withdrawals', COUNT(*) FROM public.withdrawals
UNION ALL
SELECT 'earnings_history', COUNT(*) FROM public.earnings_history
UNION ALL
SELECT 'user_withdrawal_details', COUNT(*) FROM public.user_withdrawal_details
UNION ALL
SELECT 'bonus_withdrawals', COUNT(*) FROM public.bonus_withdrawals
UNION ALL
SELECT 'admin_investment_history', COUNT(*) FROM public.admin_investment_history
UNION ALL
SELECT 'user_active_packs', COUNT(*) FROM public.user_active_packs
UNION ALL
SELECT 'password_reset_tokens', COUNT(*) FROM public.password_reset_tokens;

-- Confirm admin_users is untouched (should show your admin count)
SELECT COUNT(*) AS admin_users_unchanged FROM public.admin_users;

-- STOP HERE. If the numbers look correct, proceed to STEP 2 in a separate run.

-- -----------------------------------------------------------------------------
-- STEP 2: DELETE ALL TEST USERS (run only after reviewing Step 1)
-- -----------------------------------------------------------------------------
-- Deleting from public.users will CASCADE and remove all related rows in:
-- user_wallet, deposits, withdrawals, earnings_history, user_withdrawal_details,
-- bonus_withdrawals, admin_investment_history, user_active_packs, password_reset_tokens.

-- BEGIN;
-- DELETE FROM public.users;
-- COMMIT;

-- Optional: if you need to KEEP one specific user (e.g. your own member account),
-- delete everyone except that user (uncomment and set the condition):
-- BEGIN;
-- DELETE FROM public.users
-- WHERE id NOT IN (
--   SELECT id FROM public.users WHERE email = 'your-account@example.com' LIMIT 1
-- );
-- COMMIT;
