/* ============ SHOP PROFILE ============ */
Layout('search');

const S = shopById(qs.get('id'));
if (!S) {
  $('#main').innerHTML = `<div class="empty" style="margin-top:40px"><div class="ei">${ic('store', 28)}</div><h3>We couldn’t find that shop</h3><a class="btn primary" href="index.html">Back to home</a></div>`;
} else {
  document.title = `${S.name} · Zippy`;
  let tab = 'all';
  const TABS = [['all', 'All items'], ['new', 'New arrivals'], ['under', 'Under ₹1,500']];
  const items = () => PRODUCTS.filter(p => p.shop === S.id).filter(p => tab === 'new' ? p.daysAgo <= 7 : tab === 'under' ? p.price < 1500 : true);
  const followers = () => (S.followers + (Store.s.follows.includes(S.id) ? 1 : 0)).toLocaleString('en-IN');

  $('#main').innerHTML = `
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / ${esc(S.name)}</nav>
  <div class="cover">${img(S.img, S.name)}
    <div class="in"><div><span class="tag" style="background:#fff;color:var(--ink)">${S.type}</span><h1 style="margin-top:10px">${esc(S.name)}</h1>
      <div class="row small" style="gap:16px;margin-top:8px;flex-wrap:wrap"><span class="row" style="gap:4px">${ic('star', 15, 'on')}${S.rating} (${S.count})</span><span>${S.km} km away</span><span><span class="dot-o ${isOpen(S) ? '' : 'c'}"></span>${openText(S)}</span></div></div>
      <span id="followSlot">${followBtn(S.id)}</span></div></div>

  <div class="tabs" role="tablist" aria-label="Shop sections">${TABS.map(t => `<button type="button" role="tab" class="chip ${t[0] === tab ? 'on' : ''}" data-tab="${t[0]}" aria-selected="${t[0] === tab}">${t[1]}</button>`).join('')}</div>
  <div class="pgrid2">
    <div><div class="grid s" id="shopGrid" role="tabpanel"></div></div>
    <aside class="box stack"><h3 style="font-size:20px">About ${esc(S.name)}</h3><p class="muted">${esc(S.about)}</p>
      <div class="row small" style="gap:10px">${ic('pin', 16)}${esc(S.area)}</div>
      <div class="row small" style="gap:10px">${ic('clock', 16)}${hour12(S.from)} – ${hour12(S.to)}, every day</div>
      <div class="row small" style="gap:10px">${ic('heart', 16)}<span><b id="fcnt">${followers()}</b> followers</span></div>
      <button type="button" class="btn ghost block" id="dirBtn">${ic('pin', 16)} Get directions</button></aside>
  </div>`;

  const paintGrid = () => {
    const list = items();
    $('#shopGrid').innerHTML = list.length ? list.map(p => productCard(p)).join('') : `<div class="empty" style="grid-column:1/-1"><div class="ei">${ic('bag', 28)}</div><h3>Nothing here yet</h3><p>Try another tab.</p></div>`;
    $$('[data-tab]').forEach(b => { const on = b.dataset.tab === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  };
  $$('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; paintGrid(); });
  $('#dirBtn').onclick = () => {
    const m = openModal(`<h2>Directions</h2><p class="muted" style="margin-bottom:14px">${esc(S.name)}, ${esc(S.area)}</p><p class="small">${S.km} km from your delivery address. You can also have it delivered in minutes.</p>
      <div class="mact"><button type="button" class="btn ghost" data-close>Close</button><a class="btn primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.name + ' ' + S.area)}">Open in Maps</a></div>`);
  };
  window.addEventListener('zippy:change', () => { $('#fcnt').textContent = followers(); });
  paintGrid();
}