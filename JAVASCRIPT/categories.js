/* ============ CATEGORIES PAGE ============ */
Layout('home');
let audSel = qs.get('aud') || '';
function drawCats() {
  $('#main').innerHTML = `<section class="sec" style="padding-top:28px">${pageHead('categories.html', 'Shop by category', 'Pick a type of clothing to see what is in stock near you.')}
    <div class="audtabs" role="radiogroup" aria-label="Shop for">${[['', 'Everyone'], ...AUDIENCES.map(a => [a.id, a.label])].map(t => `<button type="button" role="radio" aria-checked="${audSel === t[0]}" class="${audSel === t[0] ? 'on' : ''}" data-aud="${t[0]}">${t[1]}</button>`).join('')}</div>
    <div class="cats big">${catTiles()}</div>
    <p style="margin-top:28px"><a class="btn primary" href="search.html${audSel ? '?aud=' + audSel : ''}">Browse all ${audSel ? AUD_POSS[audSel] + ' ' : ''}styles</a></p></section>`;
  if (audSel) {
    const ok = new Set(catsFor(audSel).map(c => c.id));
    $$('.cat').forEach(a => {
      const id = new URL(a.href, location.href).searchParams.get('cat');
      if (!ok.has(id)) a.remove(); else a.href += '&aud=' + audSel;
    });
  }
  dedupeCats();
  $$('[data-aud]').forEach(b => b.onclick = () => { audSel = b.dataset.aud; history.replaceState(null, '', 'categories.html' + (audSel ? '?aud=' + audSel : '')); drawCats(); const t = $(`[data-aud="${audSel}"]`); if (t) t.focus(); });
}
drawCats();