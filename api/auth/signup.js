import bcrypt from 'bcryptjs'
import {
  generateInvitationCode,
  getSupabaseAdmin,
  json,
  normalizeEmail,
  normalizePhone,
  signSessionToken,
  stripSensitiveUser,
} from '../_lib/auth-utils.js'

async function uniqueInvitationCode(supabase) {
  for (let i = 0; i < 8; i += 1) {
    const code = generateInvitationCode()
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('invitation_code', code)
      .maybeSingle()
    if (!error && !data) return code
  }
  return `ADV${Date.now().toString(36).toUpperCase()}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  const { phone, email, password, confirmPassword, invitationCode } = req.body || {}
  const normalizedPhone = normalizePhone(phone)
  const normalizedEmail = normalizeEmail(email)
  const cleanPassword = String(password || '')
  const cleanConfirmPassword = String(confirmPassword || '')
  const cleanInvitationCode = String(invitationCode || '').trim().toUpperCase()

  if (!normalizedPhone || !normalizedEmail || !cleanPassword || !cleanConfirmPassword) {
    return json(res, 400, { ok: false, error: 'All fields are required.' })
  }
  if (cleanPassword !== cleanConfirmPassword) {
    return json(res, 400, { ok: false, error: 'Password and confirm password must match.' })
  }

  const { data: emailExists } = await supabase.from('users').select('id').eq('email', normalizedEmail).maybeSingle()
  if (emailExists) return json(res, 409, { ok: false, error: 'Email already exists.' })

  const { data: phoneExists } = await supabase.from('users').select('id').eq('phone', normalizedPhone).maybeSingle()
  if (phoneExists) return json(res, 409, { ok: false, error: 'Phone number already exists.' })

  let referredByUserId = null
  if (cleanInvitationCode) {
    const { data: referrer } = await supabase
      .from('users')
      .select('id')
      .eq('invitation_code', cleanInvitationCode)
      .maybeSingle()
    if (!referrer) return json(res, 400, { ok: false, error: 'Invalid invitation code.' })
    referredByUserId = referrer.id
  }

  const passwordHash = await bcrypt.hash(cleanPassword, 12)
  const invitation_code = await uniqueInvitationCode(supabase)

  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert({
      email: normalizedEmail,
      phone: normalizedPhone,
      password_hash: passwordHash,
      invitation_code,
      referred_by_user_id: referredByUserId,
    })
    .select('id,email,phone,invitation_code,referred_by_user_id,created_at')
    .single()

  if (insertError || !inserted) {
    return json(res, 500, { ok: false, error: 'Unable to create account.' })
  }

  const token = signSessionToken(inserted)
  return json(res, 200, {
    ok: true,
    token,
    user: stripSensitiveUser(inserted),
  })
}

