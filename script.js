const root = document.documentElement;
const themeBtn = document.getElementById('theme');

// Theme (saved in localStorage, falls back to system preference)
function setTheme(t) {
  root.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeBtn.onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

// Mobile menu
const menu = document.getElementById('menu');
const burger = document.getElementById('burger');
burger.onclick = () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
};
menu.querySelectorAll('a').forEach(a => a.onclick = () => menu.classList.remove('open'));

// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Active nav link on scroll
const links = [...menu.querySelectorAll('a')];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.hash === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section').forEach(s => spy.observe(s));

// Contact form
// Sends straight to your inbox through FormSubmit (free, no key needed).
// First time only: after the first test message, FormSubmit emails you an activation link. Click it once.
const TO_EMAIL = 'naishad352@gmail.com', WA_NUMBER = '919054895553';

document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, s = document.getElementById('status'), btn = f.querySelector('button[type=submit]');
  const name = f.name.value.trim(), email = f.email.value.trim(), msg = f.msg.value.trim();
  if (!name || !f.email.validity.valid || !msg) {
    s.textContent = 'Please fill in your name, a valid email and a message.';
    return;
  }
  const text = `${msg}\n\nFrom: ${name} (${email})`;
  const subject = 'Portfolio message from ' + name;
  btn.disabled = true; s.textContent = 'Sending…';
  try {
    const r = await fetch('https://formsubmit.co/ajax/' + TO_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, message: msg, _subject: subject, _replyto: email, _template: 'table' })
    });
    const d = await r.json();
    if (r.ok && String(d.success) === 'true') {
      f.reset(); s.textContent = 'Thank you! Your message has been sent.'; btn.disabled = false; return;
    }
  } catch (err) {}
  btn.disabled = false;
  // Fallback if direct sending is not available (offline, blocked, or not activated yet)
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const wa = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  s.textContent = 'Could not send directly. Please send it with one of these:';
  const box = document.createElement('div');
  box.className = 'opts';
  [['Open Gmail', gmail], ['WhatsApp', wa]].forEach(([t, u]) => {
    const a = document.createElement('a');
    a.className = 'btn btn-sm'; a.textContent = t; a.href = u; a.target = '_blank'; a.rel = 'noopener';
    box.appendChild(a);
  });
  const c = document.createElement('button');
  c.type = 'button'; c.className = 'btn btn-sm btn-ghost'; c.textContent = 'Copy message';
  c.onclick = async () => {
    try { await navigator.clipboard.writeText(text); c.textContent = 'Copied ✓'; }
    catch (err) { c.textContent = 'Copy failed'; }
  };
  box.appendChild(c);
  s.appendChild(box);
});

document.getElementById('yr').textContent = new Date().getFullYear();