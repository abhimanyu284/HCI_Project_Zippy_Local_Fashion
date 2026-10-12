/* ============ EXCHANGE & RETURN (shared by the profile page and the order page) ============
   exchange window = 24 hours, return window = 7 days, both counted from delivery. */
const DAY = 864e5;
const fmtDT = x => new Date(x).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const leftTxt = ms => { const h = Math.floor(ms / 36e5); return h >= 48 ? Math.ceil(h / 24) + ' days left' : h >= 1 ? h + ' hr left' : Math.max(1, Math.ceil(ms / 6e4)) + ' min left'; };
function retWindows(o) {
  const done = orderState(o).done && !o.cancelled, d = o.createdAt + orderTotalMin(o) * 60000, now = Date.now();
  const mk = len => ({ end: d + len, open: done && now <= d + len, left: d + len - now });
  return { done, d, ex: mk(DAY), rt: mk(7 * DAY), busy: !!(o.exchange || o.ret) };
}
function retChip(w, done) { return !done ? '<span class="status-chip go">Opens on delivery</span>' : w.open ? `<span class="status-chip ok">Open · ${leftTxt(w.left)}</span>` : '<span class="status-chip no">Closed</span>'; }
function retHint(o, w) {
  return w.busy ? 'You’ve already raised a request for this order.' : o.cancelled ? 'This order was cancelled.' : !w.done ? 'Exchange and return open once your order is delivered.' : !w.rt.open ? 'The return window for this order has ended.' : !w.ex.open ? 'The 24-hour exchange window has ended. You can still return until ' + fmtDT(w.rt.end) + '.' : '';
}
function openOrderPolicy(oid) {
  const o = Store.s.orders.find(x => x.id === oid), w = retWindows(o);
  openPolicy({ onExchange: () => openExchange(oid), onReturn: () => openReturn(oid), canEx: !w.busy && w.ex.open, canRet: !w.busy && w.rt.open, hint: retHint(o, w) });
}

function openExchange(oid) {
  const O = Store.s.orders.find(o => o.id === oid); if (!O) return;
  const items = O.items;
  const m = openModal(`<h2>Request an exchange</h2><p class="muted small" style="margin-bottom:16px">We’ll pick up the old size when the new one arrives.</p>
    <form novalidate>
      ${items.length > 1 ? `<div class="field"><label for="exI">Item</label><select class="inp" id="exI">${items.map((i, k) => `<option value="${k}">${esc(i.name)} (${i.size})</option>`).join('')}</select></div>` : ''}
      <div class="field"><label>Reason</label>${['Wrong size', 'Fit issue', 'Quality issue', 'Other'].map((r, k) => `<label class="radio"><input type="radio" name="why" value="${r}" ${k === 0 ? 'checked' : ''}>${r}</label>`).join('')}</div>
      <div class="field"><label for="exS">New size</label><select class="inp" id="exS"></select><div class="errt" id="exErr"></div></div>
      <div class="mact"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary">Request exchange</button></div></form>`);
  const fill = () => {
    const it = items[+(m.querySelector('#exI')?.value || 0)], p = prodById(it.pid);
    const opts = SIZES.filter(s => s !== it.size && p.sizes[s] > 0);
    m.querySelector('#exS').innerHTML = opts.length ? opts.map(s => `<option>${s}</option>`).join('') : '<option value="">No other size in stock</option>';
  };
  fill(); m.querySelector('#exI')?.addEventListener('change', fill);
  m.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const size = m.querySelector('#exS').value;
    if (!size) { m.querySelector('#exErr').textContent = 'No other size is in stock, so we’ll issue store credit instead.'; }
    const ex = { ref: 'EX' + (1000 + Math.floor(Math.random() * 9000)), reason: m.querySelector('input[name=why]:checked').value, size: size || 'Store credit', at: Date.now() };
    Store.update(s => { s.orders.find(o => o.id === O.id).exchange = ex; });
    closeModal(); toast(`Exchange requested · ref ${ex.ref}`);
  };
}

function openReturn(oid) {
  const O = Store.s.orders.find(o => o.id === oid); if (!O) return;
  const items = O.items, money = k => k === 'all' ? items.reduce((t, i) => t + i.price * i.qty, 0) : items[+k].price * items[+k].qty;
  const m = openModal(`<h2>Return an item</h2><p class="muted small" style="margin-bottom:16px">Free pickup. Your refund goes back to ${esc(O.pay)} within 3–5 business days after pickup.</p>
    <form novalidate>
      <div class="field"><label for="rtI">What are you returning?</label><select class="inp" id="rtI">${items.map((i, k) => `<option value="${k}">${esc(i.name)} (${i.size}) × ${i.qty}</option>`).join('')}${items.length > 1 ? '<option value="all">Everything in this order</option>' : ''}</select></div>
      <div class="field"><label>Reason</label>${['Doesn’t fit', 'Quality issue', 'Not as shown', 'Wrong item delivered', 'Changed my mind'].map((r, k) => `<label class="radio"><input type="radio" name="why" value="${r}" ${k === 0 ? 'checked' : ''}>${r}</label>`).join('')}</div>
      <div class="field"><label for="rtN">Anything we should know? (optional)</label><textarea class="inp" id="rtN" rows="2" maxlength="200"></textarea></div>
      <div class="row between" style="background:var(--peach);border-radius:12px;padding:10px 14px;margin-bottom:6px"><span class="small">Refund amount</span><b class="price" id="rtAmt"></b></div>
      <div class="mact"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary">Request return</button></div></form>`);
  const amt = () => { m.querySelector('#rtAmt').textContent = fmt(money(m.querySelector('#rtI').value)); };
  amt(); m.querySelector('#rtI').addEventListener('change', amt);
  m.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const k = m.querySelector('#rtI').value;
    const rt = { ref: 'RT' + (1000 + Math.floor(Math.random() * 9000)), reason: m.querySelector('input[name=why]:checked').value, what: k === 'all' ? 'All items' : items[+k].name, amount: money(k), note: m.querySelector('#rtN').value.trim(), at: Date.now() };
    Store.update(s => { s.orders.find(o => o.id === O.id).ret = rt; });
    closeModal(); toast(`Return requested · ref ${rt.ref}`);
  };
}