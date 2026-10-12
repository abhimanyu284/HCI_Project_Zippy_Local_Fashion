/* ============ PROFILE ============ */
Layout('me');

function chipFor(o) {
  const st = orderState(o);
  if (st.cancelled) return '<span class="status-chip no">Cancelled</span>';
  if (st.done) return '<span class="status-chip ok">Delivered</span>';
  return `<span class="status-chip go">${st.idx >= 2 ? 'On the way' : 'Preparing'}</span>`;
}

async function reorder(o) {
  const sh = shopById(o.shop);
  if (!isOpen(sh)) { toast(`${sh.name} is closed right now`); return; }
  if (Store.s.cart.length && prodById(Store.s.cart[0].pid).shop !== o.shop) {
    if (!await confirmBox({ title: 'Start a new bag?', text: `Your bag has items from another shop. Zippy delivers from one shop per order, so this replaces them.`, ok: 'Replace items', cancel: 'Keep current bag' })) return;
  }
  let skipped = 0;
  Store.update(s => {
    if (s.cart.length && prodById(s.cart[0].pid).shop !== o.shop) s.cart = [];
    o.items.forEach(i => {
      const p = prodById(i.pid), stock = p ? p.sizes[i.size] : 0;
      if (!stock) { skipped++; return; }
      const q = Math.min(i.qty, 5, stock), l = s.cart.find(c => c.pid === i.pid && c.size === i.size);
      if (l) l.qty = Math.min(5, stock, l.qty + q); else s.cart.push({ pid: i.pid, size: i.size, qty: q });
    });
  });
  toast(skipped ? `Added to your bag. ${skipped} sold-out item${skipped > 1 ? 's were' : ' was'} skipped.` : 'Items added to your bag', { label: 'View bag', href: 'cart.html' });
}

/* Returns & exchanges: every delivered order with its deadlines and one-tap actions */
function returnsHTML() {
  const rows = Store.s.orders.filter(o => orderState(o).done && !o.cancelled).map(o => ({ o, w: retWindows(o) }));
  const open = rows.filter(r => !r.w.busy && r.w.rt.open).length;
  const line = ({ o, w }) => {
    const names = o.items.map(i => esc(i.name) + ' (' + i.size + ')').join(', ');
    let right;
    if (o.ret) right = `<span class="status-chip go">Return requested</span><div class="tiny muted" style="margin-top:4px">Ref ${o.ret.ref} · refund ${fmt(o.ret.amount)}</div>`;
    else if (o.exchange) right = `<span class="status-chip go">Exchange requested</span><div class="tiny muted" style="margin-top:4px">Ref ${o.exchange.ref}</div>`;
    else if (!w.rt.open) right = '<span class="status-chip no">Window closed</span>';
    else right = `<div class="row" style="gap:8px;justify-content:flex-end"><button type="button" class="btn ghost sm" data-ex="${o.id}" ${w.ex.open ? '' : 'disabled title="The 24-hour exchange window has ended"'}>Exchange</button><button type="button" class="btn primary sm" data-rt="${o.id}">Return</button></div>`;
    const dl = o.ret || o.exchange ? '' : w.rt.open ? `<div class="tiny" style="margin-top:4px"><b style="color:${w.ex.open ? 'var(--coral-d)' : 'var(--muted)'}">${w.ex.open ? 'Exchange until ' + fmtDT(w.ex.end) + ' · ' : 'Exchange closed · '}</b><b style="color:var(--mint-d)">Return until ${fmtDT(w.rt.end)} (${leftTxt(w.rt.left)})</b></div>` : `<div class="tiny muted" style="margin-top:4px">Return window ended ${fmtDT(w.rt.end)}</div>`;
    return `<div style="display:flex;gap:14px;justify-content:space-between;align-items:center;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--line)"><div style="flex:1 1 240px;min-width:0"><b>${o.id}</b> · ${esc(shopById(o.shop).name)}<div class="small muted">${names}</div>${dl}</div><div style="text-align:right">${right}</div></div>`;
  };
  return `<section class="box" id="returns"><div class="row between"><h3 style="font-size:22px">Returns &amp; exchanges</h3><button type="button" class="link" data-policy>View policy</button></div>
    <p class="small muted" style="margin:4px 0 2px">Free exchange within 24 hours of delivery · return for a full refund within 7 days.${open ? ` <b style="color:var(--mint-d)">${open} order${open > 1 ? 's' : ''} eligible now.</b>` : ''}</p>
    ${rows.length ? rows.map(line).join('') : `<div class="muted small" style="margin-top:12px;border-top:1px solid var(--line);padding-top:12px">${ic('repeat', 14)} Delivered orders appear here, with the date until which you can exchange or return them.</div>`}</section>`;
}

function render() {
  const u = Store.s.user, orders = Store.s.orders, acct = currentUser();
  $('#main').innerHTML = `
  ${acct ? '' : `<div class="signbanner" style="margin-top:22px"><span class="row" style="gap:10px">${ic('user', 20)}<span><b>You’re browsing as a guest</b><br><span class="small muted">Sign in or create an account to keep your orders and addresses safe.</span></span></span><span class="row"><a class="btn ghost sm" href="register.html?next=profile.html">Create account</a><a class="btn primary sm" href="login.html?next=profile.html">Sign in</a></span></div>`}
  <div class="page-h"><h1>Hi, ${esc(u.name.split(' ')[0])}</h1><p class="muted">Manage your orders, addresses and settings.</p></div>
  <div class="pgrid2">
    <div class="stack">
      <section class="box"><div class="row between"><h3 style="font-size:22px">My orders</h3><span class="muted small">${orders.length} total</span></div>
        ${orders.length ? orders.map(o => `<div class="trow"><div><b>${o.id}</b> · ${esc(shopById(o.shop).name)}<div class="small muted">${o.items.map(i => esc(i.name) + ' (' + i.size + ')').join(', ')} · ${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${fmt(o.total)}</div></div>${chipFor(o)}<span class="row" style="gap:8px"><a class="btn ghost sm" href="tracking.html?id=${o.id}">${orderState(o).done || o.cancelled ? 'Details' : 'Track'}</a>${orderState(o).done ? `<button type="button" class="btn dark sm" data-reorder="${o.id}">Buy again</button>` : ''}</span></div>`).join('')
          : `<div class="empty" style="margin-top:14px"><div class="ei">${ic('bag', 28)}</div><h3>No orders yet</h3><p>Your orders will show up here.</p><a class="btn primary" href="search.html">Start shopping</a></div>`}</section>

      ${returnsHTML()}

      <section class="box"><div class="row between"><h3 style="font-size:22px">Saved addresses</h3><button type="button" class="btn ghost sm" id="addAd">${ic('plus', 16)} Add</button></div>
        ${Store.s.addresses.map(a => `<div class="trow"><div><b>${esc(a.label)}</b> ${a.id === Store.s.addr ? '<span class="tag">Delivering here</span>' : ''}<div class="small muted">${esc(a.line)}, ${esc(a.area)} - ${esc(a.pin)}</div></div>
          <button type="button" class="link" data-edit="${a.id}">Edit</button><button type="button" class="link" data-del="${a.id}" style="color:var(--red)">Delete</button></div>`).join('')}</section>

      <section class="box" id="alerts"><div class="row between"><h3 style="font-size:22px">Stock alerts</h3><span class="muted small">${Store.s.stockAlerts.length} on</span></div>
        ${Store.s.stockAlerts.length ? Store.s.stockAlerts.map(k => { const [pid, sz] = k.split('|'), p = prodById(pid); return p ? `<div class="trow" style="grid-template-columns:1fr auto"><div><b>${esc(p.name)}</b> · size ${sz}<div class="small muted">${esc(shopById(p.shop).name)}${p.sizes[sz] > 0 ? ' · <b style="color:var(--mint-d)">back in stock</b>' : ' · waiting for stock'}</div></div><span class="row" style="gap:10px"><a class="link" href="product.html?id=${pid}&size=${sz}">View</a><button type="button" class="link" data-noalert="${k}" style="color:var(--red)">Remove</button></span></div>` : ''; }).join('')
          : `<p class="muted small" style="margin-top:10px">${ic('bell', 14)} No alerts yet. When a size is sold out, tap it on the product page and choose “Notify me”.</p>`}</section>
    </div>

    <aside class="stack">
      <section class="box"><div class="row" style="gap:14px"><span class="av" style="width:56px;height:56px;font-size:22px;background:var(--peach)">${esc(u.name[0].toUpperCase())}</span><div><b>${esc(u.name)}</b><div class="small muted">${acct ? esc(acct.email) + '<br>' : ''}+91 ${esc(u.phone)}</div></div></div>
        <div class="two" style="margin:16px 0"><div class="box" style="padding:12px;text-align:center"><b>${Store.s.favP.length}</b><div class="tiny muted">Saved</div></div><div class="box" style="padding:12px;text-align:center"><b>${Store.s.follows.length}</b><div class="tiny muted">Following</div></div></div>
        <button type="button" class="btn ghost block" id="editU">Edit profile</button>${acct ? `<button type="button" class="btn ghost block" id="signout" style="margin-top:10px">${ic('logout', 16)} Sign out</button>` : ''}</section>
      <section class="box"><h3 style="font-size:20px;margin-bottom:6px">Settings</h3>
        <div class="sett"><span><b class="small">Order notifications</b><br><span class="tiny muted">Show a message at each delivery step</span></span><label class="switch"><input type="checkbox" data-set="notify" ${Store.s.settings.notify ? 'checked' : ''} aria-label="Order notifications"><i></i></label></div>
        <div class="sett"><span><b class="small">Demo mode: shops always open</b><br><span class="tiny muted">Turn off to use real opening hours</span></span><label class="switch"><input type="checkbox" data-set="alwaysOpen" ${Store.s.settings.alwaysOpen ? 'checked' : ''} aria-label="Shops always open"><i></i></label></div>
        <div class="sett"><span><b class="small">Display &amp; accessibility</b><br><span class="tiny muted">Dark mode, text size, contrast, shortcuts</span></span><button type="button" class="btn ghost sm" data-display>Open</button></div></section>
      <button type="button" class="btn ghost block" id="reset" style="color:var(--red)">Reset demo data</button>
    </aside>
  </div>`;
}

document.addEventListener('click', async e => {
  const ro = e.target.closest('[data-reorder]'); if (ro) { reorder(Store.s.orders.find(o => o.id === ro.dataset.reorder)); return; }
  const xe = e.target.closest('[data-ex]'); if (xe) { openExchange(xe.dataset.ex); return; }
  const xr = e.target.closest('[data-rt]'); if (xr) { openReturn(xr.dataset.rt); return; }
  const na = e.target.closest('[data-noalert]'); if (na) { Store.update(s => { s.stockAlerts = s.stockAlerts.filter(x => x !== na.dataset.noalert); }); toast('Alert removed'); return; }
  if (e.target.closest('#signout')) { Store.update(s => { s.session = null; s.sessionTemp = false; s.user = { name: 'Guest Shopper', phone: '9876543210' }; }); toast('Signed out'); return; }
  if (e.target.closest('#addAd')) {
    const a = await addressForm(); if (a) { Store.update(s => { s.addresses.push(a); }); toast('Address added'); } return;
  }
  const ed = e.target.closest('[data-edit]');
  if (ed) {
    const cur = Store.s.addresses.find(a => a.id === ed.dataset.edit), a = await addressForm(cur);
    if (a) { Store.update(s => { s.addresses = s.addresses.map(x => x.id === a.id ? a : x); }); toast('Address updated'); } return;
  }
  const del = e.target.closest('[data-del]');
  if (del) {
    if (Store.s.addresses.length === 1) { toast('You need at least one address'); return; }
    if (await confirmBox({ title: 'Delete this address?', text: 'You can add it again any time.', ok: 'Delete', danger: true })) {
      Store.update(s => { s.addresses = s.addresses.filter(a => a.id !== del.dataset.del); if (!s.addresses.find(a => a.id === s.addr)) s.addr = s.addresses[0].id; });
      toast('Address deleted');
    } return;
  }
  if (e.target.closest('#editU')) {
    const u = Store.s.user;
    const m = openModal(`<h2>Edit profile</h2><form novalidate style="margin-top:14px">
      <div class="field"><label for="un">Name</label><input class="inp" id="un" value="${esc(u.name)}" autofocus><div class="errt"></div></div>
      <div class="field"><label for="up">Phone (10 digits)</label><input class="inp" id="up" inputmode="numeric" maxlength="10" value="${esc(u.phone)}"><div class="errt"></div></div>
      <div class="mact"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary">Save</button></div></form>`);
    m.querySelector('form').onsubmit = ev => {
      ev.preventDefault();
      const n = m.querySelector('#un'), p = m.querySelector('#up');
      const okN = n.value.trim().length >= 2, okP = /^\d{10}$/.test(p.value.trim());
      n.classList.toggle('err', !okN); n.nextElementSibling.textContent = okN ? '' : 'Enter at least 2 characters.';
      p.classList.toggle('err', !okP); p.nextElementSibling.textContent = okP ? '' : 'Enter a 10-digit phone number.';
      if (!okN || !okP) return;
      Store.update(s => { s.user = { name: n.value.trim(), phone: p.value.trim() }; const a = s.users.find(x => x.id === s.session); if (a) { a.name = s.user.name; a.phone = s.user.phone; } }); closeModal(); toast('Profile updated');
    };
    return;
  }
  if (e.target.closest('#reset')) {
    if (await confirmBox({ title: 'Reset demo data?', text: 'This clears your bag, orders, favourites, follows and addresses and restores the sample data.', ok: 'Reset', danger: true })) { Store.reset(); toast('Demo data reset'); }
  }
});
document.addEventListener('change', e => {
  const s = e.target.closest('[data-set]'); if (!s) return;
  Store.update(st => { st.settings[s.dataset.set] = s.checked; });
  toast(s.checked ? 'Turned on' : 'Turned off');
});
window.addEventListener('zippy:change', render);
render();
if (location.hash === '#returns') setTimeout(() => { const a = $('#returns'); if (a) a.scrollIntoView({ behavior: 'smooth' }); }, 100);
if (location.hash === '#alerts') setTimeout(() => { const a = $('#alerts'); if (a) a.scrollIntoView({ behavior: 'smooth' }); }, 100);