import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const AUTH_HEADER = 'authorization'
const BEARER = 'bearer '

/**
 * Get current user id from request (Bearer JWT). Returns null if missing/invalid.
 */
export function getCurrentUserIdFromRequest(req) {
  const raw = req?.headers?.[AUTH_HEADER] || req?.headers?.['Authorization']
  const token = typeof raw === 'string' && raw.toLowerCase().startsWith(BEARER)
    ? raw.slice(BEARER.length).trim()
    : (raw || '').trim()
  if (!token) return null
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) return null
  try {
    const decoded = jwt.verify(token, secret)
    return decoded?.sub ?? null
  } catch {
    return null
  }
}

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

