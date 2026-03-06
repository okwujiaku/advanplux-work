-- Run this in Supabase SQL Editor to support the new admin features.

-- 1) Ban/activate users (Edit user info + Ban button)
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;

-- 2) Gift code redemption (redeem adds to balance)
ALTER TABLE gift_codes ADD COLUMN IF NOT EXISTS redeemed_at timestamptz;
ALTER TABLE gift_codes ADD COLUMN IF NOT EXISTS redeemed_by_user_id uuid REFERENCES users(id);

-- 3) Global withdrawal lock (one button for all)
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb
);
INSERT INTO platform_settings (key, value) VALUES ('withdrawal_locked', 'false')
ON CONFLICT (key) DO NOTHING;
