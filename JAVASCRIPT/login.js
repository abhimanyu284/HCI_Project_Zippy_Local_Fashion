/* ============ LOGIN / REGISTER ============ */
Layout('login');

/* Demo accounts live only in this browser (localStorage). Passwords are salted + hashed, never stored as text. */
async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + ':' + pw);
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; for (const b of data) h = ((h << 5) + h + b) | 0;      // fallback if crypto.subtle is unavailable
  return 'x' + (h >>> 0).toString(16);
}
const newSalt = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/* only allow redirecting back to one of our own pages */
function nextUrl() {
  const n = qs.get('next') || '';
  return /^[a-z]+\.html(\?[\w=&%.,\-]*)?$/i.test(n) && !/^(login|register)\.html/.test(n) ? n : 'index.html';
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const mode = window.AUTH_MODE === 'register' ? 'register' : 'login';   // each page sets this: login.html / register.html
let fails = 0, lockUntil = 0;

function strength(pw) {
  let n = 0;
  if (pw.length >= 8) n++; if (pw.length >= 12) n++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) n++;
  if (/\d/.test(pw)) n++; if (/[^A-Za-z0-9]/.test(pw)) n++;
  return Math.min(4, n);
}
const SLABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'], SCOL = ['#d64545', '#d64545', '#F2A100', '#2BB673', '#177A53'];

const field = (id, label, type, extra = '', hint = '') => `<div class="field"><label for="${id}">${label}</label>${type === 'password'
  ? `<div class="pw"><input class="inp" id="${id}" type="password" ${extra}><button type="button" data-eye="${id}" aria-label="Show password" aria-pressed="false">${ic('eye', 18)}</button></div>`
  : `<input class="inp" id="${id}" type="${type}" ${extra}>`}${hint ? `<div class="hint">${hint}</div>` : ''}<div class="errt" id="${id}-e" role="alert"></div></div>`;

const nq = () => (qs.get('next') ? '?next=' + encodeURIComponent(qs.get('next')) : '');

function render() {
  const u = currentUser();
  if (u) {
    $('#main').innerHTML = `<div class="auth"><h1>You’re signed in</h1><p class="muted">Signed in as <b>${esc(u.name)}</b> (${esc(u.email)}).</p>
      <div class="stack" style="margin-top:22px"><a class="btn primary block" href="${nextUrl()}">Continue</a><a class="btn ghost block" href="profile.html">Go to my profile</a><button type="button" class="btn ghost block" id="lo">${ic('logout', 16)} Sign out</button></div></div>`;
    $('#lo').onclick = () => { Store.update(s => { s.session = null; s.sessionTemp = false; s.user = { name: 'Guest Shopper', phone: '9876543210' }; }); toast('Signed out'); render(); };
    return;
  }
  const reg = mode === 'register';
  $('#main').innerHTML = `<div class="auth">
    <h1>${reg ? 'Create your account' : 'Sign in'}</h1><p class="muted">${reg ? 'It’s free and takes under a minute.' : 'Welcome back. Use the email you registered with.'}</p>
    ${reg ? `<form id="f" novalidate>
      ${field('nm', 'Full name', 'text', 'autocomplete="name" autofocus')}
      ${field('em', 'Email', 'email', 'autocomplete="email" inputmode="email"')}
      ${field('ph', 'Mobile number', 'tel', 'autocomplete="tel-national" inputmode="numeric" maxlength="10"', '10 digits, starting with 6, 7, 8 or 9')}
      ${field('pw', 'Password', 'password', 'autocomplete="new-password"', 'At least 8 characters with a letter and a number')}
      <div class="meter" aria-hidden="true"><i id="bar"></i></div><div class="hint" id="sl" aria-live="polite"></div>
      ${field('pw2', 'Confirm password', 'password', 'autocomplete="new-password"')}
      <label class="check"><input type="checkbox" id="tc"><span>I agree to the Terms and Privacy Policy (demo)</span></label><div class="errt" id="tc-e" role="alert"></div>
      <button class="btn primary block" id="go">Create account</button></form>
      <p class="auth-alt">Already have an account? <a class="link" href="login.html${nq()}">Sign in</a></p>`
    : `<form id="f" novalidate>
      ${field('em', 'Email', 'email', 'autocomplete="email" autofocus inputmode="email"')}
      ${field('pw', 'Password', 'password', 'autocomplete="current-password"')}
      <div class="row between auth-row"><label class="check"><input type="checkbox" id="keep" checked><span>Keep me signed in</span></label><button type="button" class="link" id="forgot">Forgot password?</button></div>
      <div class="errt" id="form-e" role="alert"></div>
      <button class="btn primary block" id="go">Sign in</button></form>
      <p class="auth-alt">New to Zippy? <a class="link" href="register.html${nq()}">Create an account</a></p>`}
    <div class="divider">or</div>
    <a class="btn ghost block" href="${nextUrl()}">Continue as guest</a>
    <p class="demo-note">${ic('info', 14)} Demo site: accounts are stored only in this browser. Don’t use a real password.</p></div>`;
  bind();
}

function setErr(id, msg) {
  const f = $('#' + id), e = $('#' + id + '-e');
  if (f) { f.classList.toggle('err', !!msg); f.setAttribute('aria-invalid', !!msg); }
  if (e) e.textContent = msg || '';
  return !msg;
}
const RULES = {
  nm: v => (v.trim().length >= 2 && /^[A-Za-z][A-Za-z .'-]*$/.test(v.trim()) ? '' : 'Enter your name (letters only).'),
  em: v => (EMAIL.test(v.trim()) ? '' : 'Enter a valid email, like name@example.com.'),
  ph: v => (/^[6-9]\d{9}$/.test(v) ? '' : 'Enter a 10-digit mobile number.'),
  pw: v => (mode === 'login' ? (v ? '' : 'Enter your password.') : v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v) ? '' : 'Use 8+ characters with at least one letter and one number.'),
  pw2: v => (v && v === $('#pw').value ? '' : 'Passwords don’t match.')
};

function bind() {
  $$('[data-eye]').forEach(b => b.onclick = () => {
    const i = $('#' + b.dataset.eye), show = i.type === 'password';
    i.type = show ? 'text' : 'password'; b.innerHTML = ic(show ? 'eyeoff' : 'eye', 18); b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
  /* validate a field when the user leaves it, and clear its error as soon as they fix it */
  Object.keys(RULES).forEach(id => { const f = $('#' + id); if (!f) return; f.addEventListener('blur', () => { if (f.value || f.dataset.touched) setErr(id, RULES[id](f.value)); f.dataset.touched = 1; }); f.addEventListener('input', () => { if (f.dataset.touched || f.classList.contains('err')) setErr(id, RULES[id](f.value)); }); });
  const ph = $('#ph'); if (ph) ph.addEventListener('input', () => { ph.value = ph.value.replace(/\D/g, '').slice(0, 10); });
  const pw = $('#pw');
  if (pw && mode === 'register') pw.addEventListener('input', () => {
    const n = pw.value ? strength(pw.value) : 0;
    $('#bar').style.width = pw.value ? (n + 1) * 20 + '%' : '0'; $('#bar').style.background = SCOL[n];
    $('#sl').textContent = pw.value ? 'Strength: ' + SLABEL[n] : '';
  });
  const f = $('#f'); if (f) f.onsubmit = submit;
  const fg = $('#forgot'); if (fg) fg.onclick = forgot;
}

async function submit(e) {
  e.preventDefault();
  const ids = mode === 'login' ? ['em', 'pw'] : ['nm', 'em', 'ph', 'pw', 'pw2'];
  let bad = null;
  ids.forEach(id => { const ok = setErr(id, RULES[id]($('#' + id).value)); if (!ok && !bad) bad = id; });
  if (mode === 'register') { const ok = $('#tc').checked; $('#tc-e').textContent = ok ? '' : 'Please accept the terms to continue.'; if (!ok && !bad) bad = 'tc'; }
  if (bad) { $('#' + bad).focus(); return; }
  const btn = $('#go'), label = btn.textContent;
  if (Date.now() < lockUntil) { $('#form-e').textContent = `Too many attempts. Try again in ${Math.ceil((lockUntil - Date.now()) / 1000)}s.`; return; }
  btn.disabled = true; btn.textContent = mode === 'login' ? 'Signing in…' : 'Creating account…';
  const email = $('#em').value.trim().toLowerCase();
  if (mode === 'register') {
    if (Store.s.users.some(u => u.email === email)) { btn.disabled = false; btn.textContent = label; setErr('em', 'An account with this email already exists. Try signing in.'); $('#em').focus(); return; }
    const salt = newSalt(), user = { id: 'u' + Date.now(), name: $('#nm').value.trim().replace(/\s+/g, ' '), email, phone: $('#ph').value, salt, hash: await hashPw($('#pw').value, salt), created: Date.now() };
    Store.update(s => { s.users.push(user); });
    signIn(user, true, 'Account created. Welcome to Zippy!');
  } else {
    const u = Store.s.users.find(x => x.email === email);
    const ok = u && (await hashPw($('#pw').value, u.salt)) === u.hash;
    if (!ok) {
      fails++; btn.disabled = false; btn.textContent = label;
      if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; $('#form-e').textContent = 'Too many attempts. Please wait 30 seconds, or reset your password.'; }
      else $('#form-e').textContent = 'That email and password don’t match. Check them and try again.';
      $('#pw').value = ''; $('#pw').focus(); return;
    }
    signIn(u, $('#keep').checked, `Welcome back, ${u.name.split(' ')[0]}!`);
  }
}
function signIn(u, keep, msg) {
  try { sessionStorage.setItem('zippy_alive', '1'); } catch (e) { /* blocked */ }
  Store.update(s => { s.session = u.id; s.sessionTemp = !keep; s.user = { name: u.name, phone: u.phone }; });
  toast(msg);
  setTimeout(() => { location.href = nextUrl(); }, 700);
}

/* forgot password: in a real app we'd email a link; here you can set a new one directly (demo) */
function forgot() {
  const m = openModal(`<h2>Reset your password</h2><p class="muted small" style="margin-bottom:16px">Demo: normally we’d email you a link. Here you can choose a new password straight away.</p>
    <form novalidate><div class="field"><label for="fe">Account email</label><input class="inp" id="fe" type="email" autofocus value="${esc(($('#em') || {}).value || '')}"><div class="errt"></div></div>
    <div class="field"><label for="fp">New password</label><input class="inp" id="fp" type="password" autocomplete="new-password"><div class="hint">At least 8 characters with a letter and a number</div><div class="errt"></div></div>
    <div class="mact"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary">Reset password</button></div></form>`);
  m.querySelector('form').onsubmit = async ev => {
    ev.preventDefault();
    const fe = m.querySelector('#fe'), fp = m.querySelector('#fp'), u = Store.s.users.find(x => x.email === fe.value.trim().toLowerCase());
    const e1 = EMAIL.test(fe.value.trim()) ? (u ? '' : 'We couldn’t find an account with that email.') : 'Enter a valid email.';
    const e2 = fp.value.length >= 8 && /[A-Za-z]/.test(fp.value) && /\d/.test(fp.value) ? '' : 'Use 8+ characters with a letter and a number.';
    fe.classList.toggle('err', !!e1); fe.parentElement.querySelector('.errt').textContent = e1; fp.classList.toggle('err', !!e2); fp.parentElement.querySelector('.errt').textContent = e2;
    if (e1 || e2) return;
    const salt = newSalt(), h = await hashPw(fp.value, salt);
    Store.update(s => { const x = s.users.find(y => y.id === u.id); x.salt = salt; x.hash = h; });
    closeModal(); toast('Password updated. You can sign in now.');
  };
}

render();