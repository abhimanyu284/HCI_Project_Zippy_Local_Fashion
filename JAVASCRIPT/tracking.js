/* ============ ORDER TRACKING ============ */
Layout('me');

const getO = () => Store.s.orders.find(o => o.id === qs.get('id'));
let O = getO();
if (!O) {
  $('#main').innerHTML = `<div class="empty" style="margin-top:40px"><div class="ei">${ic('truck', 28)}</div><h3>We couldn’t find that order</h3><p>Orders you place show up here and in your profile.</p><a class="btn primary" href="search.html">Start shopping</a></div>`;
} else initTracking();

function initTracking() {
  const sh = shopById(O.shop), rider = RIDERS[O.rider % RIDERS.length];
  const SUB = ['The shop has accepted your order', 'The shop is packing your order', 'Your rider is on the way', 'Enjoy your new outfit!'];

  $('#main').innerHTML = `
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="profile.html">Orders</a> / ${O.id}</nav>
  <div class="page-h"><h1>Order ${O.id}</h1><p class="muted">${esc(sh.name)} · placed at ${timeStr(O.createdAt)} · ${O.slot === 'quick' ? 'Quick delivery' : 'Standard delivery'}</p></div>
  <div class="tgrid">
    <div class="stack">
      <div class="map" id="mapBox">
        <span class="live"><i></i><span id="liveTxt">Live</span></span>
        <svg viewBox="0 0 640 360" role="img" aria-label="Map showing the delivery route from ${esc(sh.name)} to your address">
          <rect width="640" height="360" fill="#F4EEE8"/>
          <rect x="100" y="20" width="80" height="60" rx="16" fill="#E2EFDF"/><rect x="450" y="220" width="150" height="90" rx="18" fill="#E2EFDF"/>
          <rect x="230" y="230" width="150" height="60" rx="14" fill="#E8E2F7"/><rect x="470" y="20" width="110" height="50" rx="14" fill="#F9E4DA"/>
          <g stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none"><path d="M0 100H640M0 200H640M0 300H640M80 0V360M200 0V360M420 0V360M560 0V360"/></g>
          <path id="route" d="M80 300V200H420V100H560" fill="none" stroke="#D9CFC8" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 11"/>
          <path id="routeDone" d="M80 300V200H420V100H560" fill="none" stroke="#FF6B4A" stroke-width="6" stroke-linecap="round"/>
          <g transform="translate(80 300)"><circle r="15" fill="#17171C"/><path d="M-6 -3h12l-1 8h-10zM-3 -3v-2a3 3 0 0 1 6 0v2" fill="none" stroke="#fff" stroke-width="1.8"/><rect x="-46" y="20" width="92" height="22" rx="11" fill="#fff"/><text x="0" y="35" text-anchor="middle" font-size="11" font-weight="700" fill="#17171C">${esc(sh.name.length > 13 ? sh.name.slice(0, 12) + '…' : sh.name)}</text></g>
          <g transform="translate(560 100)"><circle r="15" fill="#FF6B4A"/><circle r="5" fill="#fff"/><rect x="-22" y="-44" width="44" height="22" rx="11" fill="#fff"/><text x="0" y="-29" text-anchor="middle" font-size="11" font-weight="700" fill="#17171C">You</text></g>
          <g id="rider"><circle r="14" fill="#FF6B4A" opacity=".25"><animate attributeName="r" values="12;24;12" dur="1.6s" repeatCount="indefinite"/></circle><circle r="10" fill="#FF6B4A" stroke="#fff" stroke-width="3.5"/></g>
        </svg></div>
      <div class="box row between" id="riderCard"></div>
      <div class="box"><h3 style="font-size:20px;margin-bottom:6px">Order details</h3>
        ${O.items.map(i => `<div class="row" style="gap:14px;padding:10px 0"><a href="product.html?id=${i.pid}">${img(i.img, i.name).replace('<img', '<img style="width:56px;height:70px;border-radius:10px;object-fit:cover"')}</a><div style="flex:1"><b>${esc(i.name)}</b><div class="small muted">Size ${i.size} · Qty ${i.qty}</div></div><b>${fmt(i.price * i.qty)}</b></div>`).join('')}
        <div class="line"><span>Delivery</span><span>${O.fee ? fmt(O.fee) : 'Free'}</span></div>${O.disc ? `<div class="line d"><span>Discount (${O.code})</span><span>− ${fmt(O.disc)}</span></div>` : ''}
        <div class="line t"><span>Total</span><span>${fmt(O.total)}</span></div>
        <div class="small muted" style="margin-top:10px">${ic('pin', 14)} ${esc(O.address.label)}: ${esc(O.address.line)}, ${esc(O.address.area)} - ${esc(O.address.pin)}</div></div>
    </div>
    <div class="stack" style="position:sticky;top:96px">
      <div class="box"><div class="muted small" id="subTxt" aria-live="polite"></div><div class="eta" id="eta"></div><div class="stepper" id="stepper"></div></div>
      <div id="actions" class="stack"></div>
    </div>
  </div>`;

  const route = $('#route'), done = $('#routeDone'), L = route.getTotalLength();
  let lastKey = '', lastIdx = null;

  function openCall() {
    let sec = 0, ti;
    const m = openModal(`<div class="callbox"><div class="av">${esc(rider.name[0])}</div><h2>${esc(rider.name)}</h2><p class="muted" id="callSt">Calling…</p><div class="mact"><button type="button" class="btn dark" data-close autofocus>End call</button></div></div>`, { onClose: () => clearInterval(ti) });
    setTimeout(() => { const c = m.querySelector('#callSt'); if (!c) return; ti = setInterval(() => { sec++; const el = m.querySelector('#callSt'); if (el) el.textContent = `Connected · 0${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }, 1000); if (c) c.textContent = 'Connected · 00:00'; }, 1500);
  }

  function returnCard(st, w) {
    const row = (icon, title, sub, c) => `<div class="row between" style="gap:10px;padding:9px 0;border-top:1px solid var(--line)"><span class="row" style="gap:12px">${ic(icon, 20)}<span><b>${title}</b><br><span class="small muted">${sub}</span></span></span>${c}</div>`;
    const busy = O.exchange || O.ret;
    return `<div class="box"><div class="row between"><h3 style="font-size:19px">Exchange &amp; return</h3><button type="button" class="link" id="polBtn">View policy</button></div>
      <div style="margin-top:8px">
        ${row('truck', 'Delivered', st.done ? fmtDT(w.d) : 'Windows start at delivery', st.done ? '<span class="status-chip ok">Done</span>' : '')}
        ${row('repeat', 'Free exchange', 'until ' + (st.done ? fmtDT(w.ex.end) : '24 hours after delivery'), retChip(w.ex, st.done))}
        ${row('shield', 'Return for refund', 'until ' + (st.done ? fmtDT(w.rt.end) : '7 days after delivery'), retChip(w.rt, st.done))}
      </div>
      ${busy ? '' : `<div class="row" style="gap:10px;margin-top:12px"><button type="button" class="btn ghost" id="exBtn" style="flex:1" ${w.ex.open ? '' : 'disabled'}>Exchange</button><button type="button" class="btn primary" id="rtBtn" style="flex:1" ${w.rt.open ? '' : 'disabled'}>Return</button></div>`}
    </div>`;
  }

  function rateCard() {
    return `<div class="box"><h3 style="font-size:20px">How was your order?</h3><p class="muted small">Your review helps others pick the right size.</p>
      <div class="rstars" id="rst" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-r="${i}" role="radio" aria-checked="false" aria-label="${i} star${i > 1 ? 's' : ''}">${ic('star', 32)}</button>`).join('')}</div>
      <textarea class="inp" id="rtx" rows="2" placeholder="Tell us about the fit and quality (optional)"></textarea><div class="errt" id="rerr"></div>
      <button type="button" class="btn primary block" id="rsub" style="margin-top:10px">Submit review</button></div>`;
  }

  function paintStatic(st) {
    const ex = O.exchange;
    $('#riderCard').innerHTML = `<div class="row" style="gap:14px"><span class="av">${esc(rider.name[0])}</span><span><b>${esc(rider.name)}</b><br><span class="small muted">${ic('star', 13, 'on')} ${rider.rating} · ${st.cancelled ? 'Not assigned' : st.done ? 'Delivered your order' : st.idx < 2 ? 'Assigned to your order' : 'On the way'}</span></span></div>${st.done || st.cancelled ? '' : `<button type="button" class="btn primary sm" id="callBtn">${ic('phone', 16)} Call</button>`}`;
    const cb = $('#callBtn'); if (cb) cb.onclick = openCall;
    $('#stepper').innerHTML = st.cancelled
      ? `<div class="box" style="background:#fde6e6;border-color:#f7caca"><b style="color:var(--red)">Order cancelled</b><p class="small">Your refund of ${fmt(O.total)} will reach you in 3–5 business days.</p></div>`
      : STEP_NAMES.map((n, i) => {
        const cls = st.done || i < st.idx ? 'done' : i === st.idx ? 'cur' : 'todo';
        return `<div class="st ${cls}"><span class="c">${cls === 'done' ? ic('check', 14) : ''}</span><b>${n}</b><time>${cls === 'todo' ? '~' : ''}${timeStr(stepClock(O, i))}</time></div>`;
      }).join('');
    $('#actions').innerHTML = `
      ${!st.cancelled && st.idx === 0 ? `<button type="button" class="btn ghost block" id="cancelBtn" style="color:var(--red)">Cancel order</button>` : ''}
      ${st.done && !O.rated ? rateCard() : ''}
      ${ex ? `<div class="box"><b>Exchange requested</b><p class="small muted">Ref ${ex.ref} · ${esc(ex.reason)} · ${esc(ex.size === 'Store credit' ? 'Store credit' : 'New size ' + ex.size)}. Our rider will contact you within the hour.</p></div>` : ''}
      ${O.ret ? `<div class="box"><b>Return requested</b><p class="small muted">Ref ${O.ret.ref} · ${esc(O.ret.what)} · ${esc(O.ret.reason)}. Pickup within 24 hours. Refund of ${fmt(O.ret.amount)} to ${esc(O.pay)} 3–5 business days after pickup.</p></div>` : ''}
      ${st.cancelled ? '' : returnCard(st, retWindows(O))}
      <a class="btn dark block" href="index.html">Back to home</a>`;
    const c = $('#cancelBtn');
    if (c) c.onclick = async () => {
      if (await confirmBox({ title: 'Cancel this order?', text: 'The shop hasn’t packed it yet, so you’ll get a full refund.', ok: 'Cancel order', cancel: 'Keep order', danger: true })) {
        Store.update(s => { s.orders.find(o => o.id === O.id).cancelled = true; }); toast('Order cancelled');
      }
    };
    const eb = $('#exBtn'); if (eb) eb.onclick = () => openExchange(O.id);
    const rb = $('#rtBtn'); if (rb) rb.onclick = () => openReturn(O.id);
    const pb = $('#polBtn'); if (pb) pb.onclick = () => openOrderPolicy(O.id);
    let stars = 0;
    const rs = $('#rst');
    if (rs) {
      rs.onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; stars = +b.dataset.r; $$('[data-r]', rs).forEach(x => { const on = +x.dataset.r <= stars; x.classList.toggle('on', on); x.setAttribute('aria-checked', +x.dataset.r === stars); }); $('#rerr').textContent = ''; };
      $('#rsub').onclick = () => {
        if (!stars) { $('#rerr').textContent = 'Tap a star to rate your order.'; return; }
        const text = $('#rtx').value.trim() || 'Great experience, quick delivery.';
        Store.update(s => { O.items.forEach(i => { (s.userReviews[i.pid] = s.userReviews[i.pid] || []).unshift({ stars, text, fit: 'true' }); }); s.orders.find(o => o.id === O.id).rated = true; });
        toast('Thanks for your review!');
      };
    }
  }

  function paint() {
    O = getO(); const st = orderState(O);
    const total = orderTotalMin(O);
    const rem = st.done || st.cancelled ? 0 : Math.max(1, Math.ceil(total * (1 - st.elapsed / STEP_MS[3])));
    const p = st.cancelled ? 0 : st.idx < 2 ? 0 : st.done ? 1 : Math.min(1, (st.elapsed - STEP_MS[2]) / (STEP_MS[3] - STEP_MS[2]));
    const pt = route.getPointAtLength(L * p);
    $('#rider').setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    done.style.strokeDasharray = `${L * p} ${L}`;
    $('#eta').textContent = st.cancelled ? 'Order cancelled' : st.done ? `Delivered at ${timeStr(O.createdAt + total * 60000)}` : `Arriving in ${rem} min${rem > 1 ? 's' : ''}`;
    $('#subTxt').textContent = st.cancelled ? 'Refund initiated' : SUB[st.idx];
    $('#liveTxt').textContent = st.done ? 'Delivered' : st.cancelled ? 'Cancelled' : 'Live';
    const key = [st.idx, st.cancelled, !!O.exchange, !!O.ret, O.rated].join('|');
    if (key !== lastKey) { lastKey = key; paintStatic(st); }
    if (lastIdx !== null && st.idx !== lastIdx && Store.s.settings.notify && !st.cancelled) toast(st.done ? 'Delivered! Enjoy your outfit.' : `${STEP_NAMES[st.idx]} · ${SUB[st.idx]}`);
    lastIdx = st.idx;
  }
  paint();
  setInterval(paint, 500);
}