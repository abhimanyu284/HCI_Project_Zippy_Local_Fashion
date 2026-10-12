/* ============ ZIPPY STATE + HELPERS ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const qs = new URLSearchParams(location.search);

const KEY = 'zippy_v1';
const DEFAULTS = () => ({
  follows: ['s1', 's3', 's5'], favP: [], cart: [], recent: [], orders: [], promo: null, slot: 'quick',
  addresses: [
    { id: 'a1', label: 'Home', line: '221B, Rosewood Apartments', area: 'Indiranagar, Bangalore', pin: '560038' },
    { id: 'a2', label: 'College', line: 'Hostel Block C, Campus Road', area: 'Koramangala, Bangalore', pin: '560034' }
  ],
  addr: 'a1', user: { name: 'Guest Shopper', phone: '9876543210' },
  settings: { notify: true, alwaysOpen: true }, helpful: {}, userReviews: {},
  /* added in v2 */
  users: [], session: null, theme: 'light', textSize: 'm', contrast: false,
  compare: [], viewed: [], stockAlerts: [], toured: false, pay: { method: 'cod' }, sus: [], shortcuts: true, reduceMotion: false, sessionTemp: false
});

const Store = {
  s: null,
  load() {
    try { this.s = { ...DEFAULTS(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch (e) { this.s = DEFAULTS(); }
    return this.s;
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { /* storage blocked: stay in memory */ } },
  update(fn) { fn(this.s); this.save(); window.dispatchEvent(new Event('zippy:change')); },
  /* reset keeps accounts, the signed-in session and display preferences */
  reset() {
    const keep = ['users', 'session', 'theme', 'textSize', 'contrast', 'toured', 'sus', 'shortcuts', 'reduceMotion'], old = this.s;
    this.s = DEFAULTS(); keep.forEach(k => { this.s[k] = old[k]; });
    if (this.s.session) { const u = currentUser(); if (u) this.s.user = { name: u.name, phone: u.phone }; }
    this.save(); window.dispatchEvent(new Event('zippy:change'));
  }
};
Store.load();
/* "don't keep me signed in": the session ends when the browser tab/window is closed */
try { if (Store.s.sessionTemp && !sessionStorage.getItem('zippy_alive')) { Store.s.session = null; Store.s.sessionTemp = false; Store.save(); } } catch (e) { /* storage blocked */ }

/* ---------- lookups ---------- */
const shopById = id => SHOPS.find(s => s.id === id);
const prodById = id => PRODUCTS.find(p => p.id === id);
const catLabel = id => (CATEGORIES.find(c => c.id === id) || {}).label || id;
const currentUser = () => (Store.s.session ? Store.s.users.find(u => u.id === Store.s.session) || null : null);
const isSignedIn = () => !!currentUser();
const activeAddress = () => Store.s.addresses.find(a => a.id === Store.s.addr) || Store.s.addresses[0];

/* ---------- shops ---------- */
function isOpen(s) {
  if (Store.s.settings.alwaysOpen) return true;
  const h = new Date().getHours();
  return h >= s.from && h < s.to;
}
const hour12 = h => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
const openText = s => isOpen(s) ? `Open until ${hour12(s.to)}` : `Closed · opens ${hour12(s.from)}`;

/* ---------- stock ---------- */
function productStatus(p) {
  const q = Object.values(p.sizes);
  if (q.some(n => n > 2)) return 'in';
  if (q.some(n => n > 0)) return 'low';
  return 'out';
}
const sizeState = q => (q <= 0 ? 'out' : q <= 2 ? 'low' : 'in');

/* ---------- cart ---------- */
function cartLines() {
  return Store.s.cart.map(c => ({ ...c, p: prodById(c.pid) })).filter(l => l.p);
}
const cartCount = () => Store.s.cart.reduce((a, c) => a + c.qty, 0);

function totals() {
  const lines = cartLines();
  const sub = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const shop = lines[0] ? shopById(lines[0].p.shop) : null;
  let slot = Store.s.slot;
  if (shop && shop.km > 3 && slot === 'quick') slot = 'std';
  const baseFee = slot === 'quick' ? 29 : 15;
  const free = sub >= 3000;
  const fee = free || !lines.length ? 0 : baseFee;
  const code = Store.s.promo;
  let disc = 0;
  if (code && PROMOS[code] && sub >= PROMOS[code].min && sub > 0) disc = PROMOS[code].calc(sub);
  return { lines, sub, shop, slot, baseFee, free, fee, code, disc, total: Math.max(0, sub + fee - disc) };
}

/* ---------- orders (demo timeline: 1 simulated min = ~2.5s) ---------- */
const STEP_MS = [0, 8000, 16000, 32000];
const STEP_NAMES = ['Order confirmed', 'Packed', 'Out for delivery', 'Delivered'];
function orderState(o) {
  if (o.cancelled) return { idx: -1, elapsed: 0, done: false, cancelled: true };
  const elapsed = Date.now() - o.createdAt;
  let idx = 0;
  STEP_MS.forEach((t, i) => { if (elapsed >= t) idx = i; });
  return { idx, elapsed, done: idx === 3, cancelled: false };
}
const orderTotalMin = o => (o.slot === 'quick' ? 12 : 35);
const timeStr = ms => new Date(ms).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
const stepClock = (o, i) => o.createdAt + [0, 4, 8, orderTotalMin(o)][i] * 60000;

/* ---------- search ---------- */
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).map(w => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w));
function matchesQuery(p, q) {
  const tokens = norm(q);
  if (!tokens.length) return true;
  const sh = shopById(p.shop);
  const hay = norm(`${p.name} ${catLabel(p.cat)} ${p.cat} ${sh.name} ${sh.type}`).join(' ');
  return tokens.every(t => hay.includes(t));
}
function addRecent(q) {
  q = q.trim(); if (!q) return;
  Store.update(s => { s.recent = [q, ...s.recent.filter(r => r.toLowerCase() !== q.toLowerCase())].slice(0, 5); });
}

/* ---------- reviews ---------- */
function allReviews(p) {
  const mine = (Store.s.userReviews[p.id] || []).map((r, i) => ({ ...r, id: `${p.id}-u${i}`, name: 'You', days: 0 }));
  return [...mine, ...reviewsFor(p)];
}