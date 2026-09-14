// Inquiry endpoint for the "Request an Invitation" form.
// Mirrors api/subscribe.js (coming-soon waitlist) but runs as a Next.js route
// handler on the main-site project. Sends a notification to the practice and an
// acknowledgment to the person who submitted.
//
// Requires RESEND_API_KEY on the latitude26-main-site Vercel project. Optional:
// RESEND_FROM (verified sender), RESEND_INQUIRY_TO / RESEND_TO (recipient).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatEasternTimestamp(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const hour = parts.hour === '24' ? '00' : parts.hour;
  return `${parts.month}/${parts.day}/${parts.year} ${hour}:${parts.minute} ET`;
}

async function sendEmail(apiKey, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }

  return response;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!name) {
    return Response.json({ error: 'Please enter your name.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return Response.json(
      { error: 'Server is not configured to send email.' },
      { status: 500 },
    );
  }

  const from = process.env.RESEND_FROM || 'Latitude 26 <inquiries@latitude26.co>';
  const to = process.env.RESEND_INQUIRY_TO || process.env.RESEND_TO || 'info@latitude26.co';
  const submittedAt = formatEasternTimestamp(new Date());

  // 1) Notify the practice. This is the critical send.
  try {
    await sendEmail(apiKey, {
      from,
      to,
      reply_to: email,
      subject: `New inquiry — ${name}`,
      text: [
        'New inquiry from the website:',
        '',
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Phone:   ${phone || '—'}`,
        '',
        'Message:',
        message || '—',
        '',
        `Submitted: ${submittedAt}`,
      ].join('\n'),
    });
  } catch (err) {
    console.error('Failed to send inquiry notification:', err);
    return Response.json(
      { error: 'Could not send your inquiry. Please try again or email info@latitude26.co.' },
      { status: 502 },
    );
  }

  // 2) Acknowledge the sender. Best-effort — do not fail the request if only
  //    this send errors, since the practice has already been notified.
  try {
    await sendEmail(apiKey, {
      from,
      to: email,
      reply_to: to,
      subject: 'We received your inquiry — Latitude 26',
      text: [
        `Dear ${name},`,
        '',
        'Thank you for reaching out to Latitude 26 Concierge Medical. We have',
        'received your inquiry and someone from the practice will be in touch',
        'personally.',
        '',
        'If your matter is time-sensitive, you can reach us directly at',
        `${to}.`,
        '',
        'Warm regards,',
        'Latitude 26 Concierge Medical',
      ].join('\n'),
    });
  } catch (err) {
    console.error('Failed to send inquiry acknowledgment:', err);
  }

  return Response.json({ ok: true });
}
