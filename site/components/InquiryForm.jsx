'use client';

import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Enquiry form for "Request an Invitation".
 *
 * TODO(backend): submission is deliberately NOT wired up. Before launch,
 * point this at a serverless function (mirroring api/subscribe.js in the repo
 * root, which sends via Resend) and remove the stub below. Until then the form
 * validates input and reports success without transmitting anything.
 */
export default function InquiryForm({ copy }) {
  const [status, setStatus] = useState({ text: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = (form.get('name') ?? '').toString().trim();
    const email = (form.get('email') ?? '').toString().trim();

    if (!name) {
      setStatus({ text: 'Please enter your name.', error: true });
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setStatus({ text: 'Please enter a valid email address.', error: true });
      return;
    }

    setSubmitting(true);

    // TODO(backend): replace this stub with a POST to the enquiry endpoint.
    // eslint-disable-next-line no-console
    console.warn('Enquiry form is stubbed; nothing was submitted.');

    setStatus({
      text: copy?.success_message ?? 'Thank you. Your enquiry has been received.',
      error: false,
    });
    setSubmitting(false);
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
          {copy?.submit_label ?? 'Submit Enquiry'}
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
