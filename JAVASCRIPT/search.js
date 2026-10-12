/* ============ SEARCH + FILTERS ============ */
Layout('search');

const list = k => (qs.get(k) || '').split(',').filter(Boolean);
const F = {
  q: qs.get('q') || '', aud: AUDIENCES.some(a => a.id === qs.get('aud')) ? qs.get('aud') : '', cat: qs.get('cat') || '', size: list('size'), min: qs.get('min') || '', max: qs.get('max') || '',
  type: list('type'), dist: qs.get('dist') || '', sort: qs.get('sort') || 'near', stock: qs.get('stock') === '1'
};
if (F.q) addRecent(F.q);

const priceBad = () => F.min !== '' && F.max !== '' && +F.min > +F.max;
const DIST = [['', 'Any distance'], ['0.5', 'Within 0.5 km'], ['1', 'Within 1 km'], ['2', 'Within 2 km'], ['5', 'Within 5 km']];
const PRESETS = [['0', '1000', 'Under ₹1,000'], ['1000', '3000', '₹1,000 – ₹3,000'], ['3000', '', '₹3,000 +']];

function filtered() {
  const out = PRODUCTS.filter(p => {
    const sh = shopById(p.shop);
    if (!matchesQuery(p, F.q)) return false;
    if (F.aud && !(p.aud || []).includes(F.aud)) return false;
    if (F.cat && p.cat !== F.cat) return false;
    if (F.size.length && !F.size.some(s => p.sizes[s] > 0)) return false;
    if (!priceBad()) { if (F.min !== '' && p.price < +F.min) return false; if (F.max !== '' && p.price > +F.max) return false; }
    if (F.type.length && !F.type.includes(sh.type)) return false;
    if (F.dist && sh.km > +F.dist) return false;
    if (F.stock && productStatus(p) === 'out') return false;
    return true;
  });
  const km = p => shopById(p.shop).km;
  const by = { near: (a, b) => km(a) - km(b) || a.price - b.price, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rated: (a, b) => b.rating - a.rating, new: (a, b) => a.daysAgo - b.daysAgo };
  return out.sort(by[F.sort] || by.near);
}

function filtersHTML() {
  const pill = (k, v, label, type = 'checkbox') => `<label class="pill"><input type="${type}" name="${k}" data-f="${k}" value="${v}"><span>${label}</span></label>`;
  return `
  <div class="row between"><b style="font-family:var(--display);font-size:20px">Filters</b><button type="button" class="link" data-clearall>Reset all</button></div>
  <div class="fgroup"><h4>Shop for</h4><div class="pills">${pill('aud', '', 'Everyone', 'radio')}${AUDIENCES.map(a => pill('aud', a.id, a.label, 'radio')).join('')}</div></div>
  <div class="fgroup"><h4>Category</h4><div class="pills">${pill('cat', '', 'All', 'radio')}${CATEGORIES.map(c => pill('cat', c.id, c.label, 'radio')).join('')}</div></div>
  <div class="fgroup"><h4>Size (in stock)</h4><div class="pills">${SIZES.map(s => pill('size', s, s)).join('')}</div></div>
  <div class="fgroup"><h4>Price</h4><div class="two"><input class="inp" type="number" min="0" step="100" placeholder="Min ₹" aria-label="Minimum price" data-f="min"><input class="inp" type="number" min="0" step="100" placeholder="Max ₹" aria-label="Maximum price" data-f="max"></div>
    <div class="errt" data-perr></div><div class="pills" style="margin-top:10px">${PRESETS.map(p => `<button type="button" class="chip" data-preset="${p[0]}-${p[1]}">${p[2]}</button>`).join('')}</div></div>
  <div class="fgroup"><h4>Shop type</h4><div class="pills">${SHOP_TYPES.map(t => pill('type', t, t)).join('')}</div></div>
  <div class="fgroup"><h4>Distance</h4>${DIST.map(d => `<label class="radio"><input type="radio" name="dist" data-f="dist" value="${d[0]}">${d[1]}</label>`).join('')}</div>
  <div class="fgroup"><label class="row between" style="cursor:pointer"><span><b class="small">Hide sold-out items</b></span><span class="switch"><input type="checkbox" data-f="stock"><i></i></span></label></div>`;
}

/* push the current filter state into every filter control that is on screen */
function syncFilters() {
  $$('[data-f]').forEach(el => {
    const k = el.dataset.f;
    if (k === 'size' || k === 'type') el.checked = F[k].includes(el.value);
    else if (k === 'aud' || k === 'cat' || k === 'dist') el.checked = F[k] === el.value;
    else if (k === 'stock') el.checked = F.stock;
    else if (document.activeElement !== el) el.value = F[k];
  });
  $$('[data-perr]').forEach(e => { e.textContent = priceBad() ? 'Minimum price can’t be higher than the maximum.' : ''; });
  $$('[data-f=min],[data-f=max]').forEach(e => e.classList.toggle('err', priceBad()));
}

function activeChips() {
  const c = [];
  if (F.q) c.push(['q', `“${F.q}”`]);
  if (F.aud) c.push(['aud', audLabel(F.aud)]);
  if (F.cat) c.push(['cat', catLabel(F.cat)]);
  F.size.forEach(s => c.push(['size:' + s, 'Size ' + s]));
  if ((F.min !== '' || F.max !== '') && !priceBad()) c.push(['price', `${F.min !== '' ? fmt(F.min) : '₹0'} – ${F.max !== '' ? fmt(F.max) : 'any'}`]);
  F.type.forEach(t => c.push(['type:' + t, t]));
  if (F.dist) c.push(['dist', `≤ ${F.dist} km`]);
  if (F.stock) c.push(['stock', 'In stock only']);
  return c;
}

let token = 0;
function apply(instant) {
  syncFilters();
  const p = new URLSearchParams();
  if (F.q) p.set('q', F.q); if (F.aud) p.set('aud', F.aud); if (F.cat) p.set('cat', F.cat); if (F.size.length) p.set('size', F.size.join(','));
  if (F.min !== '') p.set('min', F.min); if (F.max !== '') p.set('max', F.max); if (F.type.length) p.set('type', F.type.join(','));
  if (F.dist) p.set('dist', F.dist); if (F.sort !== 'near') p.set('sort', F.sort); if (F.stock) p.set('stock', '1');
  history.replaceState(null, '', 'search.html' + (p.toString() ? '?' + p : ''));

  const chips = activeChips();
  $('#active').innerHTML = chips.length ? chips.map(c => `<button type="button" class="chip on" data-rm="${esc(c[0])}" aria-label="Remove filter ${esc(c[1])}">${esc(c[1])} <span class="x">${ic('x', 13)}</span></button>`).join('') + '<button type="button" class="link" data-clearall style="margin-left:6px">Clear all</button>' : '';
  const nf = chips.filter(c => c[0] !== 'q').length;
  $('#fcount').textContent = nf ? nf : '';
  $('#sTitle').textContent = F.q ? `Results for “${F.q}”` : F.aud && F.cat ? `${audLabel(F.aud)} · ${catLabel(F.cat)}` : F.aud ? `${AUD_POSS[F.aud]} styles near you` : F.cat ? catLabel(F.cat) : 'All styles near you';

  const res = filtered(), my = ++token;
  const draw = () => {
    if (my !== token) return;
    $('#sCount').textContent = `${res.length} ${res.length === 1 ? 'result' : 'results'} from ${new Set(res.map(r => r.shop)).size} nearby ${new Set(res.map(r => r.shop)).size === 1 ? 'shop' : 'shops'}`;
    $('#res').innerHTML = res.length
      ? res.map(pr => productCard(pr, F.size.length ? `Size ${F.size.filter(s => pr.sizes[s] > 0).join(', ')} available` : '')).join('')
      : `<div class="empty" style="grid-column:1/-1"><div class="ei">${ic('search', 28)}</div><h3>No ${F.q ? 'matches for “' + esc(F.q) + '”' : 'styles'} with these filters</h3><p>Try a wider distance, a different size, or clear a filter.</p><div class="row" style="justify-content:center;gap:10px"><button class="btn primary" data-clearall>Clear filters</button><a class="btn ghost" href="index.html">Browse shops</a></div></div>`;
    $('#dcount') && ($('#dcount').textContent = res.length);
    syncButtons();
  };
  if (instant) draw(); else { $('#res').innerHTML = skeleton(Math.min(res.length || 4, 8)); setTimeout(draw, 220); }
}

function render() {
  $('#main').innerHTML = `
  <div class="page-h"><h1 id="sTitle"></h1><p class="muted" id="sCount" aria-live="polite"></p></div>
  <div class="sgrid">
    <aside class="filters side" id="sideF" aria-label="Filters">${filtersHTML()}</aside>
    <section>
      <div class="toolbar">
        <button type="button" class="btn ghost sm mfilter" id="openF">${ic('filter', 16)} Filters <b id="fcount" style="color:var(--coral-d)"></b></button>
        <div class="row" style="margin-left:auto"><label class="small muted" for="sort">Sort by</label>
          <select class="sel" id="sort">${[['near', 'Nearest first'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['rated', 'Top rated'], ['new', 'Newest']].map(o => `<option value="${o[0]}" ${F.sort === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>
      </div>
      <div id="active" class="chips" style="margin-bottom:18px"></div>
      ${!F.q && !F.cat && !F.aud ? `<div class="chips" style="margin-bottom:20px"><span class="small muted" style="align-self:center">Trending:</span>${TRENDING.map(t => `<a class="chip" href="search.html?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div>` : ''}
      <div class="grid" id="res"></div>
    </section></div>`;
  syncFilters(); apply();
}

/* ---------- events ---------- */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-f]'); if (!el) return;
  const k = el.dataset.f;
  if (k === 'size' || k === 'type') F[k] = el.checked ? [...new Set([...F[k], el.value])] : F[k].filter(x => x !== el.value);
  else if (k === 'aud' || k === 'cat' || k === 'dist') F[k] = el.value;
  else if (k === 'stock') F.stock = el.checked;
  else F[k] = el.value.trim() === '' ? '' : String(Math.max(0, parseInt(el.value, 10) || 0));
  apply();
});
document.addEventListener('click', e => {
  const pre = e.target.closest('[data-preset]');
  if (pre) { const [a, b] = pre.dataset.preset.split('-'); F.min = a; F.max = b; apply(); return; }
  if (e.target.closest('[data-clearall]')) { Object.assign(F, { aud: '', cat: '', size: [], min: '', max: '', type: [], dist: '', stock: false }); apply(); return; }
  const rm = e.target.closest('[data-rm]');
  if (rm) {
    const [k, v] = rm.dataset.rm.split(':');
    if (k === 'q') F.q = ''; else if (k === 'aud') F.aud = ''; else if (k === 'cat') F.cat = ''; else if (k === 'size') F.size = F.size.filter(x => x !== v);
    else if (k === 'type') F.type = F.type.filter(x => x !== v); else if (k === 'price') { F.min = ''; F.max = ''; }
    else if (k === 'dist') F.dist = ''; else if (k === 'stock') F.stock = false;
    apply(); return;
  }
  if (e.target.closest('#openF')) {
    const m = openModal(`<div id="drawerF">${filtersHTML()}</div><div class="mact"><button type="button" class="btn primary" data-close>Show <span id="dcount">${filtered().length}</span> results</button></div>`, { drawer: true });
    syncFilters(); m.querySelector('.mx').style.display = 'none';
  }
});
document.addEventListener('change', e => { if (e.target.id === 'sort') { F.sort = e.target.value; apply(true); } });

render();