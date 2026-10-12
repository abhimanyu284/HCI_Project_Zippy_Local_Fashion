/* ============ NEARBY SHOPS PAGE ============ */
Layout('home');
const near = [...SHOPS].sort((a, b) => a.km - b.km);
const listHTML = () => `<div class="shops g" id="nearby">${near.map(s => shopCard(s)).join('')}</div>`;
$('#main').innerHTML = `<section class="sec" style="padding-top:28px">${pageHead('shops.html', 'Nearby shops', 'Sorted by distance from ' + esc(activeAddress().label.toLowerCase()) + '.')}
  <div class="row between" style="margin-bottom:18px"><h2 style="font-size:24px">All shops</h2>
    <div class="seg view" role="radiogroup" aria-label="Nearby shops view" style="margin:0"><button type="button" role="radio" aria-checked="true" class="on" data-view="list">${ic('list', 15)} List</button><button type="button" role="radio" aria-checked="false" data-view="map">${ic('map', 15)} Map</button></div></div>
  <div id="nearWrap">${listHTML()}</div></section>
  <section class="sec"><div class="sec-h"><h2>Shops you follow</h2></div><div id="followWrap">${followedHTML()}</div></section>`;
bindGoNear();
$$('[data-view]').forEach(b => b.onclick = () => {
  const map = b.dataset.view === 'map';
  $$('[data-view]').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
  $('#nearWrap').innerHTML = map ? mapHTML() : listHTML();
  syncButtons();
});
let lastFollows = Store.s.follows.join();
window.addEventListener('zippy:change', () => {
  if (Store.s.follows.join() !== lastFollows) {
    lastFollows = Store.s.follows.join();
    $('#followWrap').innerHTML = followedHTML(); bindGoNear(); syncButtons();
  }
});