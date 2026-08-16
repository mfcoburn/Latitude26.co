const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server is not configured to send email.' });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Latitude26 Waitlist <waitlist@latitude26.co>',
        to: process.env.RESEND_TO || 'hello@latitude26.co',
        reply_to: email,
        subject: 'Waiting list sign up',
        text: `New waitlist sign-up: ${email}`,
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, detail);
      return res.status(502).json({ error: 'Could not send notification email.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Failed to reach Resend API:', err);
    return res.status(502).json({ error: 'Could not send notification email.' });
  }
};
