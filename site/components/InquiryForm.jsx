'use client';

import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Inquiry form for "Request an Invitation".
 *
 * Submits to /api/inquiry, which sends a notification to the practice and an
 * acknowledgment to the sender via Resend. Requires RESEND_API_KEY on the
 * latitude26-main-site Vercel project.
 */
export default function InquiryForm({ copy }) {
  const [status, setStatus] = useState({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const name = (form.get('name') ?? '').toString().trim();
    const email = (form.get('email') ?? '').toString().trim();
    const phone = (form.get('phone') ?? '').toString().trim();
    const message = (form.get('message') ?? '').toString().trim();

    if (!name) {
      setStatus({ text: 'Please enter your name.', error: true });
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setStatus({ text: 'Please enter a valid email address.', error: true });
      return;
    }

    setSubmitting(true);
    setStatus({ text: '', error: false });

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus({
          text:
            data.error ??
            'Something went wrong sending your inquiry. Please try again.',
          error: true,
        });
        setSubmitting(false);
        return;
      }

      formEl.reset();
      setStatus({
        text:
          copy?.success_message ?? 'Thank you. Your inquiry has been received.',
        error: false,
      });
    } catch {
      setStatus({
        text: 'Could not reach the server. Please try again in a moment.',
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">{copy?.name_label ?? 'Name'}</label>
        <input id="name" name="name" type="text" autoComplete="name" required />
      </div>

      <div className="field">
        <label htmlFor="email">{copy?.email_label ?? 'Email'}</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="phone">{copy?.phone_label ?? 'Phone'}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>

      <div className="field">
        <label htmlFor="message">{copy?.message_label ?? 'How can we help?'}</label>
        <textarea id="message" name="message" />
      </div>

      <div>
        <button className="btn" type="submit" disabled={submitting}>
          {copy?.submit_label ?? 'Submit Inquiry'}
        </button>
      </div>

      <p
        className={status.error ? 'form-message error' : 'form-message'}
        role="status"
        aria-live="polite"
      >
        {status.text}
      </p>
    </form>
  );
}
