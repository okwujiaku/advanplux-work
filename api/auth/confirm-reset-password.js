import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Service unavailable. Try again later.' })
  }

  const { token, newPassword, confirmPassword } = req.body || {}
  const rawToken = String(token ?? '').trim()
  const nextPassword = String(newPassword || '')
  const confirmNext = String(confirmPassword || '')

  if (!rawToken || !nextPassword || !confirmNext) {
    return json(res, 400, { ok: false, error: 'Reset link and both password fields are required.' })
  }
  if (nextPassword !== confirmNext) {
    return json(res, 400, { ok: false, error: 'New password and confirm password must match.' })
  }

  const { data: rows, error: fetchError } = await supabase
    .from('password_reset_tokens')
    .select('id, user_id, token_hash, expires_at')
    .gte('expires_at', new Date().toISOString())

  if (fetchError || !rows?.length) {
    return json(res, 400, { ok: false, error: 'Invalid or expired reset link. Request a new one from the forgot password page.' })
  }

  let matchedRow = null
  for (const row of rows) {
    const valid = await bcrypt.compare(rawToken, row.token_hash)
    if (valid) {
      matchedRow = row
      break
    }
  }

  if (!matchedRow) {
    return json(res, 400, { ok: false, error: 'Invalid or expired reset link. Request a new one from the forgot password page.' })
  }

  const passwordHash = await bcrypt.hash(nextPassword, 12)
  const { error: updateError } = await supabase.from('users').update({ password_hash: passwordHash }).eq('id', matchedRow.user_id)
  if (updateError) {
    return json(res, 500, { ok: false, error: 'Could not update password. Try again.' })
  }

  await supabase.from('password_reset_tokens').delete().eq('id', matchedRow.id)

  return json(res, 200, { ok: true, message: 'Password updated. You can sign in now.' })
}
