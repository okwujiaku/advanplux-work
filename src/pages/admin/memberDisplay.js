/**
 * Display label for a member: email, or name from email (part before @), or phone.
 * Never shows the long UUID; only short ids like "current-user" are passed through.
 */
export function getMemberDisplay(member) {
  if (!member) return '–'
  const email = member.email ? String(member.email).trim() : ''
  const nameFromEmail = email ? email.split('@')[0] : ''
  const phone = member.phone ? String(member.phone).trim() : ''
  const id = member.id ? String(member.id) : ''
  const isShortId = id.length > 0 && id.length <= 20 && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  return email || nameFromEmail || phone || (isShortId ? id : '') || '–'
}

/** Same but when you only have userId and a members list (e.g. in history tables). Never shows raw UUID. */
export function getUserDisplay(userId, members) {
  if (!userId) return '-'
  const m = members?.find((member) => member.id === userId)
  const label = getMemberDisplay(m)
  return label !== '-' ? label : '–'
}
