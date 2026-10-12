/* ============ HOME ============ */
Layout('home');

function renderHome() {
  const pic = (cat, i = 0) => IMG(PHOTOS[cat][i], 700);
  const n = Store.s.orders.filter(o => !o.cancelled && !orderState(o).done)[0];
  const fresh = PRODUCTS.filter(p => p.daysAgo <= 7).length;
  /* four big doors to the rest of the site, so the home page stays short */
  const doors = [
    ['categories.html', 'Shop by category', CATEGORIES.length + ' categories, from blazers to lehengas', pic('kurta', 1), 'search'],
    ['shops.html', 'Nearby shops', SHOPS.length + ' shops around you, as a list or on a map', pic('dress', 2), 'pin'],
    ['new.html', 'New arrivals', fresh + ' new styles this week', pic('jacket', 1), 'bolt'],
    ['how.html', 'How Zippy works', 'Three steps and a free exchange', pic('top', 0), 'truck']
  ];

  $('#main').innerHTML = `
  <section class="hero">
    <div>
      <span class="eyebrow">${ic('bolt', 15)} 10–15 min delivery from shops near you</span>
      <h1>Your neighbourhood's best wardrobe, <mark>delivered</mark> before your coffee cools.</h1>
      <p class="lead">See what is actually in stock at boutiques around you, pick your size, and get it at your door in minutes. Free exchange if it doesn't fit.</p>
      <div class="chips" style="margin-top:22px">${TRENDING.map(t => `<a class="chip" href="search.html?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div>
      <div class="stats"><div><b>${SHOPS.length}</b><span>shops nearby</span></div><div><b>${PRODUCTS.length}+</b><span>styles in stock</span></div><div><b>12 min</b><span>average delivery</span></div></div>
    </div>
    <div class="collage" aria-hidden="true">
      <div class="ph">${img(pic('blazer'), '')}</div><div class="ph">${img(pic('dress'), '')}</div><div class="ph">${img(pic('jacket'), '')}</div>
      <div class="float f1"><span class="dot" style="background:var(--mint);color:var(--mint-d)">${ic('check', 20)}</span><span><b>In stock · size M</b>Nova Boutique · 0.4 km</span></div>
      <div class="float f2"><span class="dot" style="background:var(--peach);color:var(--coral-d)">${ic('truck', 20)}</span><span><b>Arriving in 12 min</b>Rider on the way</span></div>
    </div>
  </section>

  ${n ? `<a class="box row between reveal" href="tracking.html?id=${n.id}" style="margin-top:26px"><span class="row">${ic('truck', 22)}<b>Your order ${n.id} is in progress</b></span><span class="link">Track order →</span></a>` : ''}

  <section class="sec reveal"><div class="sec-h"><div><h2>Shop for</h2><p class="muted small">Start with who you are shopping for.</p></div><a class="link" href="search.html">All styles →</a></div>
    <div class="aud3">${AUDIENCES.map(a => `<a class="audcard" href="search.html?aud=${a.id}" aria-label="Shop ${a.label}">${img(pic(a.photo, a.id === 'kids' ? 1 : 2), '')}<div class="in"><div><h3>${a.label}</h3><p>${a.n} styles · ${a.tag}</p></div><span class="go" aria-hidden="true">→</span></div></a>`).join('')}</div></section>

  <section class="sec reveal"><div class="sec-h"><div><h2>Where to?</h2><p class="muted small">Pick what you want to do first.</p></div></div>
    <div class="doors">${doors.map(d => `<a class="door" href="${d[0]}"><div class="door-img">${img(d[3], '')}</div><div class="door-t"><span class="door-i" aria-hidden="true">${ic(d[4], 18)}</span><b>${d[1]}</b><span class="muted small">${d[2]}</span></div><span class="door-go" aria-hidden="true">→</span></a>`).join('')}</div></section>

  <section class="promise reveal"><div><h2>Wrong size? Exchange it free within 24 hours.</h2><p>No questions about fit, no return trips. Our rider picks up the old size when delivering the new one.</p></div><button class="btn primary" data-policy>Read the exchange policy</button></section>`;

  reveal();
}
renderHome();

/* first visit: short guided tour (can be reopened from the footer) */
if (!Store.s.toured) setTimeout(() => { if (!document.querySelector('.overlay')) startTour(); }, 900);