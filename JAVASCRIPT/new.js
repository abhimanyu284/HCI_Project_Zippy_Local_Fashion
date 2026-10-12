/* ============ NEW ARRIVALS PAGE ============ */
Layout('home');
function renderNew() {
  const fresh = PRODUCTS.filter(p => p.daysAgo <= 7).sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 16);
  const viewed = Store.s.viewed.map(prodById).filter(Boolean);
  $('#main').innerHTML = `<section class="sec" style="padding-top:28px">${pageHead('new.html', 'New arrivals', 'Styles that reached shops near you in the last 7 days.')}
    <div class="grid">${fresh.map(p => productCard(p)).join('')}</div>
    <p style="margin-top:24px"><a class="link" href="search.html?sort=new">See all new styles, newest first →</a></p></section>
    ${viewed.length ? `<section class="sec" id="viewedSec"><div class="sec-h"><div><h2>Recently viewed</h2><p class="muted small">Pick up where you left off</p></div><button type="button" class="link" id="clearViewed">Clear</button></div>
      <div class="grid s">${viewed.slice(0, 4).map(p => productCard(p)).join('')}</div></section>` : ''}`;
  syncButtons();
  const cv = $('#clearViewed');
  if (cv) cv.onclick = () => {
    const old = [...Store.s.viewed];
    Store.update(s => { s.viewed = []; }); $('#viewedSec').remove();
    toast('Cleared recently viewed', { label: 'Undo', onClick: () => { Store.update(s => { s.viewed = old; }); renderNew(); } });
  };
}
renderNew();