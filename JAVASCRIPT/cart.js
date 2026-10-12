/* ============ CART / CHECKOUT ============ */
Layout('bag');

/* typed payment details live only in memory (never saved) and are cleared when the page closes */
const draft = { upi: '', num: '', name: '', exp: '', cvv: '' };
const luhn = n => { let sum = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return sum % 10 === 0; };

function payFields(m) {
  if (m === 'upi') return `<div class="payfields"><div><label class="small" for="upi"><b>UPI ID</b></label><input class="inp" id="upi" data-draft="upi" placeholder="name@bank" value="${esc(draft.upi)}" autocomplete="off" inputmode="email" aria-describedby="upiErr"><div class="errt" id="upiErr" role="alert"></div><div class="hint">Example: priya@oksbi</div></div></div>`;
  if (m === 'card') return `<div class="payfields">
    <div><label class="small" for="cnum"><b>Card number</b></label><input class="inp" id="cnum" data-draft="num" placeholder="1234 5678 9012 3456" value="${esc(draft.num)}" inputmode="numeric" autocomplete="cc-number" maxlength="23"><div class="errt" id="cnumErr" role="alert"></div></div>
    <div><label class="small" for="cname"><b>Name on card</b></label><input class="inp" id="cname" data-draft="name" value="${esc(draft.name)}" autocomplete="cc-name"><div class="errt" id="cnameErr" role="alert"></div></div>
    <div class="three"><div><label class="small" for="cexp"><b>Expiry</b></label><input class="inp" id="cexp" data-draft="exp" placeholder="MM/YY" value="${esc(draft.exp)}" inputmode="numeric" autocomplete="cc-exp" maxlength="5"><div class="errt" id="cexpErr" role="alert"></div></div>
    <div><label class="small" for="ccvv"><b>CVV</b></label><input class="inp" id="ccvv" data-draft="cvv" type="password" value="${esc(draft.cvv)}" inputmode="numeric" autocomplete="cc-csc" maxlength="4"><div class="errt" id="ccvvErr" role="alert"></div></div></div></div>`;
  return '';
}
/* returns { fieldId: message } for anything invalid; empty object means OK */
function checkPay() {
  const m = Store.s.pay.method, e = {};
  if (m === 'upi' && !/^[a-z0-9._-]{2,64}@[a-z]{2,32}$/i.test(draft.upi.trim())) e.upi = 'Enter a valid UPI ID like name@bank.';
  if (m === 'card') {
    const n = draft.num.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(n) || !luhn(n)) e.cnum = 'Enter a valid card number.';
    if (draft.name.trim().length < 2) e.cname = 'Enter the name on the card.';
    const mm = /^(\d{2})\/(\d{2})$/.exec(draft.exp), now = new Date();
    if (!mm || +mm[1] < 1 || +mm[1] > 12 || (2000 + +mm[2]) * 12 + +mm[1] < now.getFullYear() * 12 + now.getMonth() + 1) e.cexp = 'Enter a valid, unexpired date.';
    if (!/^\d{3,4}$/.test(draft.cvv)) e.ccvv = 'Enter the 3 or 4 digit CVV.';
  }
  return e;
}
function payLabel() {
  const m = Store.s.pay.method;
  if (m === 'upi') return 'UPI · ' + draft.upi.trim();
  if (m === 'card') return 'Card ····' + draft.num.replace(/\s/g, '').slice(-4);
  return 'Cash on delivery';
}

function render() {
  const t = totals();
  if (!t.lines.length) {
    $('#main').innerHTML = `<div class="page-h"><h1>Your bag</h1></div><div class="empty"><div class="ei">${ic('bag', 28)}</div><h3>Your bag is empty</h3><p>Find something you love from the shops around you.</p><a class="btn primary" href="search.html">Browse styles</a></div>`;
    return;
  }
  const addr = activeAddress(), open = isOpen(t.shop), far = t.shop.km > 3;
  const promoMin = t.code ? PROMOS[t.code].min : 0;

  $('#main').innerHTML = `
  ${isSignedIn() ? '' : `<div class="signbanner" style="margin-top:18px"><span class="row" style="gap:10px">${ic('user', 20)}<span><b>Checking out as a guest</b><br><span class="small muted">Sign in to keep your addresses and order history. It’s optional.</span></span></span><a class="btn ghost sm" href="login.html?next=cart.html">Sign in</a></div>`}
  <div class="page-h"><h1>Your bag</h1><p class="muted">${cartCount()} ${cartCount() === 1 ? 'item' : 'items'} from <a class="link" href="shop.html?id=${t.shop.id}">${esc(t.shop.name)}</a> · ${t.shop.km} km away</p></div>
  <div class="cartgrid">
    <div class="stack">
      <section class="box" aria-label="Items">
        ${t.lines.map(l => `<div class="item">
          <a href="product.html?id=${l.p.id}">${img(l.p.imgs[0], l.p.name)}</a>
          <div><a href="product.html?id=${l.p.id}"><b>${esc(l.p.name)}</b></a><div class="small muted">Size ${l.size}</div>
            <div class="price" style="margin-top:6px">${fmt(l.p.price)}</div>
            ${l.p.sizes[l.size] <= 2 ? `<div class="tiny" style="color:var(--amber-d);font-weight:600;margin-top:4px">Only ${l.p.sizes[l.size]} left</div>` : ''}</div>
          <div class="row" style="flex-direction:column;align-items:flex-end;gap:10px">
            <div class="qty" role="group" aria-label="Quantity for ${esc(l.p.name)}"><button type="button" data-qty="${l.pid}|${l.size}|-1" aria-label="Decrease quantity">${ic('minus', 16)}</button><b aria-live="polite">${l.qty}</b><button type="button" data-qty="${l.pid}|${l.size}|1" aria-label="Increase quantity">${ic('plus', 16)}</button></div>
            <button type="button" class="link row" data-rm="${l.pid}|${l.size}" style="gap:4px;color:var(--red)">${ic('trash', 15)} Remove</button></div></div>`).join('')}
      </section>

      <section class="box"><h3 style="font-size:20px;margin-bottom:14px">Delivery slot</h3>
        <div class="slots" role="radiogroup">
          <label class="slot"><input type="radio" name="slot" value="quick" ${t.slot === 'quick' ? 'checked' : ''} ${far ? 'disabled' : ''}><div><b class="row" style="gap:6px">${ic('bolt', 16)} 10–15 min · Quick</b><span class="small muted">${t.free ? 'Free' : '₹29'} delivery${far ? ' · not available beyond 3 km' : ''}</span></div></label>
          <label class="slot"><input type="radio" name="slot" value="std" ${t.slot === 'std' ? 'checked' : ''}><div><b class="row" style="gap:6px">${ic('clock', 16)} 30–40 min · Standard</b><span class="small muted">${t.free ? 'Free' : '₹15'} delivery</span></div></label>
        </div></section>

      <section class="box"><div class="addr"><div><h3 style="font-size:20px;margin-bottom:8px">Deliver to</h3><b>${esc(addr.label)}</b><div class="muted small">${esc(addr.line)}, ${esc(addr.area)} - ${esc(addr.pin)}</div></div><button type="button" class="btn ghost sm" id="chAddr">Change</button></div></section>

      <section class="box"><h3 style="font-size:20px;margin-bottom:4px">Payment</h3><p class="small muted" style="margin-bottom:14px">Demo only: no real payment is taken and card details are never saved.</p>
        <div class="payopts" role="radiogroup" aria-label="Payment method">${[['cod', 'Cash on delivery', 'Pay the rider in cash or UPI at your door'], ['upi', 'UPI', 'Pay with any UPI app'], ['card', 'Credit / debit card', 'Visa, Mastercard, RuPay']].map(o => `<label class="payopt"><input type="radio" name="pay" value="${o[0]}" ${Store.s.pay.method === o[0] ? 'checked' : ''}><div><b>${o[1]}</b><br><span class="small muted">${o[2]}</span></div></label>${Store.s.pay.method === o[0] ? payFields(o[0]) : ''}`).join('')}</div></section>

      <section class="box"><h3 style="font-size:20px;margin-bottom:12px">Promo code</h3>
        ${t.code ? `<div class="row between"><span class="pp">${ic('check', 15)} ${t.code} applied</span><button type="button" class="link" id="rmPromo">Remove</button></div>${t.sub < promoMin ? `<div class="errt">Add ${fmt(promoMin - t.sub)} more to unlock this code.</div>` : ''}`
          : `<form class="promo" id="promoForm" novalidate><label class="sr" for="pc">Promo code</label><input class="inp" id="pc" placeholder="Enter code" autocapitalize="characters"><button class="btn dark">Apply</button></form><div class="errt" id="perr" role="alert"></div>
          <div class="chips" style="margin-top:10px">${Object.keys(PROMOS).map(c => `<button type="button" class="chip" data-code="${c}">${c} · ${PROMOS[c].label}</button>`).join('')}</div>`}</section>
    </div>

    <aside class="box sum" aria-label="Order summary"><h3 style="font-size:22px;margin-bottom:12px">Order summary</h3>
      <div class="line"><span>Item total</span><span>${fmt(t.sub)}</span></div>
      <div class="line"><span>Delivery fee</span><span>${t.free ? `<s>${fmt(t.baseFee)}</s>` : ''}${t.free ? 'Free' : fmt(t.fee)}</span></div>
      ${t.disc ? `<div class="line d"><span>Discount (${t.code})</span><span>− ${fmt(t.disc)}</span></div>` : ''}
      <div class="line t"><span>Total</span><span>${fmt(t.total)}</span></div>
      <p class="small muted" style="margin:8px 0 16px">${t.free ? 'You unlocked free delivery' : `Add ${fmt(3000 - t.sub)} more for free delivery`}</p>
      <button type="button" class="btn primary block" id="confirm" ${open ? '' : 'disabled'}>${open ? `Review order · ${fmt(t.total)}` : `${esc(t.shop.name)} is closed`}</button>
      <p class="tiny muted" style="text-align:center;margin-top:8px">You’ll see everything once more before it’s placed.</p>
      <button type="button" class="link" data-policy style="display:block;margin:14px auto 0">Free exchange within 24 hrs · policy</button>
    </aside>
  </div>`;
}

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const q = e.target.closest('[data-qty]');
  if (q) {
    const [pid, size, d] = q.dataset.qty.split('|'), p = prodById(pid), max = Math.min(5, p.sizes[size]);
    const line = Store.s.cart.find(c => c.pid === pid && c.size === size);
    const next = line.qty + +d;
    if (next < 1) return;
    if (next > max) { toast(`Only ${max} available in size ${size}`); return; }
    Store.update(s => { s.cart.find(c => c.pid === pid && c.size === size).qty = next; });
    return;
  }
  const r = e.target.closest('[data-rm]');
  if (r) {
    const [pid, size] = r.dataset.rm.split('|');
    const i = Store.s.cart.findIndex(c => c.pid === pid && c.size === size), item = { ...Store.s.cart[i] };
    Store.update(s => { s.cart.splice(i, 1); });
    toast(`Removed ${prodById(pid).name}`, { label: 'Undo', onClick: () => Store.update(s => { s.cart.splice(Math.min(i, s.cart.length), 0, item); }) });
    return;
  }
  if (e.target.closest('#chAddr')) { pickAddress(); return; }
  if (e.target.closest('#rmPromo')) { Store.update(s => { s.promo = null; }); return; }
  const c = e.target.closest('[data-code]'); if (c) { applyPromo(c.dataset.code); return; }
  if (e.target.closest('#confirm')) checkout();
});
document.addEventListener('change', e => {
  if (e.target.name === 'slot') Store.update(s => { s.slot = e.target.value; });
  if (e.target.name === 'pay') Store.update(s => { s.pay = { method: e.target.value }; });
});
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.draft; if (!k) return;
  let v = e.target.value;
  if (k === 'num') v = v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  if (k === 'exp') { v = v.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); }
  if (k === 'cvv') v = v.replace(/\D/g, '').slice(0, 4);
  e.target.value = v; draft[k] = v;
  e.target.classList.remove('err'); const er = $('#' + e.target.id + 'Err'); if (er) er.textContent = '';
});
document.addEventListener('submit', e => { if (e.target.id === 'promoForm') { e.preventDefault(); applyPromo($('#pc').value); } });

function applyPromo(raw) {
  const code = raw.trim().toUpperCase(), err = $('#perr'), t = totals();
  const fail = m => { if (err) err.textContent = m; $('#pc') && $('#pc').classList.add('err'); };
  if (!code) return fail('Enter a promo code.');
  if (!PROMOS[code]) return fail('That code isn’t valid. Try ZIPPY50 or FIRST10.');
  if (t.sub < PROMOS[code].min) return fail(`Add ${fmt(PROMOS[code].min - t.sub)} more to use ${code}.`);
  Store.update(s => { s.promo = code; });
  toast(`${code} applied`);
}

/* step 1: check payment, step 2: review everything, step 3: place */
function checkout() {
  const t = totals();
  if (!isOpen(t.shop)) { toast(`${t.shop.name} is closed right now`); return; }
  const errs = checkPay(), ids = Object.keys(errs);
  $$('.payfields .inp').forEach(i => i.classList.remove('err')); $$('.payfields .errt').forEach(x => { x.textContent = ''; });
  if (ids.length) {
    ids.forEach(id => { const f = $('#' + id); if (f) f.classList.add('err'); const er = $('#' + id + 'Err'); if (er) er.textContent = errs[id]; });
    const first = $('#' + ids[0]); if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); first.focus(); }
    toast('Please fix the highlighted payment details');
    return;
  }
  const addr = activeAddress(), eta = t.slot === 'quick' ? '10–15 min' : '30–40 min';
  const m = openModal(`<div class="review"><h2>Review your order</h2><p class="muted small">Nothing is charged until you place the order.</p>
    <div style="margin-top:12px">${t.lines.map(l => `<div class="revitem">${img(l.p.imgs[0], l.p.name)}<div style="flex:1"><b>${esc(l.p.name)}</b><div class="small muted">Size ${l.size} · Qty ${l.qty}</div></div><b>${fmt(l.p.price * l.qty)}</b></div>`).join('')}</div>
    <dl><dt>From</dt><dd>${esc(t.shop.name)}</dd><dt>Deliver to</dt><dd>${esc(addr.label)}: ${esc(addr.line)}, ${esc(addr.area)} - ${esc(addr.pin)}</dd><dt>Arrives in</dt><dd>${eta}</dd><dt>Payment</dt><dd>${esc(payLabel())}</dd></dl>
    <div class="line"><span>Item total</span><span>${fmt(t.sub)}</span></div><div class="line"><span>Delivery</span><span>${t.fee ? fmt(t.fee) : 'Free'}</span></div>${t.disc ? `<div class="line d"><span>Discount (${t.code})</span><span>− ${fmt(t.disc)}</span></div>` : ''}
    <div class="line t"><span>Total</span><span>${fmt(t.total)}</span></div>
    <div class="mact"><button type="button" class="btn ghost" data-close>Go back</button><button type="button" class="btn primary" id="place" autofocus>Place order · ${fmt(t.total)}</button></div></div>`);
  m.querySelector('#place').onclick = e => placeOrder(e.currentTarget);
}

async function placeOrder(btn) {
  const t = totals();
  if (!t.lines.length) return;
  if (!isOpen(t.shop)) { toast(`${t.shop.name} is closed right now`); return; }
  btn.disabled = true; btn.textContent = 'Placing your order…';
  await new Promise(r => setTimeout(r, 700));
  const o = {
    id: 'ZP' + (1000 + Math.floor(Math.random() * 9000)),
    items: t.lines.map(l => ({ pid: l.pid, size: l.size, qty: l.qty, name: l.p.name, price: l.p.price, img: l.p.imgs[0] })),
    shop: t.shop.id, slot: t.slot, address: { ...activeAddress() }, sub: t.sub, fee: t.fee, disc: t.disc, code: t.code,
    total: t.total, pay: payLabel(), createdAt: Date.now(), cancelled: false, exchange: null, rated: false, rider: Store.s.orders.length % 3
  };
  Store.update(s => { s.orders.unshift(o); s.cart = []; s.promo = null; });
  location.href = 'tracking.html?id=' + o.id;
}

window.addEventListener('zippy:change', () => { if (!document.querySelector('.overlay.show .review')) render(); });
render();