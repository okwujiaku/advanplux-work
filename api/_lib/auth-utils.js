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

const VIEW_AS_HEADER = 'x-view-as-user'

/**
 * Get effective user id: when admin sends X-Admin-Key and X-View-As-User, return that user id.
 * Otherwise return the JWT user id (getCurrentUserIdFromRequest).
 */
export function getEffectiveUserIdFromRequest(req) {
  if (isAdminRequest(req)) {
    const viewAs = req?.headers?.[VIEW_AS_HEADER] || req?.headers?.['X-View-As-User']
    const id = typeof viewAs === 'string' ? viewAs.trim() : null
    if (id) return id
  }
  return getCurrentUserIdFromRequest(req)
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

const ADMIN_HEADER = 'x-admin-key'

/**
 * Check admin API key (for admin-only routes). Returns true if valid.
 */
export function isAdminRequest(req) {
  const key = req?.headers?.[ADMIN_HEADER] || req?.headers?.['X-Admin-Key']
  const secret = process.env.ADMIN_SECRET
  return !!secret && typeof key === 'string' && key.trim() === secret.trim()
}

