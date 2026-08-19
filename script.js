document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('notify-form');
const message = document.getElementById('form-message');
const emailInput = document.getElementById('email');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValid) {
    message.textContent = 'Please enter a valid email address.';
    message.classList.add('error');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  message.classList.remove('error');
  message.textContent = 'Submitting…';

  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    message.textContent = "You're on the waitlist. We'll be in touch when we open.";
    form.classList.add('is-success');
  } catch (err) {
    message.textContent = err.message || 'Something went wrong. Please try again.';
    message.classList.add('error');
    submitButton.disabled = false;
  }
});
