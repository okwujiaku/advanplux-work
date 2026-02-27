import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, json, normalizeEmail } from '../_lib/auth-utils.js'
import { sendEmail } from '../_lib/send-email.js'

const TOKEN_BYTES = 32
const TOKEN_EXPIRY_HOURS = 1

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Service unavailable. Try again later.' })
  }

  const { email } = req.body || {}
  const normalizedEmailStr = normalizeEmail(email)
  if (!normalizedEmailStr) {
    return json(res, 400, { ok: false, error: 'Email is required.' })
  }

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', normalizedEmailStr)
    .maybeSingle()

  if (fetchError) {
    return json(res, 500, { ok: false, error: 'Something went wrong. Try again later.' })
  }

  // Always return the same message so we don't reveal whether the email exists
  const successMessage = 'If an account exists with this email, we’ve sent you a link to reset your password. Check your inbox and spam folder.'

  if (!user) {
    return json(res, 200, { ok: true, message: successMessage })
  }

  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex')
  const tokenHash = await bcrypt.hash(rawToken, 12)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()

  await supabase.from('password_reset_tokens').delete().eq('user_id', user.id)
  const { error: insertError } = await supabase.from('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  if (insertError) {
    return json(res, 500, { ok: false, error: 'Could not create reset link. Try again later.' })
  }

  const baseUrl = process.env.RESET_PASSWORD_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.advanplux.com')
  const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`

  const emailResult = await sendEmail({
    to: user.email,
    subject: 'Reset your Advanplux password',
    html: `
      <p>You asked to reset your Advanplux password.</p>
      <p><a href="${resetLink}">Click here to set a new password</a></p>
      <p>This link expires in ${TOKEN_EXPIRY_HOURS} hour(s). If you didn’t request this, ignore this email.</p>
      <p>— Advanplux</p>
    `,
  })

  if (!emailResult.ok) {
    return json(res, 500, {
      ok: false,
      error: 'We couldn’t send the email. Contact support or try again later.',
    })
  }

  return json(res, 200, { ok: true, message: successMessage })
}
