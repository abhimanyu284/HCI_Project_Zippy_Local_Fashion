/* ============ FAVOURITES ============ */
Layout('fav');

let tab = qs.get('tab') === 'shops' ? 'shops' : 'products';

function render() {
  const prods = Store.s.favP.map(prodById).filter(Boolean);
  const shops = SHOPS.filter(s => Store.s.follows.includes(s.id));
  $('#main').innerHTML = `
  <div class="page-h"><h1>Your favourites</h1><p class="muted">Saved styles and the shops you follow.</p></div>
  <div class="tabs" role="tablist" style="margin-top:0">
    <button type="button" role="tab" class="chip ${tab === 'products' ? 'on' : ''}" data-tab="products" aria-selected="${tab === 'products'}">Saved styles (${prods.length})</button>
    <button type="button" role="tab" class="chip ${tab === 'shops' ? 'on' : ''}" data-tab="shops" aria-selected="${tab === 'shops'}">Following (${shops.length})</button></div>
  ${tab === 'products'
      ? (prods.length ? `<div class="grid">${prods.map(p => productCard(p)).join('')}</div>`
        : `<div class="empty"><div class="ei">${ic('heart', 28)}</div><h3>No saved styles yet</h3><p>Tap the heart on any product to keep it here.</p><a class="btn primary" href="search.html">Browse styles</a></div>`)
      : (shops.length ? `<div class="shops g">${shops.map(s => shopCard(s, true)).join('')}</div>`
        : `<div class="empty"><div class="ei">${ic('store', 28)}</div><h3>You aren’t following any shops</h3><p>Follow your favourite boutiques to see their new drops first.</p><a class="btn primary" href="index.html">Browse nearby shops</a></div>`)}`;
  $$('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); });
}
window.addEventListener('zippy:change', render);
render();