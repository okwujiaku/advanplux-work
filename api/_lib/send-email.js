/**
 * Send email via Resend (https://resend.com). Set RESEND_API_KEY in Vercel env.
 * Optional: RESEND_FROM e.g. "Advanplux <noreply@yourdomain.com>" or use onboarding@resend.dev for testing.
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'Email not configured (RESEND_API_KEY).' }

  let from = process.env.RESEND_FROM || 'Advanplux <onboarding@resend.dev>'
  if (from.includes('_<')) from = from.replace('_<', ' <')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, error: data?.message || 'Failed to send email.' }
  return { ok: true }
}
