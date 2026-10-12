/* ============ SHARED SECTIONS (used by categories, shops and new pages) ============ */
/* small garment icons shown on each category photo */
const CAT_ICON = {
  blazer:   ['#E3E8F6', '#2F3E6B', '<path d="M22 10 8 20 6 50h8l4-20v26h28V30l4 20h8l-2-30-14-10-10 28z"/><path d="M32 38v18M24 44h.01M24 50h.01"/>'],
  shirt:    ['#E6F0FA', '#7FA6D6', '<path d="M22 12 8 22 6 46l8 1 3-17v24h30V30l3 17 8-1-2-24-14-10-10 9z"/><path d="M32 21v33M32 28h.01M32 36h.01M32 44h.01"/>'],
  tee:      ['#FFF1E8', '#FF6B4A', '<path d="M20 12 8 20l5 10 7-4v28h24V26l7 4 5-10-12-8c-2 5-22 5-24 0z"/>'],
  trousers: ['#EFE9DC', '#B9A27A', '<path d="M18 8h28l4 48H35l-3-32-3 32H14z"/><path d="M18 14h28"/>'],
  jeans:    ['#DDE8F7', '#3C6EA5', '<path d="M18 8h28l4 48H35l-3-32-3 32H14z"/><path d="M18 14h28M21 15q4 8 8 0M43 15q-4 8-8 0M32 14v10"/>'],
  shorts:   ['#E8F4EC', '#4FA97A', '<path d="M16 10h32l4 28H35l-3-12-3 12H12z"/><path d="M16 16h32"/>'],
  joggers:  ['#ECE8F7', '#7D6BC4', '<path d="M18 8h28l2 42H36l-4-26-4 26H16z"/><path d="M18 14h28M28 14v6M36 14v6M16 45h12M36 45h12"/>'],
  hoodie:   ['#F1EDE9', '#8C8C96', '<path d="M22 14 8 24l4 26h6v4h28v-4h6l4-26-14-10c-2-6-18-6-20 0z"/><path d="M24 14c4 8 12 8 16 0M24 44h16l-2-8H26z"/>'],
  sweater:  ['#FDEBE4', '#E0805F', '<path d="M24 10 8 22l2 26h8l-1-14v22h30V34l-1 14h8l2-26L40 10c-3 6-13 6-16 0z"/><path d="M17 50h30M10 44h8M46 44h8"/>'],
  jacket:   ['#E9EEF1', '#4B5A66', '<path d="M22 10 8 20l-2 32h10V28l6-4V58h20V24l6 4v24h10l-2-32L42 10 32 20z"/><path d="M32 20v38M24 44h-4M40 44h4"/>'],
  top:      ['#FCE6EF', '#E0567F', '<path d="M22 8h4v12q6 6 12 0V8h4l4 30H18z"/><path d="M20 30h24"/>'],
  dress:    ['#FBE8F0', '#D9548C', '<path d="M24 8l2 14-9 34h30l-9-34 2-14q-8 10-16 0z"/><path d="M26 24h12"/>'],
  skirt:    ['#F1E8F8', '#A06BC9', '<path d="M20 12h24l10 40H10z"/><path d="M20 19h24M26 19l-4 33M38 19l4 33"/>'],
  kurta:    ['#FFF0DB', '#E39A22', '<path d="M22 8 8 17l4 12 8-3-2 32h28l-2-32 8 3 4-12-14-9q-10 10-20 0z"/><path d="M32 18v18M28 22h.01M36 22h.01M18 46h28"/>'],
  saree:    ['#FDE6E6', '#C62F3E', '<path d="M22 6h20l4 20-8 32H26l-8-32z"/><path d="M42 6 28 30l-9-5M20 40h24M22 48h20"/>'],
  lehenga:  ['#F9E9D6', '#B8702E', '<path d="M24 5h16l2 15H22z"/><path d="M22 24h20l14 34H8z"/><path d="M14 50h36M19 40h26"/>']
};
/* one photo per category (never the same photo twice), with a small garment icon so each tile is unmistakable */
function catTiles() {
  const used = new Set();
  return CATEGORIES.map(c => {
    /* the photo comes from a real product in this category, never the same photo twice */
    const ps = PRODUCTS.filter(p => p.cat === c.id), pick = ps.find(p => !used.has(p.imgs[0])) || ps[0];
    const src = pick.imgs[0]; used.add(src);
    const k = CAT_ICON[c.id] || CAT_ICON.tee;
    return `<a class="cat" href="search.html?cat=${c.id}"><div style="position:relative;display:flow-root"><div class="ci">${img(src.replace(/w=\d+/, 'w=300'), c.label)}</div><span aria-hidden="true" style="position:absolute;right:2px;bottom:12px;width:34px;height:34px;border-radius:50%;background:${k[0]};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.18);display:grid;place-items:center"><svg viewBox="0 0 64 64" width="72%" height="72%" fill="${k[1]}" fill-opacity=".28" stroke="${k[1]}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${k[2]}</svg></span></div>${c.label}</a>`;
  }).join('');
}

/* if a photo fails and falls back to one another tile already shows, move this tile to a photo that is not used yet */
function dedupeCats() {
  const box = $('.cats'); if (!box) return;
  const pid = el => (/photo-[0-9a-f-]+/.exec(el.currentSrc || el.src) || [])[0];
  box.addEventListener('load', e => {
    const el = e.target; if (el.tagName !== 'IMG') return;
    const id = pid(el), others = [...box.querySelectorAll('img')].filter(x => x !== el).map(pid);
    if (!id || !others.includes(id)) return;
    const tried = (el.dataset.tried || '').split(',').filter(Boolean); tried.push(id);
    const next = (POOL_OF[id] || []).find(x => !tried.includes(x) && !others.includes(x));
    if (next) { el.dataset.tried = tried.join(','); el.src = IMG(next, 300); }
  }, true);
}

/* Netflix-style rail: shops scroll sideways with arrow buttons instead of a scrollbar */
function shopRail(list) {
  return `<div class="rail"><button type="button" class="rail-btn prev" aria-label="Scroll shops left" hidden>${ic('chev', 22)}</button><div class="shops" id="nearby">${list.map(s => shopCard(s)).join('')}</div><button type="button" class="rail-btn next" aria-label="Scroll shops right">${ic('chev', 22)}</button></div>`;
}
function bindRail() {
  const rail = $('.rail'); if (!rail) return;
  const row = $('#nearby'), pv = $('.prev', rail), nx = $('.next', rail);
  const sync = () => { pv.hidden = row.scrollLeft < 8; nx.hidden = row.scrollLeft > row.scrollWidth - row.clientWidth - 8; };
  pv.onclick = () => row.scrollBy({ left: -row.clientWidth * .85, behavior: 'smooth' });
  nx.onclick = () => row.scrollBy({ left: row.clientWidth * .85, behavior: 'smooth' });
  row.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync); sync();
}

function followedHTML() {
  const followed = SHOPS.filter(s => Store.s.follows.includes(s.id));
  return followed.length ? `<div class="shops g">${followed.map(s => shopCard(s, true)).join('')}</div>`
    : `<div class="empty"><div class="ei">${ic('store', 28)}</div><h3>Follow shops to see their new drops here</h3><p>Tap Follow on any shop and its latest arrivals will show up first.</p><button class="btn primary" id="goNear">Browse nearby shops</button></div>`;
}
function bindGoNear() { const g = $('#goNear'); if (g) g.onclick = () => $('#nearby').scrollIntoView({ behavior: 'smooth', block: 'center' }); }

/* Schematic map: distance from you = distance on the map */
function mapHTML() {
  /* farther from the centre = farther from you (rings are 1, 2, 3 and 4.5 km) */
  const cx = 350, cy = 232, k = 1.6, R = 34, rad = km => 46 + km * R * 0.9;
  const rings = [1, 2, 3, 4.5].map(km => `<ellipse cx="${cx}" cy="${cy}" rx="${rad(km) * k}" ry="${rad(km)}" fill="none" stroke="var(--line)" stroke-dasharray="4 6"/><text x="${cx + rad(km) * k + 4}" y="${cy - 4}" font-size="11" fill="var(--muted)">${km} km</text>`).join('');
  const pins = SHOPS.map((sh, i) => {
    const a = (i * 137.5 - 40) * Math.PI / 180, x = cx + rad(sh.km) * k * Math.cos(a), y = cy + rad(sh.km) * Math.sin(a), open = isOpen(sh);
    return `<a href="shop.html?id=${sh.id}" aria-label="${esc(sh.name)}, ${sh.km} km away, ${open ? 'open' : 'closed'}"><g class="pin" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><rect x="-55" y="-18" width="110" height="68" rx="12" fill="transparent"/><circle r="13" fill="${open ? '#FF6B4A' : '#9c97a1'}" stroke="#fff" stroke-width="3"/><path d="M-4 -2h8l-.7 5h-6.6zM-2 -2v-1.2a2 2 0 0 1 4 0V-2" fill="none" stroke="#fff" stroke-width="1.4"/><text y="30" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">${esc(sh.name)}</text><text y="44" text-anchor="middle" font-size="11" fill="var(--muted)">${sh.km} km</text></g></a>`;
  }).join('');
  return `<div class="mapbox"><svg viewBox="0 0 700 480" role="group" aria-label="Map of nearby shops. Shops farther from the centre are farther from your address.">${rings}
    <g transform="translate(${cx} ${cy})" style="pointer-events:none"><circle r="26" fill="#FF6B4A" opacity=".18"/><circle r="11" fill="#17171C" stroke="#fff" stroke-width="3"/><text y="-20" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink)">You</text></g>${pins}</svg>
    <p class="small muted" style="padding:6px 10px 4px"><span class="dot-o"></span>Open &nbsp; <span class="dot-o c"></span>Closed &nbsp;·&nbsp; Farther from the centre means farther from your address. Tap a shop to open it.</p></div>`;
}

/* small header + tabs shared by the sub-pages */
const SUBPAGES = [['categories.html', 'Categories'], ['shops.html', 'Nearby shops'], ['new.html', 'New arrivals'], ['how.html', 'How it works']];
function pageHead(active, title, sub) {
  return `<div class="pagehead"><a class="link" href="index.html">← Home</a><h1>${title}</h1><p class="muted">${sub}</p>
    <nav class="subtabs" aria-label="Browse Zippy">${SUBPAGES.map(t => `<a href="${t[0]}"${t[0] === active ? ' class="on" aria-current="page"' : ''}>${t[1]}</a>`).join('')}</nav></div>`;
}