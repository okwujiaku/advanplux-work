# Supabase Phase 1 Setup

Run SQL from `supabase/phase1_users_schema.sql` in Supabase SQL editor.

Set these environment variables in Vercel:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_JWT_SECRET`

Optional frontend key for later client-side reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

API endpoints added:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/admin/users`

