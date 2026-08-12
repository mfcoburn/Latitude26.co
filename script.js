document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('notify-form');
const message = document.getElementById('form-message');
const emailInput = document.getElementById('email');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValid) {
    message.textContent = 'Please enter a valid email address.';
    message.classList.add('error');
    return;
  }

  message.classList.remove('error');
  message.textContent = "You're on the waitlist — we'll be in touch when we open.";
  form.classList.add('is-success');
});
