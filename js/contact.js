// Contact form validation + demo submit
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
const toast = document.getElementById('toast');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name')||'').trim();
  const email = String(data.get('email')||'').trim();
  const phone = String(data.get('phone')||'').trim();
  const topic = String(data.get('topic')||'').trim();
  const message = String(data.get('message')||'').trim();
  const consent = data.get('consent');

  if (name.length < 2) return statusEl.textContent = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return statusEl.textContent = 'Enter a valid email address.';
  if (!topic) return statusEl.textContent = 'Please select a topic.';
  if (message.length < 10) return statusEl.textContent = 'Message should be at least 10 characters.';
  if (!consent) return statusEl.textContent = 'Please agree so we can contact you back.';

  // Demo success — replace with a real POST to Formspree/Netlify/Firebase
  /* Example (Formspree):
  await fetch('https://formspree.io/f/yourid', {
    method:'POST', headers:{'Accept':'application/json'},
    body: JSON.stringify({ name, email, phone, topic, message })
  });
  */

  statusEl.textContent = '';
  form.reset();
  toast?.classList.add('show');
  setTimeout(() => toast?.classList.remove('show'), 2500);
});

