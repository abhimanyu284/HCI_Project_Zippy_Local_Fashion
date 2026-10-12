/* ============ PRODUCT DETAIL ============ */
Layout('search');

const P = prodById(qs.get('id'));
if (!P) {
  $('#main').innerHTML = `<div class="empty" style="margin-top:40px"><div class="ei">${ic('search', 28)}</div><h3>We couldn’t find that product</h3><p>It may have been removed.</p><a class="btn primary" href="search.html">Browse all styles</a></div>`;
} else initProduct();

function initProduct() {
  const sh = shopById(P.shop);
  let idx = 0, size = SIZES.includes(qs.get('size')) && P.sizes[qs.get('size')] > 0 ? qs.get('size') : '';
  const N = P.imgs.length, status = productStatus(P), open = isOpen(sh);
  const off = P.mrp ? Math.round((1 - P.price / P.mrp) * 100) : 0;
  document.title = `${P.name} · Zippy`;

  $('#main').innerHTML = `
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="search.html?cat=${P.cat}">${catLabel(P.cat)}</a> / ${esc(P.name)}</nav>
  <section class="pgrid">
    <div class="gal">
      <div class="thumbs">${P.imgs.map((s, i) => `<button type="button" data-th="${i}" aria-label="Show photo ${i + 1}">${img(s, '')}</button>`).join('')}</div>
      <div class="stage" id="stage" tabindex="0" aria-roledescription="carousel" aria-label="${esc(P.name)} photos">
        <div class="track" id="track">${P.imgs.map((s, i) => img(s, `${P.name}, photo ${i + 1}`).replace('loading="lazy"', '')).join('')}</div>
        <button type="button" class="arrow l" data-go="-1" aria-label="Previous photo">${ic('chev')}</button>
        <button type="button" class="arrow r" data-go="1" aria-label="Next photo">${ic('chev')}</button>
        <span class="count" id="gcount"></span>
        <span class="zoomhint" id="zhint">${ic('zoom', 14)} Click photo to zoom</span>
        <div class="dots" id="dots">${P.imgs.map((_, i) => `<button type="button" data-dot="${i}" aria-label="Go to photo ${i + 1}"></button>`).join('')}</div>
      </div>
    </div>

    <div class="pinfo">
      <div class="row small" style="gap:10px;flex-wrap:wrap"><a class="row link" href="shop.html?id=${sh.id}" style="gap:6px">${ic('store', 16)}${esc(sh.name)}</a><span class="muted">· ${sh.km} km away</span><span><span class="dot-o ${open ? '' : 'c'}"></span>${openText(sh)}</span></div>
      <h1>${esc(P.name)}</h1>
      <a class="row small" href="#reviews" style="gap:8px">${stars(P.rating)}<b>${P.rating}</b><span class="muted">(${P.count} reviews)</span></a>
      <div class="row" style="margin:16px 0 4px;gap:12px"><span class="big">${fmt(P.price)}</span>${P.mrp ? `<s class="muted">${fmt(P.mrp)}</s><span class="off">${off}% off</span>` : ''}</div>
      <p class="muted small">Inclusive of all taxes. Free delivery on orders above ₹3,000.</p>

      <div class="box" style="margin-top:22px">
        <div class="row between"><b id="szLabel">Select size</b><button type="button" class="link row" id="guideBtn" style="gap:6px">${ic('ruler', 16)} Size guide</button></div>
        <div class="sizes" id="sizes" role="radiogroup" aria-labelledby="szLabel">${SIZES.map(s => { const st = sizeState(P.sizes[s]); return `<button type="button" role="radio" aria-checked="false" class="sz ${st === 'out' ? 'out' : st === 'low' ? 'low' : ''}" data-size="${s}" ${st === 'out' ? 'aria-disabled="true" aria-label="Size ' + s + ' unavailable"' : ''}>${s}</button>`; }).join('')}</div>
        <div class="sizehelp" id="szHelp" aria-live="polite"></div>
      </div>

      <div class="buy">
        <button type="button" class="btn primary" id="addBtn">${ic('bag', 18)} Add to bag</button>
        <button type="button" class="btn dark" id="buyBtn">Buy now</button>
        <button type="button" class="iconbtn favx" data-fav="${P.id}" aria-label="Save to favourites">${ic('heart', 22)}</button>
        <button type="button" class="sharebtn" id="shareBtn" aria-label="Share this product" title="Share">${ic('share', 20)}</button>
      </div>
      <div class="errt" id="szErr" role="alert"></div>

      <div class="perks">
        <div class="perk"><span class="pi">${ic('bolt', 20)}</span><span><b>${sh.km <= 3 ? '10–15 min delivery' : '30–40 min delivery'}</b><br><span class="muted">from ${esc(sh.name)}</span></span></div>
        <div class="perk"><span class="pi">${ic('repeat', 20)}</span><span><b>Free exchange</b><br><span class="muted">within 24 hours</span></span></div>
        <div class="perk"><span class="pi">${ic('shield', 20)}</span><span><b>Checked by the shop</b><br><span class="muted">stock updated live</span></span></div>
        <div class="perk"><span class="pi">${ic('gift', 20)}</span><span><b>Use ZIPPY50</b><br><span class="muted">₹50 off above ₹999</span></span></div>
      </div>
    </div>
  </section>

  <section class="sec" id="reviews"><div class="sec-h"><h2>Ratings &amp; reviews</h2></div><div class="box" id="revBox"></div></section>
  <section class="sec"><div class="sec-h"><h2>More from ${esc(sh.name)}</h2><a class="link" href="shop.html?id=${sh.id}">Visit shop →</a></div><div class="grid s">${PRODUCTS.filter(x => x.shop === P.shop && x.id !== P.id).slice(0, 4).map(x => productCard(x)).join('') || '<p class="muted">No other items yet.</p>'}</div></section>
  <section class="sec"><div class="sec-h"><h2>Same style, other shops</h2><a class="link" href="search.html?cat=${P.cat}">See all ${catLabel(P.cat).toLowerCase()} →</a></div><div class="grid s">${PRODUCTS.filter(x => x.cat === P.cat && x.shop !== P.shop && x.id !== P.id).slice(0, 4).map(x => productCard(x)).join('') || '<p class="muted">Nothing else in this category right now.</p>'}</div></section>`;

  /* ----- gallery ----- */
  const track = $('#track'), stage = $('#stage');
  function go(i) {
    idx = (i + N) % N;
    track.style.transform = `translateX(-${idx * 100}%)`;
    $$('[data-dot]').forEach((d, k) => { d.classList.toggle('on', k === idx); d.setAttribute('aria-current', k === idx); });
    $$('[data-th]').forEach((t, k) => t.classList.toggle('on', k === idx));
    $('#gcount').textContent = `${idx + 1} / ${N}`;
  }
  let dragged = false;
  stage.classList.add('zoomable');
  stage.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { go(idx + +g.dataset.go); return; }
    const d = e.target.closest('[data-dot]'); if (d) { go(+d.dataset.dot); return; }
    if (dragged) { dragged = false; return; }
    const z = stage.classList.toggle('zoomed'); stage.classList.toggle('zoomable', !z);
    $('#zhint').style.display = z ? 'none' : '';
  });
  stage.addEventListener('mousemove', e => {
    if (!stage.classList.contains('zoomed')) return;
    const r = stage.getBoundingClientRect();
    stage.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%'); stage.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
  });
  stage.addEventListener('mouseleave', () => { stage.classList.remove('zoomed'); stage.classList.add('zoomable'); $('#zhint').style.display = ''; });
  $$('[data-th]').forEach(t => t.onclick = () => go(+t.dataset.th));
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(idx - 1); if (e.key === 'ArrowRight') go(idx + 1); });
  let x0 = null;
  stage.addEventListener('pointerdown', e => { dragged = false; if (!e.target.closest('button')) x0 = e.clientX; });
  window.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { dragged = true; stage.classList.remove('zoomed'); go(idx + (dx < 0 ? 1 : -1)); } });
  go(0);

  /* ----- sizes ----- */
  function paintSizes() {
    $$('.sz').forEach(b => { const on = b.dataset.size === size; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const outs = SIZES.filter(s => P.sizes[s] <= 0);
    const q = size ? P.sizes[size] : 0;
    $('#szHelp').innerHTML = size
      ? `${q <= 2 ? `<b style="color:var(--amber-d)">Only ${q} left</b> in ${size}` : `${size} in stock`} at ${esc(sh.name)}${outs.length ? ` · ${outs.join(', ')} unavailable` : ''}`
      : `Pick a size to see if it’s in stock at ${esc(sh.name)}${outs.length ? ` · ${outs.join(', ')} unavailable here` : ''}`;
  }
  $('#sizes').addEventListener('click', e => {
    const b = e.target.closest('.sz'); if (!b) return;
    const s = b.dataset.size;
    if (P.sizes[s] <= 0) { openOutOfStock(s); return; }
    size = s; $('#szErr').textContent = ''; paintSizes();
  });
  paintSizes();

  /* ----- out-of-stock size: offer a stock alert or a nearby shop that has it ----- */
  function openOutOfStock(s) {
    const key = `${P.id}|${s}`, has = () => Store.s.stockAlerts.includes(key);
    const nearby = PRODUCTS.filter(x => x.cat === P.cat && x.id !== P.id && x.sizes[s] > 0).length;
    const m = openModal(`<h2>Size ${s} isn’t available here</h2><p class="muted" style="margin-bottom:6px">${esc(sh.name)} has run out of size ${s} for ${esc(P.name)}.</p>
      <p class="small muted">${nearby ? `${nearby} similar ${catLabel(P.cat).toLowerCase()} in size ${s} ${nearby === 1 ? 'is' : 'are'} in stock at other shops.` : 'No similar styles in this size right now.'}</p>
      <div class="mact" style="flex-direction:column"><button type="button" class="btn ${has() ? 'ghost' : 'primary'}" id="alertBtn">${has() ? ic('check', 16) + ' Alert on · tap to turn off' : ic('bell', 16) + ' Notify me when it’s back'}</button>
      ${nearby ? `<a class="btn dark" href="search.html?cat=${P.cat}&size=${s}">Find size ${s} nearby</a>` : ''}<button type="button" class="btn ghost" data-close>Close</button></div>`);
    m.querySelector('#alertBtn').onclick = () => {
      const on = has();
      Store.update(st => { st.stockAlerts = on ? st.stockAlerts.filter(x => x !== key) : [...st.stockAlerts, key]; });
      closeModal(); toast(on ? 'Alert removed' : `We’ll let you know when size ${s} is back`, on ? null : { label: 'Manage', href: 'profile.html#alerts' });
    };
  }

  /* ----- share ----- */
  $('#shareBtn').onclick = async () => {
    const url = location.href, data = { title: P.name, text: `${P.name} at ${sh.name} · ${fmt(P.price)} on Zippy`, url };
    try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast('Link copied'); }
    catch (e) { const m = openModal(`<h2>Share this style</h2><p class="muted small" style="margin-bottom:12px">Copy the link below.</p><input class="inp" id="shUrl" value="${esc(url)}" readonly autofocus><div class="mact"><button type="button" class="btn dark" data-close>Done</button></div>`); const i = m.querySelector('#shUrl'); i.select(); }
  };

  /* ----- size guide ----- */
  const CHART = [['S', '86–91', '71–76', '165–170'], ['M', '94–99', '79–84', '170–175'], ['L', '102–107', '87–92', '175–180'], ['XL', '110–115', '95–100', '180–188']];
  $('#guideBtn').onclick = () => {
    const m = openModal(`<h2>Size guide</h2><p class="muted small" style="margin-bottom:14px">Measurements in cm.</p>
      <table class="tbl"><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Height</th></tr>${CHART.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table>
      <h3 style="font-size:18px;margin:22px 0 10px">Which size am I?</h3>
      <div class="two"><input class="inp" id="gh" type="number" placeholder="Height (cm)" aria-label="Height in cm"><input class="inp" id="gw" type="number" placeholder="Weight (kg)" aria-label="Weight in kg"></div>
      <div class="errt" id="gerr"></div><div id="gres" class="small" style="margin-top:10px" aria-live="polite"></div>
      <div class="mact"><button type="button" class="btn primary" id="gcalc">Suggest my size</button></div>`);
    m.querySelector('#gcalc').onclick = () => {
      const h = +m.querySelector('#gh').value, w = +m.querySelector('#gw').value;
      const err = m.querySelector('#gerr');
      if (h < 120 || h > 220 || w < 30 || w > 160) { err.textContent = 'Enter a height of 120–220 cm and a weight of 30–160 kg.'; return; }
      err.textContent = '';
      let i = w < 56 ? 0 : w < 70 ? 1 : w < 84 ? 2 : 3;
      if (h > 180) i = Math.min(3, i + 1);
      const s = SIZES[i], ok = P.sizes[s] > 0;
      m.querySelector('#gres').innerHTML = `We suggest <b>${s}</b>. ${ok ? `It’s in stock here. <button type="button" class="link" id="useS">Select ${s}</button>` : `It isn’t available at ${esc(sh.name)}, <a class="link" href="search.html?cat=${P.cat}&size=${s}">find ${s} nearby</a>.`}`;
      const u = m.querySelector('#useS'); if (u) u.onclick = () => { size = s; paintSizes(); closeModal(); };
    };
  };

  /* ----- buy ----- */
  const addBtn = $('#addBtn'), buyBtn = $('#buyBtn');
  if (status === 'out' || !open) {
    [addBtn, buyBtn].forEach(b => { b.disabled = true; });
    addBtn.textContent = status === 'out' ? 'Sold out' : `Closed · opens ${hour12(sh.from)}`;
  }
  async function buy(now) {
    if (!size) {
      $('#szErr').textContent = 'Please select a size first.';
      const row = $('#sizes'); row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      $$('.sz', row).forEach(b => { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); });
      return;
    }
    const ok = await addToCart(P.id, size);
    if (ok && now) location.href = 'cart.html';
  }
  addBtn.onclick = () => buy(false);
  buyBtn.onclick = () => buy(true);

  /* ----- reviews ----- */
  let showAll = false;
  function paintReviews() {
    const rs = allReviews(P), shown = showAll ? rs : rs.slice(0, 3);
    const pct = k => Math.round(rs.filter(r => r.fit === k).length / rs.length * 100);
    $('#revBox').innerHTML = `<div class="revsum"><div><div class="avg">${P.rating}</div>${stars(P.rating, 20)}<div class="muted small" style="margin-top:6px">${P.count + (Store.s.userReviews[P.id] || []).length} reviews</div></div>
      <div><b class="small">How does it fit?</b>${[['Runs small', 'small'], ['True to size', 'true'], ['Runs large', 'large']].map(f => `<div class="bar"><span>${f[0]}</span><i><b style="width:${pct(f[1])}%"></b></i><span style="width:40px;text-align:right">${pct(f[1])}%</span></div>`).join('')}</div></div>
      <div style="margin-top:18px">${shown.map(r => { const n = 3 + (r.id.length * 7) % 9 + (Store.s.helpful[r.id] ? 1 : 0), on = !!Store.s.helpful[r.id]; return `<div class="rev"><div class="row"><span class="av">${esc(r.name[0])}</span><div><b>${esc(r.name)}</b><div class="row" style="gap:8px">${stars(r.stars, 13)}<span class="tiny muted">${r.days ? r.days + ' days ago' : 'Just now'}</span></div></div></div><p style="margin:10px 0">${esc(r.text)}</p><button type="button" class="helpful ${on ? 'on' : ''}" data-help="${r.id}" aria-pressed="${on}">${ic('thumb', 14)} Helpful (${n})</button></div>`; }).join('')}</div>
      ${rs.length > 3 ? `<button type="button" class="btn ghost sm" id="moreRev" style="margin-top:8px">${showAll ? 'Show fewer reviews' : `Show all ${rs.length} reviews`}</button>` : ''}`;
  }
  $('#revBox').addEventListener('click', e => {
    if (e.target.closest('#moreRev')) { showAll = !showAll; paintReviews(); return; }
    const h = e.target.closest('[data-help]');
    if (h) { Store.update(s => { s.helpful[h.dataset.help] ? delete s.helpful[h.dataset.help] : (s.helpful[h.dataset.help] = 1); }); paintReviews(); }
  });
  paintReviews();

  /* remember it for "Recently viewed" on the home page */
  Store.update(st => { st.viewed = [P.id, ...st.viewed.filter(x => x !== P.id)].slice(0, 8); });
}