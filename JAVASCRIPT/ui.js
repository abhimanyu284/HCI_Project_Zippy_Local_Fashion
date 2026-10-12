/* ============ ZIPPY SHARED UI ============ */
document.write('<link rel="stylesheet" href="../css/extra.css?v=4"><link rel="stylesheet" href="../css/sidebar.css?v=1"><script src="../js/audience.js"><\/script>');   // dark mode + new components (extra.css), side menu (sidebar.css), Men / Women / Kids data (audience.js)

/* older saved data / an older store.js: make sure every new setting has a value */
(function () {
  const D = { users: [], session: null, theme: 'light', textSize: 'm', contrast: false, compare: [], viewed: [], stockAlerts: [], toured: false, pay: { method: 'cod' }, sus: [], shortcuts: true, reduceMotion: false, sessionTemp: false };
  Object.keys(D).forEach(k => { if (Store.s[k] === undefined || Store.s[k] === null && k !== 'session') Store.s[k] = D[k]; });
})();

/* if extra.css is missing or cut off, say so instead of showing a broken page */
window.addEventListener('DOMContentLoaded', () => {
  const v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  if (v('--zx-start') === '1' && v('--zx-end') === '1') return;
  const b = document.createElement('div'); b.setAttribute('role', 'alert');
  b.style.cssText = 'position:sticky;top:0;z-index:9999;background:#FFF3CD;color:#5c4400;padding:12px 18px;font:600 14px/1.4 system-ui,sans-serif;border-bottom:2px solid #F2A100;text-align:center';
  b.textContent = v('--zx-start') === '1' ? 'extra.css looks cut off. Copy the whole file again (it must end with the line “:root{--zx-end:1}”), then press Ctrl+Shift+R.' : 'extra.css was not found. Save it as extra.css in the css folder, then press Ctrl+Shift+R.';
  document.body.prepend(b);
});

/* ---------- display preferences (theme, text size, contrast, motion) ---------- */
function applyDisplay() {
  const s = Store.s, de = document.documentElement;
  const dark = s.theme === 'dark' || (s.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  de.dataset.theme = dark ? 'dark' : 'light';
  de.dataset.text = s.textSize || 'm';
  de.dataset.contrast = s.contrast ? 'high' : 'normal';
  de.dataset.motion = s.reduceMotion ? 'reduce' : 'full';
}
applyDisplay();
window.addEventListener('zippy:change', applyDisplay);

const ICON = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  repeat: '<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>',
  truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  ruler: '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0L2.7 16.7a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2"/>',
  thumb: '<path d="M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8a2 2 0 0 1-2 1.7H7V10l4.1-7.4a2.1 2.1 0 0 1 3.9 1.3z"/>',
  gift: '<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 11a7 7 0 0 1-14 0M12 18v4M8 22h8"/>',
  columns: '<rect x="3" y="3" width="7" height="18" rx="2"/><rect x="14" y="3" width="7" height="18" rx="2"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 5.1-5.9M9.9 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.6 18.6 0 0 1-2.2 3.2M1 1l22 22"/>',
  kbd: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 15h10"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  aa: '<path d="M3 20 9 5l6 15M5.5 14h7M16 20l3.5-9L23 20M17.2 17h4.6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  map: '<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><path d="M8 2v16M16 6v16"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><path d="M7.5 7.5h.01"/>'
};
const ic = (n, sz = 20, cls = '') => `<svg class="ic ${cls}" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
const stars = (r, sz = 15) => `<span class="stars" role="img" aria-label="${r} out of 5 stars">${[1, 2, 3, 4, 5].map(i => ic('star', sz, r >= i - 0.3 ? '' : 'e')).join('')}</span>`;

/* A tidy placeholder (with the product name) used when a photo can't load */
function fbSvg(label = '') {
  let h = 0; for (const c of String(label)) h = (h * 31 + c.charCodeAt(0)) | 0;
  const hue = Math.abs(h) % 360, x = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lines = []; let cur = '';
  String(label).split(' ').forEach(w => { if ((cur + ' ' + w).trim().length > 15) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
  if (cur.trim()) lines.push(cur.trim());
  const text = lines.slice(0, 3).map((l, k) => `<text x="200" y="${350 + k * 30}" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#5a4a46">${x(l)}</text>`).join('');
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 85% 93%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360} 70% 89%)"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><g fill="none" stroke="#FF6B4A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".75" transform="translate(0 -20)"><path d="M200 170a22 22 0 1 1 22 22l-22 12v18"/><path d="M200 222 110 290a14 14 0 0 0 9 25h162a14 14 0 0 0 9-25z"/></g>${text}</svg>`);
}
/* Photo failed to load: try the next photo from the same pool, then the placeholder */
function imgFail(el) {
  const m = /photo-[0-9a-f-]+/.exec(el.src), tried = (el.dataset.tried || '').split(',').filter(Boolean);
  if (m) {
    tried.push(m[0]);
    const w = (/[?&]w=(\d+)/.exec(el.src) || [])[1] || 900;
    const next = (POOL_OF[m[0]] || []).find(id => !tried.includes(id));
    if (next) { el.dataset.tried = tried.join(','); el.src = IMG(next, w); return; }
  }
  el.onerror = null; el.src = fbSvg(el.alt || '');
}
const img = (src, alt = '', cls = '') => `<img class="${cls}" src="${src}" alt="${esc(alt)}" loading="lazy" onerror="imgFail(this)">`;

/* ---------- toast ---------- */
function toast(msg, act) {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.append(box); }
  const dup = [...box.children].find(x => x.dataset.msg === msg);   // don't stack identical messages
  if (dup) { clearTimeout(dup._t); dup._t = setTimeout(() => dup.remove(), 3800); return; }
  const t = document.createElement('div');
  t.dataset.msg = msg;
  t.className = 'toast';
  t.innerHTML = `<span>${esc(msg)}</span>${act && act.label ? `<button type="button">${esc(act.label)}</button>` : ''}`;
  if (act && act.label) t.querySelector('button').onclick = () => { t.remove(); act.href ? (location.href = act.href) : act.onClick && act.onClick(); };
  box.append(t);
  t._t = setTimeout(() => t.remove(), 3800);
}

/* ---------- modal / drawer ---------- */
let _ov = null, _onClose = null;
function openModal(html, { drawer = false, onClose = null, wide = false } = {}) {
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'overlay' + (drawer ? ' sheet' : '');
  ov.innerHTML = `<div class="modal ${drawer ? 'drawer' : ''} ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" tabindex="-1"><button type="button" class="iconbtn mx" data-close aria-label="Close">${ic('x')}</button>${html}</div>`;
  document.body.append(ov); document.body.classList.add('lock');
  _ov = ov; _onClose = onClose;
  requestAnimationFrame(() => ov.classList.add('show'));
  let down = false;
  ov.addEventListener('mousedown', e => { down = e.target === ov; });
  ov.addEventListener('click', e => { if ((e.target === ov && down) || e.target.closest('[data-close]')) closeModal(); });
  const m = ov.firstElementChild;
  setTimeout(() => (m.querySelector('[autofocus]') || m).focus(), 40);
  return m;
}
function closeModal() {
  if (!_ov) return;
  const ov = _ov, cb = _onClose; _ov = null; _onClose = null;
  ov.classList.remove('show'); document.body.classList.remove('lock');
  setTimeout(() => ov.remove(), 200);
  if (cb) cb();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab' && _ov) {
    const f = $$('button,a[href],input:not([type=hidden]),select,textarea', _ov).filter(x => !x.disabled && x.offsetParent);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
function confirmBox({ title, text, ok = 'Confirm', cancel = 'Cancel', danger = false }) {
  return new Promise(res => {
    const m = openModal(`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="mact"><button type="button" class="btn ghost" data-close>${esc(cancel)}</button><button type="button" class="btn ${danger ? 'dark' : 'primary'}" data-ok autofocus>${esc(ok)}</button></div>`, { onClose: () => res(false) });
    m.querySelector('[data-ok]').onclick = () => { res(true); closeModal(); };
  });
}
/* ---------- cards ---------- */
function productCard(p, note = '') {
  const sh = shopById(p.shop), st = productStatus(p), fav = Store.s.favP.includes(p.id);
  const badge = st === 'out' ? '<span class="badge">Sold out</span>' : st === 'low' ? '<span class="badge amber">Low stock</span>' : p.daysAgo <= 3 ? '<span class="badge coral">New</span>' : '';
  return `<article class="pcard">
    <a class="pimg" href="product.html?id=${p.id}" aria-label="${esc(p.name)}">${img(p.imgs[0], p.name)}${badge}</a>
    <button type="button" class="fav ${fav ? 'on' : ''}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Save ${esc(p.name)} to favourites">${ic('heart', 18)}</button>
    <button type="button" class="cmp ${Store.s.compare.includes(p.id) ? 'on' : ''}" data-cmp="${p.id}" aria-pressed="${Store.s.compare.includes(p.id)}" aria-label="Compare ${esc(p.name)}" title="Add to compare">${ic('columns', 16)}</button>
    <div class="pbody">
      <a class="pshop" href="shop.html?id=${sh.id}">${esc(sh.name)} · ${sh.km} km</a>
      <a class="pname" href="product.html?id=${p.id}">${esc(p.name)}</a>
      <div class="pmeta"><span class="price">${fmt(p.price)}</span>${p.mrp ? `<s>${fmt(p.mrp)}</s>` : ''}<span class="rate">${ic('star', 13)}${p.rating}</span></div>
      ${note ? `<div class="note">${note}</div>` : ''}
    </div></article>`;
}
function followBtn(id) {
  const on = Store.s.follows.includes(id);
  return `<button type="button" class="btn sm ${on ? 'dark' : 'ghost'}" data-follow="${id}" aria-pressed="${on}">${on ? 'Following' : 'Follow'}</button>`;
}
function hasNew(shopId) { return PRODUCTS.some(p => p.shop === shopId && p.daysAgo <= 3); }
function shopCard(s, withNew = false) {
  return `<article class="scard">
    <a class="scover" href="shop.html?id=${s.id}" aria-label="${esc(s.name)}">${img(s.img, s.name)}${withNew && hasNew(s.id) ? '<span class="newb">NEW</span>' : ''}</a>
    <div class="sbody"><div class="row between"><h3><a href="shop.html?id=${s.id}">${esc(s.name)}</a></h3>${followBtn(s.id)}</div>
    <div class="row small muted" style="margin:8px 0 10px;gap:12px"><span class="row" style="gap:4px">${ic('star', 14, 'on')}${s.rating} (${s.count})</span><span>${s.km} km</span><span class="tag">${s.type}</span></div>
    <div class="small"><span class="dot-o ${isOpen(s) ? '' : 'c'}"></span>${openText(s)}</div></div></article>`;
}
const skeleton = n => Array.from({ length: n }, () => '<div class="sk"></div>').join('');

/* ---------- favourites / follow ---------- */
function syncButtons() {
  $$('[data-fav]').forEach(b => { const on = Store.s.favP.includes(b.dataset.fav); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $$('[data-cmp]').forEach(b => { const on = Store.s.compare.includes(b.dataset.cmp); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); const t = b.querySelector('span'); if (t) t.textContent = on ? 'Added' : 'Compare'; });
  $$('[data-follow]').forEach(b => {
    const on = Store.s.follows.includes(b.dataset.follow);
    b.textContent = on ? 'Following' : 'Follow'; b.setAttribute('aria-pressed', on);
    b.classList.toggle('dark', on); b.classList.toggle('ghost', !on);
  });
}
function toggleFav(id) {
  const on = Store.s.favP.includes(id);
  Store.update(s => { s.favP = on ? s.favP.filter(x => x !== id) : [...s.favP, id]; });
  syncButtons();
  toast(on ? 'Removed from favourites' : 'Saved to favourites', on ? { label: 'Undo', onClick: () => toggleFav(id) } : { label: 'View', href: 'favorites.html' });
}
function toggleFollow(id) {
  const on = Store.s.follows.includes(id), sh = shopById(id);
  Store.update(s => { s.follows = on ? s.follows.filter(x => x !== id) : [...s.follows, id]; });
  syncButtons();
  toast(on ? `Unfollowed ${sh.name}` : `Following ${sh.name}`, on ? { label: 'Undo', onClick: () => toggleFollow(id) } : null);
}
document.addEventListener('click', e => {
  const f = e.target.closest('[data-fav]'); if (f) { e.preventDefault(); toggleFav(f.dataset.fav); return; }
  const fo = e.target.closest('[data-follow]'); if (fo) { e.preventDefault(); toggleFollow(fo.dataset.follow); return; }
  if (e.target.closest('[data-policy]')) { e.preventDefault(); openPolicy(); return; }
  const cm = e.target.closest('[data-cmp]'); if (cm) { e.preventDefault(); toggleCompare(cm.dataset.cmp); return; }
  if (e.target.closest('[data-tour]')) { e.preventDefault(); startTour(); return; }
  if (e.target.closest('[data-display]')) { e.preventDefault(); openDisplay(); return; }
  if (e.target.closest('[data-keys]')) { e.preventDefault(); openShortcuts(); return; }
});

/* ---------- cart ---------- */
async function addToCart(pid, size) {
  const p = prodById(pid), shop = shopById(p.shop), stock = p.sizes[size];
  if (!isOpen(shop)) { toast(`${shop.name} is closed right now`); return false; }
  if (!stock) { toast(`Size ${size} isn't available at ${shop.name}`); return false; }
  const cur = Store.s.cart;
  if (cur.length && prodById(cur[0].pid).shop !== p.shop) {
    const other = shopById(prodById(cur[0].pid).shop);
    const ok = await confirmBox({ title: 'Start a new bag?', text: `Your bag has items from ${other.name}. Zippy delivers from one shop per order, so adding this replaces them.`, ok: 'Replace items', cancel: 'Keep current bag' });
    if (!ok) return false;
    Store.update(s => { s.cart = []; });
  }
  let capped = false;
  const max = Math.min(5, stock);
  Store.update(s => {
    const l = s.cart.find(c => c.pid === pid && c.size === size);
    if (l) { if (l.qty < max) l.qty++; else capped = true; } else s.cart.push({ pid, size, qty: 1 });
  });
  if (capped) toast(`Only ${max} available in size ${size}`);
  else toast('Added to your bag', { label: 'View bag', href: 'cart.html' });
  return true;
}

/* ---------- address picker + form ---------- */
function addressForm(a = null) {
  return new Promise(res => {
    const m = openModal(`<h2>${a ? 'Edit' : 'Add'} address</h2><p class="muted small" style="margin-bottom:18px">Where should we deliver?</p>
    <form novalidate>
      <div class="field"><label for="al">Label (Home, Work…)</label><input class="inp" id="al" value="${esc(a?.label)}" autofocus><div class="errt"></div></div>
      <div class="field"><label for="a1">Flat / building / street</label><input class="inp" id="a1" value="${esc(a?.line)}"><div class="errt"></div></div>
      <div class="field"><label for="a2">Area and city</label><input class="inp" id="a2" value="${esc(a?.area)}"><div class="errt"></div></div>
      <div class="field"><label for="a3">Pincode</label><input class="inp" id="a3" inputmode="numeric" maxlength="6" value="${esc(a?.pin)}"><div class="errt"></div></div>
      <div class="mact"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary">Save address</button></div>
    </form>`, { onClose: () => res(null) });
    m.querySelector('form').onsubmit = e => {
      e.preventDefault();
      const v = id => m.querySelector('#' + id).value.trim();
      const rules = [['al', v('al').length >= 2, 'Enter a label'], ['a1', v('a1').length >= 4, 'Enter your address'], ['a2', v('a2').length >= 3, 'Enter area and city'], ['a3', /^\d{6}$/.test(v('a3')), 'Pincode must be 6 digits']];
      let ok = true;
      rules.forEach(([id, pass, msg]) => { const f = m.querySelector('#' + id); f.classList.toggle('err', !pass); f.nextElementSibling.textContent = pass ? '' : msg; if (!pass) ok = false; });
      if (!ok) return;
      const out = { id: a?.id || 'a' + Date.now(), label: v('al'), line: v('a1'), area: v('a2'), pin: v('a3') };
      res(out); closeModal();
    };
  });
}
function pickAddress() {
  const m = openModal(`<h2>Delivery address</h2><p class="muted small" style="margin-bottom:16px">Shops and delivery times are based on this.</p><div id="addrList" class="stack"></div>
    <div class="mact"><button type="button" class="btn ghost" id="addAddr">${ic('plus', 16)} Add new</button><button type="button" class="btn primary" id="useAddr">Use this address</button></div>`, { drawer: true });
  const draw = () => {
    m.querySelector('#addrList').innerHTML = Store.s.addresses.map(a => `<label class="box radio" style="padding:14px 16px;align-items:flex-start"><input type="radio" name="ad" value="${a.id}" ${a.id === Store.s.addr ? 'checked' : ''}><span><b>${esc(a.label)}</b><br><span class="small muted">${esc(a.line)}, ${esc(a.area)} - ${esc(a.pin)}</span></span></label>`).join('');
  };
  draw();
  m.querySelector('#useAddr').onclick = () => { const v = m.querySelector('input[name=ad]:checked'); if (v) Store.update(s => { s.addr = v.value; }); closeModal(); toast('Delivery address updated'); };
  m.querySelector('#addAddr').onclick = async () => {
    const a = await addressForm();
    if (a) { Store.update(s => { s.addresses.push(a); s.addr = a.id; }); toast('Address added'); }
    pickAddress();
  };
}

/* ---------- exchange & return policy ---------- */
function openPolicy({ onExchange = null, onReturn = null, canEx = false, canRet = false, hint = '' } = {}) {
  const dot = c => `<i style="width:14px;height:14px;border-radius:50%;background:${c};display:block;margin:0 auto 6px;border:3px solid var(--card);box-shadow:0 0 0 2px ${c}"></i>`;
  const m = openModal(`<h2>Exchange &amp; return policy</h2><p class="muted" style="margin-bottom:16px">Wrong size or not what you expected? Swap it or send it back, with the same shop.</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);text-align:center;font-size:13px;margin:4px 0 6px;position:relative"><div style="position:absolute;left:16%;right:16%;top:6px;height:2px;background:var(--line)"></div>
    <div style="position:relative">${dot('var(--ink)')}<b>Delivered</b><div class="muted">Day 0</div></div>
    <div style="position:relative">${dot('var(--coral)')}<b>Exchange ends</b><div class="muted">After 24 hours</div></div>
    <div style="position:relative">${dot('#4FA97A')}<b>Return ends</b><div class="muted">After 7 days</div></div></div>
  <div style="display:grid;gap:12px;margin-top:16px">
    <div class="perk"><span class="pi">${ic('repeat', 20)}</span><span><b>Exchange: free, within 24 hours</b><br><span class="muted small">Swap for another size. The rider collects the old one when delivering the new one. If your size is out of stock you get store credit.</span></span></div>
    <div class="perk"><span class="pi">${ic('shield', 20)}</span><span><b>Return: full refund, within 7 days</b><br><span class="muted small">Free pickup. Refund goes back to the way you paid, 3–5 business days after pickup.</span></span></div>
    <div class="perk"><span class="pi">${ic('clock', 20)}</span><span><b>Condition</b><br><span class="muted small">Unworn, unwashed, with tags. Innerwear and customised items can’t be returned.</span></span></div></div>
  ${onExchange || onReturn ? `<div class="mact"><button type="button" class="btn ghost" id="reqEx" ${canEx ? '' : 'disabled'}>Request exchange</button><button type="button" class="btn primary" id="reqRt" ${canRet ? '' : 'disabled'}>Return an item</button></div><p class="small muted" style="margin-top:10px;text-align:center">${esc(hint)}</p>` : `<div class="mact"><button type="button" class="btn dark" data-close>Got it</button></div>`}`);
  const x = m.querySelector('#reqEx'); if (x) x.onclick = () => { closeModal(); onExchange(); };
  const r = m.querySelector('#reqRt'); if (r) r.onclick = () => { closeModal(); onReturn(); };
}

/* ---------- layout: header + footer + bottom nav ---------- */
function highlight(t, q) {
  const i = t.toLowerCase().indexOf(q.toLowerCase());
  return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<em>' + esc(t.slice(i, i + q.length)) + '</em>' + esc(t.slice(i + q.length));
}
function buildSuggest(term) {
  term = term.trim();
  let h = '';
  if (!term) {
    if (Store.s.recent.length) h += '<h4>Recent</h4>' + Store.s.recent.map(r => `<a href="search.html?q=${encodeURIComponent(r)}">${ic('clock', 16)}${esc(r)}</a>`).join('');
    h += '<h4>Trending</h4>' + TRENDING.map(r => `<a href="search.html?q=${encodeURIComponent(r)}">${ic('bolt', 16)}${esc(r)}</a>`).join('');
  } else {
    h += `<a href="search.html?q=${encodeURIComponent(term)}">${ic('search', 16)}Search for “${esc(term)}”</a>`;
    const ps = PRODUCTS.filter(p => matchesQuery(p, term)).slice(0, 4);
    if (ps.length) h += '<h4>Products</h4>' + ps.map(p => `<a href="product.html?id=${p.id}">${img(p.imgs[0], '')}<span><span>${highlight(p.name, term)}</span><br><span class="tiny muted">${esc(shopById(p.shop).name)} · ${fmt(p.price)}</span></span></a>`).join('');
    const cs = CATEGORIES.filter(c => c.label.toLowerCase().includes(term.toLowerCase())).slice(0, 2);
    if (cs.length) h += '<h4>Categories</h4>' + cs.map(c => `<a href="search.html?cat=${c.id}">${ic('filter', 16)}All ${highlight(c.label, term)}</a>`).join('');
    const ss = SHOPS.filter(s => s.name.toLowerCase().includes(term.toLowerCase())).slice(0, 2);
    if (ss.length) h += '<h4>Shops</h4>' + ss.map(s => `<a href="shop.html?id=${s.id}">${ic('store', 16)}${highlight(s.name, term)}<span class="tiny muted">${s.km} km</span></a>`).join('');
  }
  $('#suggest').innerHTML = h; $('#suggest').classList.add('open');
}
function acctHTML() {
  return isSignedIn()
    ? `<a class="iconbtn" href="profile.html" aria-label="Your account: ${esc(currentUser().name)}" title="${esc(currentUser().name)}"><span class="av av-s">${esc(currentUser().name[0].toUpperCase())}</span></a>`
    : `<a class="btn ghost sm signin" href="login.html?next=${encodeURIComponent((location.pathname.split('/').pop() || 'index.html') + location.search)}">Sign in</a>`;
}
function refreshChrome() {
  const slot = $('#acctSlot'); if (slot) { const h = acctHTML(); if (slot.dataset.h !== h) { slot.dataset.h = h; slot.innerHTML = h; } }
  const a = activeAddress();
  const lt = $('#locText'); if (lt) lt.textContent = `${a.label} · ${a.area.split(',')[0]}`;
  $$('[data-bagn]').forEach(b => { const n = cartCount(); b.textContent = n || ''; });
  $$('[data-favn]').forEach(b => { const n = Store.s.favP.length; b.textContent = n || ''; });
  const tb = $('#themeBtn'); if (tb) { const dark = document.documentElement.dataset.theme === 'dark'; tb.innerHTML = ic(dark ? 'sun' : 'moon'); tb.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); }
  drawTray();
}
function Layout(active) {
  const here = location.pathname.split('/').pop() || 'index.html', curAud = qs.get('aud') || '';
  const abar = [...AUDIENCES.map(a => [`search.html?aud=${a.id}`, a.label, here === 'search.html' && curAud === a.id]), null, ['categories.html', 'Categories', here === 'categories.html'], ['new.html', 'New arrivals', here === 'new.html'], ['shops.html', 'Nearby shops', here === 'shops.html']];
  $('#app-header').innerHTML = `<header class="site-header"><div class="wrap hdr">
    <button type="button" class="iconbtn menubtn" id="menuBtn" aria-label="Open menu" aria-haspopup="dialog" aria-expanded="false" title="Menu (M)">${ic('menu', 22)}</button>
    <a class="logo" href="index.html" aria-label="Zippy home"><span class="logo-mark">${ic('bolt', 20)}</span><span class="t">Zippy</span></a>
    <button type="button" class="loc" id="locBtn" aria-label="Change delivery address">${ic('pin', 16)}<span id="locText"></span></button>
    <form class="hsearch" id="hform" role="search" autocomplete="off">${ic('search', 18)}<label class="sr" for="hq">Search Zippy</label>
      <input id="hq" name="q" placeholder="Search blazers, kurtas, shops…" value="${esc(active === 'search' ? qs.get('q') || '' : '')}"><button type="button" class="mic" id="micBtn" aria-label="Search by voice" title="Search by voice" hidden>${ic('mic', 18)}</button><div class="suggest" id="suggest"></div></form>
    <nav class="hnav" aria-label="Main">
      <button type="button" class="iconbtn hide-m" id="themeBtn" aria-label="Switch colour theme"></button>
      <a class="iconbtn hide-m" href="favorites.html" aria-label="Favourites">${ic('heart')}<span class="badge-n" data-favn></span></a>
      <span id="acctSlot" class="hide-m"></span>
      <a class="iconbtn" href="cart.html" aria-label="Open bag">${ic('bag')}<span class="badge-n" data-bagn></span></a></nav></div>
    <nav class="audbar" aria-label="Shop by section"><div class="wrap">${abar.map(a => a ? `<a href="${a[0]}"${a[2] ? ' class="on" aria-current="page"' : ''}>${a[1]}</a>` : '<span class="sep" aria-hidden="true"></span>').join('')}</div></nav></header>`;
  $('#app-footer').innerHTML = `<footer class="footer"><div class="wrap"><div class="fgrid">
    <div><a class="logo" href="index.html"><span class="logo-mark">${ic('bolt', 20)}</span>Zippy</a><p class="small" style="margin-top:14px;max-width:300px">Fashion from the shops around you, at your door in 10–15 minutes.</p></div>
    <div><h4>Shop</h4><a href="search.html?aud=men">Men</a><a href="search.html?aud=women">Women</a><a href="search.html?aud=kids">Kids</a><a href="categories.html">Categories</a><a href="shops.html">Nearby shops</a><a href="new.html">New arrivals</a><a href="search.html">All styles</a><a href="search.html?cat=blazer">Blazers</a><a href="search.html?cat=kurta">Kurtas</a><a href="search.html?cat=dress">Dresses</a></div>
    <div><h4>Your Zippy</h4><a href="favorites.html">Favourites</a><a href="profile.html">Orders</a><a href="profile.html">Addresses</a><a href="profile.html#returns">Returns</a><a href="cart.html">Bag</a></div>
    <div><h4>Help</h4><button type="button" data-policy>Exchange &amp; returns</button><a href="how.html">How it works</a><button type="button" data-display>Display &amp; accessibility</button><button type="button" data-keys>Keyboard shortcuts</button></div>
    <div><h4>Project</h4><a href="principles.html">Design principles</a><a href="feedback.html">Rate this site (SUS)</a><button type="button" data-tour>Take the tour</button></div></div>
    <div class="copy">© Zippy · HCI mini project. All product data is sample data.</div></div></footer>
    <nav class="bottomnav" aria-label="Mobile">${[['home', 'index.html', 'Home', 'home'], ['search', 'search.html', 'Search', 'search'], ['fav', 'favorites.html', 'Saved', 'heart'], ['bag', 'cart.html', 'Bag', 'bag'], ['me', 'profile.html', 'Profile', 'user']].map(n => `<a href="${n[1]}" class="${active === n[0] ? 'on' : ''}" ${active === n[0] ? 'aria-current="page"' : ''}>${ic(n[3], 22)}${n[2]}${n[0] === 'bag' ? '<span class="badge-n" data-bagn></span>' : ''}</a>`).join('')}</nav>`;
  const input = $('#hq'), box = $('#suggest');
  input.addEventListener('focus', () => buildSuggest(input.value));
  input.addEventListener('input', () => buildSuggest(input.value));
  input.addEventListener('keydown', e => {
    const items = $$('a', box); if (!items.length || !box.classList.contains('open')) return;
    let i = items.findIndex(x => x.classList.contains('act'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); items.forEach(x => x.classList.remove('act'));
      i = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
      items[i].classList.add('act'); items[i].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && i > -1) { e.preventDefault(); location.href = items[i].href; }
    else if (e.key === 'Escape') box.classList.remove('open');
  });
  document.addEventListener('click', e => { if (!e.target.closest('#hform')) box.classList.remove('open'); });
  $('#hform').addEventListener('submit', e => {
    e.preventDefault(); const q = input.value.trim();
    if (q) addRecent(q);
    location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });
  $('#locBtn').onclick = pickAddress;
  $('#menuBtn').onclick = openMenu;
  $('#themeBtn').onclick = () => Store.update(s => { s.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; });
  setupVoice(input, $('#hform'));
  const tray = document.createElement('div'); tray.id = 'cmpTray'; tray.className = 'cmptray'; tray.setAttribute('role', 'region'); tray.setAttribute('aria-label', 'Compare products'); document.body.append(tray);
  refreshChrome();
}
window.addEventListener('zippy:change', refreshChrome);
/* ============ SIDE MENU (hidden until the ☰ button or the M key) ============ */
const AUD_POSS = { men: 'Men’s', women: 'Women’s', kids: 'Kids’' };
let _sb = null, _sbFocus = null;
function menuHTML() {
  const s = Store.s, user = isSignedIn() ? currentUser() : null, curAud = qs.get('aud') || '', a = activeAddress();
  const live = s.orders.filter(o => !o.cancelled && !orderState(o).done)[0];
  const viewed = s.viewed.map(prodById).filter(Boolean).slice(0, 3);
  const dark = document.documentElement.dataset.theme === 'dark';
  const link = (href, icon, label, extra = '') => `<a class="sb-link" href="${href}">${ic(icon, 18)}<span>${label}</span>${extra}</a>`;
  const num = n => n ? `<span class="sb-n">${n}</span>` : '';
  const audBlock = AUDIENCES.map(x => `<div class="sb-acc${curAud === x.id ? ' open' : ''}"><button type="button" class="sb-acc-h" aria-expanded="${curAud === x.id}" data-acc="${x.id}"><span class="sb-ph">${img(IMG(PHOTOS[x.photo][0], 160), '')}</span><span class="sb-t"><b>${x.label}</b><span class="tiny muted">${x.n} styles</span></span>${ic('chev', 18, 'sb-chev')}</button>
    <div class="sb-acc-b"><a class="sb-cat all" href="search.html?aud=${x.id}">All ${AUD_POSS[x.id]} styles</a>${catsFor(x.id).map(c => `<a class="sb-cat" href="search.html?aud=${x.id}&amp;cat=${c.id}">${esc(c.label)}<span class="tiny muted">${c.n}</span></a>`).join('')}</div></div>`).join('');
  return `<div class="sb-top"><a class="logo" href="index.html"><span class="logo-mark">${ic('bolt', 20)}</span><span class="t">Zippy</span></a><button type="button" class="iconbtn" data-sbclose aria-label="Close menu">${ic('x')}</button></div>
  <div class="sb-scroll">
    <div class="sb-user">${user ? `<span class="av av-s">${esc(user.name[0].toUpperCase())}</span><span><b>Hi, ${esc(user.name.split(' ')[0])}</b><br><a class="link tiny" href="profile.html">View profile</a></span>` : `<span class="av av-s">${ic('user', 16)}</span><span><b>Welcome to Zippy</b><br><a class="link tiny" href="login.html?next=${encodeURIComponent(location.pathname.split('/').pop() + location.search)}">Sign in or register</a></span>`}</div>
    <button type="button" class="sb-loc" data-sbloc>${ic('pin', 16)}<span><span class="tiny muted">Delivering to</span><br><b>${esc(a.label)} · ${esc(a.area.split(',')[0])}</b></span><span class="link tiny">Change</span></button>
    ${live ? `<a class="sb-live" href="tracking.html?id=${live.id}">${ic('truck', 18)}<span><b>Order ${live.id} is on its way</b><br><span class="tiny">Track live</span></span>${ic('chev', 16)}</a>` : ''}
    <p class="sb-h">Shop for</p>${audBlock}
    <p class="sb-h">Browse</p>
    ${link('categories.html', 'list', 'Shop by category')}${link('new.html', 'bolt', 'New arrivals')}${link('shops.html', 'store', 'Nearby shops')}${link('search.html?max=1000', 'tag', 'Under ₹1,000')}${link('how.html', 'info', 'How Zippy works')}
    <p class="sb-h">Your Zippy</p>
    ${link('favorites.html', 'heart', 'Favourites', num(s.favP.length))}${link('cart.html', 'bag', 'Your bag', num(cartCount()))}${link('profile.html', 'truck', 'Orders &amp; tracking')}${link('profile.html#returns', 'repeat', 'Returns &amp; exchanges')}
    ${viewed.length ? `<p class="sb-h">Recently viewed</p><div class="sb-rv">${viewed.map(p => `<a href="product.html?id=${p.id}" title="${esc(p.name)}">${img(p.imgs[0], p.name)}<span class="tiny">${fmt(p.price)}</span></a>`).join('')}</div>` : ''}
    <p class="sb-h">Settings</p>
    <button type="button" class="sb-link" data-sbtheme>${ic(dark ? 'sun' : 'moon', 18)}<span>${dark ? 'Switch to light theme' : 'Switch to dark theme'}</span></button>
    <button type="button" class="sb-link" data-display>${ic('aa', 18)}<span>Display &amp; accessibility</span></button>
    <button type="button" class="sb-link" data-keys>${ic('kbd', 18)}<span>Keyboard shortcuts</span></button>
    <button type="button" class="sb-link" data-tour>${ic('info', 18)}<span>Take the tour</span></button>
  </div>`;
}
function openMenu() {
  if (_sb) return;
  closeModal();
  _sbFocus = document.activeElement;
  const ov = document.createElement('div'); ov.className = 'sb-ov';
  const box = document.createElement('aside'); box.className = 'sidebar'; box.id = 'sidebar';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Menu'); box.tabIndex = -1;
  box.innerHTML = menuHTML();
  document.body.append(ov, box); document.body.classList.add('lock');
  _sb = { ov, box };
  const mb = $('#menuBtn'); if (mb) mb.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => { ov.classList.add('show'); box.classList.add('show'); });
  setTimeout(() => (box.querySelector('[data-sbclose]') || box).focus(), 60);
  ov.onclick = () => closeMenu();
  box.addEventListener('click', e => {
    if (e.target.closest('[data-sbclose]')) return closeMenu();
    const acc = e.target.closest('[data-acc]');
    if (acc) {
      const wrap = acc.parentElement, open = !wrap.classList.contains('open');
      box.querySelectorAll('.sb-acc').forEach(x => { x.classList.remove('open'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
      if (open) { wrap.classList.add('open'); acc.setAttribute('aria-expanded', 'true'); }
      return;
    }
    if (e.target.closest('[data-sbloc]')) { closeMenu(false); pickAddress(); return; }
    const th = e.target.closest('[data-sbtheme]');
    if (th) { Store.update(s => { s.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; }); const dark = document.documentElement.dataset.theme === 'dark'; th.innerHTML = `${ic(dark ? 'sun' : 'moon', 18)}<span>${dark ? 'Switch to light theme' : 'Switch to dark theme'}</span>`; return; }
    if (e.target.closest('[data-display],[data-keys],[data-tour]')) closeMenu(false);   /* the page-wide click handler then opens that window */
  });
}
function closeMenu(restore = true) {
  if (!_sb) return;
  const { ov, box } = _sb; _sb = null;
  ov.classList.remove('show'); box.classList.remove('show'); document.body.classList.remove('lock');
  setTimeout(() => { ov.remove(); box.remove(); }, 260);
  const mb = $('#menuBtn'); if (mb) { mb.setAttribute('aria-expanded', 'false'); if (restore) mb.focus(); }
}
document.addEventListener('keydown', e => {
  if (!_sb) return;
  if (e.key === 'Escape') { closeMenu(); return; }
  if (e.key === 'Tab') {
    const f = $$('button,a[href]', _sb.box).filter(x => !x.disabled && x.offsetParent);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!_sb.box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- scroll reveal ---------- */
function reveal() {
  const els = $$('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
  els.forEach(e => io.observe(e));
}

/* ============ COMPARE (up to 3 products) ============ */
function toggleCompare(id) {
  const on = Store.s.compare.includes(id);
  if (!on && Store.s.compare.length >= 3) { toast('You can compare up to 3 styles. Remove one first.', { label: 'Open compare', onClick: openCompare }); return; }
  Store.update(s => { s.compare = on ? s.compare.filter(x => x !== id) : [...s.compare, id]; });
  syncButtons();
}
function drawTray() {
  const t = $('#cmpTray'); if (!t) return;
  const ps = Store.s.compare.map(prodById).filter(Boolean);
  t.classList.toggle('show', ps.length > 0);
  t.innerHTML = ps.length ? `<div class="ct-items">${ps.map(p => `<span class="ct-i">${img(p.imgs[0], p.name)}<button type="button" data-cmp="${p.id}" aria-label="Remove ${esc(p.name)} from compare">${ic('x', 12)}</button></span>`).join('')}</div>
    <span class="ct-t"><b>${ps.length} selected</b><span class="tiny">${ps.length < 2 ? 'Pick one more to compare' : 'Ready to compare'}</span></span>
    <button type="button" class="btn primary sm ${ps.length < 2 ? 'off' : ''}" id="cmpGo" ${ps.length < 2 ? 'disabled' : ''}>Compare</button>
    <button type="button" class="link" id="cmpClear">Clear</button>` : '';
  const go = $('#cmpGo'); if (go) go.onclick = openCompare;
  const cl = $('#cmpClear'); if (cl) cl.onclick = () => { Store.update(s => { s.compare = []; }); syncButtons(); };
}
function openCompare() {
  const ps = Store.s.compare.map(prodById).filter(Boolean);
  if (ps.length < 2) { toast('Pick at least 2 styles to compare'); return; }
  const lo = Math.min(...ps.map(p => p.price)), near = Math.min(...ps.map(p => shopById(p.shop).km)), top = Math.max(...ps.map(p => p.rating));
  const best = t => `<span class="tag best">${t}</span>`;
  const row = (label, fn) => `<tr><th scope="row">${label}</th>${ps.map(p => `<td>${fn(p)}</td>`).join('')}</tr>`;
  const m = openModal(`<h2>Compare styles</h2><p class="muted small" style="margin-bottom:14px">Side by side, so you don’t have to remember details between pages.</p>
    <div class="cmpwrap"><table class="cmptbl"><thead><tr><td></td>${ps.map(p => `<td><a href="product.html?id=${p.id}">${img(p.imgs[0], p.name)}<b>${esc(p.name)}</b></a><button type="button" class="link" data-cmprm="${p.id}">Remove</button></td>`).join('')}</tr></thead><tbody>
    ${row('Price', p => `<b class="price">${fmt(p.price)}</b> ${p.price === lo ? best('Lowest') : ''}${p.mrp ? `<div class="tiny muted"><s>${fmt(p.mrp)}</s> · ${Math.round((1 - p.price / p.mrp) * 100)}% off</div>` : ''}`)}
    ${row('Shop', p => `${esc(shopById(p.shop).name)}<div class="tiny muted">${shopById(p.shop).type}</div>`)}
    ${row('Distance', p => `${shopById(p.shop).km} km ${shopById(p.shop).km === near ? best('Nearest') : ''}<div class="tiny muted">${shopById(p.shop).km <= 3 ? '10–15 min' : '30–40 min'}</div>`)}
    ${row('Rating', p => `${ic('star', 14, 'on')} ${p.rating} (${p.count}) ${p.rating === top ? best('Top rated') : ''}`)}
    ${row('Sizes in stock', p => SIZES.map(z => `<span class="szc ${p.sizes[z] > 0 ? '' : 'x'}">${z}</span>`).join(''))}
    ${row('Category', p => catLabel(p.cat))}
    </tbody></table></div><div class="mact"><button type="button" class="btn ghost" id="cmpReset">Clear all</button><button type="button" class="btn dark" data-close>Done</button></div>`, { wide: true });
  m.addEventListener('click', e => {
    const r = e.target.closest('[data-cmprm]');
    if (r) { Store.update(s => { s.compare = s.compare.filter(x => x !== r.dataset.cmprm); }); syncButtons(); closeModal(); if (Store.s.compare.length >= 2) openCompare(); }
    if (e.target.closest('#cmpReset')) { Store.update(s => { s.compare = []; }); syncButtons(); closeModal(); }
  });
}

/* ============ VOICE SEARCH (Web Speech API, Chrome / Edge / Safari) ============ */
function setupVoice(input, form) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition, btn = $('#micBtn');
  if (!btn) return;
  if (!SR) { btn.remove(); return; }            // unsupported browser: no dead button
  btn.hidden = false;
  const idle = input.placeholder;
  let rec = null, live = false, finalText = '';
  btn.onclick = () => {
    if (live && rec) { rec.stop(); return; }
    finalText = '';
    rec = new SR(); rec.lang = 'en-IN'; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onstart = () => { live = true; btn.classList.add('live'); btn.setAttribute('aria-label', 'Stop listening'); input.placeholder = 'Listening… say “formal blazer”'; $('#suggest').classList.remove('open'); };
    rec.onresult = e => {
      const t = [...e.results].map(r => r[0].transcript).join(' ').trim();
      input.value = t;
      if (e.results[e.results.length - 1].isFinal) finalText = t;
    };
    rec.onerror = e => {
      finalText = '';
      const msg = { 'not-allowed': 'Microphone is blocked. Allow it in the address bar, or just type your search.', 'service-not-allowed': 'Microphone is blocked. Allow it in the address bar, or just type your search.', 'no-speech': 'We didn’t hear anything. Tap the mic and try again.', 'network': 'Voice search needs an internet connection.', 'audio-capture': 'No microphone found on this device.' }[e.error];
      if (e.error !== 'aborted') toast(msg || 'Voice search stopped. Please try again.');
    };
    rec.onend = () => {
      live = false; btn.classList.remove('live'); btn.setAttribute('aria-label', 'Search by voice'); input.placeholder = idle;
      if (finalText) { toast(`Searching for “${finalText}”`); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }
    };
    try { rec.start(); } catch (err) { /* already started */ }
  };
}

/* ============ KEYBOARD SHORTCUTS (can be turned off in Display settings) ============ */
const SHORTCUTS = [['/', 'Focus the search box'], ['m', 'Open the side menu'], ['h', 'Go to Home'], ['s', 'Browse all styles'], ['f', 'Open favourites'], ['c', 'Open your bag'], ['p', 'Open profile'], ['d', 'Switch dark / light theme'], ['?', 'Show this list'], ['Esc', 'Close a window or suggestions']];
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Escape') return;
  const t = e.target, typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
  if (typing || _ov || Store.s.shortcuts === false) return;
  const go = u => { e.preventDefault(); location.href = u; };
  switch (e.key) {
    case '/': e.preventDefault(); { const q = $('#hq'); if (q) q.focus(); } break;
    case '?': e.preventDefault(); openShortcuts(); break;
    case 'm': e.preventDefault(); openMenu(); break;
    case 'h': go('index.html'); break;
    case 's': go('search.html'); break;
    case 'f': go('favorites.html'); break;
    case 'c': go('cart.html'); break;
    case 'p': go('profile.html'); break;
    case 'd': Store.update(s => { s.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; }); break;
  }
});
function openShortcuts() {
  openModal(`<h2>Keyboard shortcuts</h2><p class="muted small" style="margin-bottom:14px">${Store.s.shortcuts === false ? 'Shortcuts are currently off. Turn them on in Display &amp; accessibility.' : 'Press these keys anywhere (when you’re not typing in a box).'}</p>
    <div class="keys">${SHORTCUTS.map(k => `<div><kbd>${k[0]}</kbd><span>${k[1]}</span></div>`).join('')}</div>
    <div class="mact"><button type="button" class="btn ghost" data-display>Display settings</button><button type="button" class="btn dark" data-close autofocus>Got it</button></div>`);
}

/* ============ DISPLAY & ACCESSIBILITY ============ */
function openDisplay() {
  const draw = () => {
    const s = Store.s;
    const seg = (name, opts, cur) => `<div class="seg" role="radiogroup" aria-label="${name}">${opts.map(o => `<button type="button" role="radio" aria-checked="${cur === o[0]}" class="${cur === o[0] ? 'on' : ''}" data-set-${name}="${o[0]}">${o[1]}</button>`).join('')}</div>`;
    const sw = (k, t, d) => `<div class="sett"><span><b class="small">${t}</b><br><span class="tiny muted">${d}</span></span><label class="switch"><input type="checkbox" data-opt="${k}" ${(k === 'shortcuts' ? s.shortcuts !== false : s[k]) ? 'checked' : ''} aria-label="${t}"><i></i></label></div>`;
    return `<h2>Display &amp; accessibility</h2><p class="muted small" style="margin-bottom:16px">Changes apply instantly and are remembered on this device.</p>
      <div class="field"><label>Theme</label>${seg('theme', [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Match device']], s.theme)}</div>
      <div class="field"><label>Text size</label>${seg('text', [['s', 'Small'], ['m', 'Default'], ['l', 'Large'], ['xl', 'Extra large']], s.textSize)}</div>
      ${sw('contrast', 'High contrast', 'Stronger borders and darker secondary text')}
      ${sw('reduceMotion', 'Reduce motion', 'Turns off animations and smooth scrolling')}
      ${sw('shortcuts', 'Keyboard shortcuts', 'Single-key shortcuts such as / for search')}
      <div class="mact"><button type="button" class="btn dark" data-close autofocus>Done</button></div>`;
  };
  const m = openModal(draw());
  const body = () => { const keep = m.querySelector('.mx'); m.innerHTML = ''; m.append(keep); m.insertAdjacentHTML('beforeend', draw()); };
  m.addEventListener('click', e => {
    const th = e.target.closest('[data-set-theme]'), tx = e.target.closest('[data-set-text]');
    if (th) { Store.update(s => { s.theme = th.dataset.setTheme; }); body(); }
    if (tx) { Store.update(s => { s.textSize = tx.dataset.setText; }); body(); }
  });
  m.addEventListener('change', e => {
    const o = e.target.closest('[data-opt]'); if (!o) return;
    Store.update(s => { s[o.dataset.opt] = o.checked; });
  });
}

/* ============ FIRST-VISIT TOUR ============ */
function startTour() {
  const STEPS = [
    ['search', 'Find clothes near you', 'Search or filter by size, price and distance. Only styles that are in stock at shops around you show up. Tip: press / to jump to search, or tap the mic to speak.'],
    ['ruler', 'Pick a size with confidence', 'Sizes a shop doesn’t have are greyed out and crossed, so you can’t order something that can’t be delivered. Not sure? Open the size guide.'],
    ['columns', 'Compare before you buy', 'Tap Compare on up to 3 styles to see price, distance and sizes side by side. Tap the heart to save one for later.'],
    ['truck', 'Track it, swap it free', 'Watch your rider live. Wrong size? Exchange free within 24 hours, or return within 7 days. You can cancel until the shop starts packing.']
  ];
  let i = 0, done = false;
  const finish = () => { if (done) return; done = true; Store.update(s => { s.toured = true; }); };
  const m = openModal('', { onClose: finish });
  const paint = () => {
    const st = STEPS[i], last = i === STEPS.length - 1;
    m.innerHTML = `<button type="button" class="iconbtn mx" data-close aria-label="Close tour">${ic('x')}</button>
      <div class="tour"><div class="tour-i">${ic(st[0], 30)}</div><p class="tiny muted">Step ${i + 1} of ${STEPS.length}</p><h2 style="margin:4px 0 10px">${st[1]}</h2><p class="muted">${st[2]}</p>
      <div class="tdots" aria-hidden="true">${STEPS.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="mact">${i ? '<button type="button" class="btn ghost" data-back>Back</button>' : '<button type="button" class="btn ghost" data-close>Skip tour</button>'}<button type="button" class="btn primary" data-next autofocus>${last ? 'Start shopping' : 'Next'}</button></div></div>`;
    m.querySelector('[data-next]').onclick = () => { if (last) closeModal(); else { i++; paint(); } };
    const b = m.querySelector('[data-back]'); if (b) b.onclick = () => { i--; paint(); };
    m.querySelector('[data-next]').focus();
  };
  paint();
}