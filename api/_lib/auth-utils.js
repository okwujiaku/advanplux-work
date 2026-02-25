import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export function signSessionToken(user) {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) return null
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      phone: user.phone || null,
    },
    secret,
    { expiresIn: '7d' },
  )
}

export function stripSensitiveUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email || '',
    phone: user.phone || '',
    invitationCode: user.invitation_code || '',
    referredByUserId: user.referred_by_user_id || null,
    createdAt: user.created_at || null,
  }
}

export function generateInvitationCode() {
  return `ADV${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function json(res, status, payload) {
  res.status(status).json(payload)
}

