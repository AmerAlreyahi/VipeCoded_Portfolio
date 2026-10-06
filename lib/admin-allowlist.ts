export function isAdminEmail(email?: string | null) {
  if (!email) return false
  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  return allowedEmails.includes(email.trim().toLowerCase())
}
