import { Resend } from 'resend'
import { NextResponse } from 'next/server'

interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
  website: string
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

function getEmailHtml({ name, email, subject, message }: ContactMessage) {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject || 'New portfolio message')
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>')

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f5fb;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#182033;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e9f2;">
      <tr>
        <td style="padding:30px 36px;background:#17152d;background-image:linear-gradient(120deg,#17152d,#17283c);">
          <p style="margin:0 0 8px;color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Portfolio contact</p>
          <h1 style="margin:0;color:#ffffff;font-size:25px;line-height:1.3;">${safeSubject}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 36px;">
          <p style="margin:0 0 22px;color:#46516a;font-size:15px;line-height:1.7;">You received a new message from your portfolio contact form.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:10px 0;color:#7b8498;font-size:13px;width:100px;border-bottom:1px solid #edf0f5;">Name</td><td style="padding:10px 0;color:#182033;font-size:14px;border-bottom:1px solid #edf0f5;">${safeName}</td></tr>
            <tr><td style="padding:10px 0;color:#7b8498;font-size:13px;width:100px;border-bottom:1px solid #edf0f5;">Email</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid #edf0f5;"><a href="mailto:${safeEmail}" style="color:#6255d9;text-decoration:none;">${safeEmail}</a></td></tr>
          </table>
          <div style="padding:20px 22px;border-radius:14px;background:#f7f8fc;color:#303a50;font-size:15px;line-height:1.8;overflow-wrap:anywhere;">${safeMessage}</div>
          <p style="margin:24px 0 0;color:#7b8498;font-size:12px;line-height:1.6;">Reply directly to this email to respond to ${safeName}.</p>
        </td>
      </tr>
      <tr><td style="padding:18px 36px;background:#fafbfe;color:#9299aa;font-size:11px;">Sent securely from your portfolio contact form.</td></tr>
    </table>
  </body>
</html>`
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Request origin is not allowed.' }, { status: 403 })
  }

  let payload: Partial<ContactMessage>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = typeof payload.name === 'string' ? payload.name.trim().replace(/[\r\n\t]+/g, ' ') : ''
  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const subject = typeof payload.subject === 'string' ? payload.subject.trim().replace(/[\r\n\t]+/g, ' ') : ''
  const message = typeof payload.message === 'string' ? payload.message.trim() : ''
  const website = typeof payload.website === 'string' ? payload.website.trim() : ''

  if (website) return NextResponse.json({ ok: true })

  if (
    !name ||
    name.length > 100 ||
    !isEmail(email) ||
    subject.length > 150 ||
    !message ||
    message.length > 5000
  ) {
    return NextResponse.json({ error: 'Please check the message fields and try again.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const recipient = process.env.CONTACT_EMAIL
  const sender = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !recipient || !sender || !isEmail(recipient)) {
    console.error('Contact email is unavailable: configure RESEND_API_KEY, CONTACT_EMAIL, and RESEND_FROM_EMAIL.')
    return NextResponse.json({ error: 'The contact form is not configured yet.' }, { status: 503 })
  }

  const contactMessage = { name, email, subject, message, website }
  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: sender,
      to: recipient,
      replyTo: email,
      subject: `[Portfolio] ${subject || 'New message from ' + name}`,
      html: getEmailHtml(contactMessage),
      text: `New portfolio message\n\nFrom: ${name} <${email}>\nSubject: ${subject || 'No subject'}\n\n${message}`,
    })

    if (error) {
      console.error('Resend rejected the portfolio contact email:', error)
      return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to send portfolio contact email through Resend:', error)
    return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 502 })
  }
}
