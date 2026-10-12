/* ============ DESIGN PRINCIPLES (report evidence) ============ */
Layout('principles');

/* each card: [number, title, how Zippy applies it, [ [label, href | action] ... ]] */
const SHNEIDERMAN = [
  ['1', 'Strive for consistency', 'The same header, buttons, chips, icons and wording appear on every screen. One coral colour always means the primary action, and success, warning and error colours keep one meaning each.', [['Home', 'index.html'], ['Search', 'search.html'], ['Bag', 'cart.html']]],
  ['2', 'Seek universal usability', 'Works for novices and experts and for different abilities: keyboard shortcuts (press ?), voice search, four text sizes, dark mode, high contrast, reduced motion, labelled controls for screen readers, and a layout that adapts from phone to desktop.', [['Open display settings', '#display'], ['Keyboard shortcuts', '#keys'], ['Try voice search (mic in the search box)', 'search.html']]],
  ['3', 'Offer informative feedback', 'Every action answers back: toasts when you save, follow or add to bag; skeleton loaders while results load; a live ETA, a map and a step-by-step tracker for your order; and a count of results as filters change.', [['Watch a live demo order', '#demoorder'], ['Filter and watch the count change', 'search.html?cat=blazer']]],
  ['4', 'Design dialogs to yield closure', 'Checkout has a clear beginning, middle and end: Bag, then Payment, then a Review screen, then Order placed, then Tracking. Each step says what just happened and what comes next.', [['Start at the bag', 'cart.html'], ['Product to bag', 'product.html?id=p1']]],
  ['5', 'Prevent errors', 'Sizes a shop doesn’t have are crossed out and can’t be chosen. Quantity is capped at stock. “Quick delivery” is disabled beyond 3 km. Forms validate as you type and the total is shown before you confirm. Min price can’t exceed max price.', [['Sold-out size XL', 'product.html?id=p1'], ['Price filter validation', 'search.html']]],
  ['6', 'Permit easy reversal of actions', 'Undo after removing from the bag, un-saving or unfollowing. Cancel an order until the shop starts packing. Free exchange within 24 hours of delivery. Clear all filters in one tap.', [['Bag (remove, then Undo)', 'cart.html'], ['Exchange policy', '#policy']]],
  ['7', 'Keep users in control', 'You choose the pace: browse and check out as a guest, sign-in is optional, the tour can be skipped, shortcuts can be turned off, you can sort, filter, compare and edit or delete your addresses.', [['Sign in (optional)', 'login.html'], ['Profile and settings', 'profile.html']]],
  ['8', 'Reduce short-term memory load', 'You never have to remember something between screens: recent searches, “Recently viewed”, a compare tray with side-by-side details, active filter chips, saved addresses, and a sticky order summary.', [['Compare styles', 'search.html?cat=blazer'], ['Home (recently viewed)', 'index.html']]]
];
const NORMAN = [
  ['A', 'Affordances', 'Things look like what they do: buttons are raised pills, cards lift on hover, the photo shows a zoom cursor, sliders and switches look slidable.', [['Product page', 'product.html?id=p15']]],
  ['B', 'Signifiers', 'Clear cues tell you what to do: the heart on a card, the mic icon in search, “Select size” with the guide link, dots under the photo, a red dot on low-stock sizes, and the pulsing “Live” tag.', [['Product page', 'product.html?id=p1']]],
  ['C', 'Mapping', 'Controls map naturally to results: the filter chips match what’s on screen, the order stepper mirrors real stages, and on the map, farther from the centre means farther from your address.', [['Nearby shops map (choose Map)', 'index.html#nearby']]],
  ['D', 'Constraints', 'The design makes wrong actions hard: disabled sizes, one shop per bag, masked card and phone inputs, a date check on expiry, and a Quick slot that disappears for far shops.', [['Bag and payment', 'cart.html']]],
  ['E', 'Feedback', 'Immediate, visible results of every action: add-to-bag toast, “Placing your order…”, the tracker advancing and a rider moving along the route on the map.', [['Watch a live demo order', '#demoorder']]],
  ['F', 'Conceptual model', 'Zippy explains how it works in three steps (find nearby, pick your size, get it in minutes), says why one shop per bag, and shows the exchange policy where you need it.', [['How it works', 'index.html#how'], ['Take the tour', '#tour']]]
];

const LIMITS = [
  'Photos are sample images from the web and may not match each product exactly. They are placeholders for real shop photos.',
  'There is no real backend: stock, orders, payments and accounts are simulated in your browser (localStorage).',
  'Delivery time is sped up in the demo (a full order takes about 30 seconds) so the tracker can be shown.',
  'Voice search works only in browsers that support the Web Speech API (Chrome, Edge, Safari) and needs a microphone and internet.',
  'The interface is in English only. A Hindi / regional language option would improve universal usability.',
  'Accessibility was checked with a keyboard and automated checks, but not yet with a full screen-reader study.'
];

function demoOrder() {
  const p = prodById('p1'), a = activeAddress();
  const o = { id: 'ZP' + (1000 + Math.floor(Math.random() * 9000)), items: [{ pid: p.id, size: 'M', qty: 1, name: p.name, price: p.price, img: p.imgs[0] }], shop: p.shop, slot: 'quick', address: { ...a }, sub: p.price, fee: 29, disc: 0, code: null, total: p.price + 29, pay: 'Cash on delivery', createdAt: Date.now(), cancelled: false, exchange: null, rated: false, rider: Store.s.orders.length % 3 };
  Store.update(s => { s.orders.unshift(o); });
  location.href = 'tracking.html?id=' + o.id;
}

let view = 'all';
function card(c, group) {
  return `<article class="pr"><div class="row"><span class="no" aria-hidden="true">${c[0]}</span><span class="src">${group}</span></div><h3>${c[1]}</h3><p class="muted">${c[2]}</p>
    <div class="where">${c[3].map(w => w[1][0] === '#' ? `<button type="button" class="chip" data-act="${w[1].slice(1)}">${esc(w[0])} →</button>` : `<a class="chip" href="${w[1]}">${esc(w[0])} →</a>`).join('')}</div></article>`;
}
function render() {
  $('#main').innerHTML = `
  <div class="pr-hero"><span class="eyebrow">${ic('book', 15)} HCI evidence</span><h1>Why Zippy is designed this way</h1>
    <p class="lead muted" style="font-size:18px">Shneiderman’s 8 Golden Rules and Norman’s design principles, each linked to the exact screen where you can see it working. Use this page as evidence in your report.</p>
    <div class="row noprint" style="margin-top:18px;flex-wrap:wrap"><div class="seg" role="radiogroup" aria-label="Show principles">${[['all', 'All'], ['sh', 'Shneiderman’s 8 rules'], ['no', 'Norman’s principles']].map(v => `<button type="button" role="radio" aria-checked="${view === v[0]}" class="${view === v[0] ? 'on' : ''}" data-view="${v[0]}">${v[1]}</button>`).join('')}</div>
    <button type="button" class="btn ghost sm" id="print">Print / save as PDF</button></div></div>

  ${view !== 'no' ? `<section class="sec"><div class="sec-h"><h2>Shneiderman’s 8 Golden Rules</h2></div><div class="pr-groups">${SHNEIDERMAN.map(c => card(c, 'Shneiderman')).join('')}</div></section>` : ''}
  ${view !== 'sh' ? `<section class="sec"><div class="sec-h"><h2>Norman’s design principles</h2></div><div class="pr-groups">${NORMAN.map(c => card(c, 'Norman')).join('')}</div></section>` : ''}

  <section class="sec"><div class="sec-h"><h2>Task walk-through (HTA)</h2></div>
    <div class="box"><p class="muted small" style="margin-bottom:12px">Goal 0: <b>Order a blazer</b> — fastest path from the home page, paying cash on delivery.</p>
    <ol style="padding-left:20px;display:grid;gap:6px"><li>Click the <b>Blazers</b> tile on the home page</li><li>Click a blazer card</li><li>Click a size (for example M)</li><li>Click <b>Buy now</b> (adds to the bag and opens it)</li><li>Click <b>Review order</b></li><li>Click <b>Place order</b></li></ol>
    <p style="margin-top:14px"><b>6 clicks</b> from home to a placed order. Cash on delivery is pre-selected, so no typing is required. Compare this with your GOMS / KLM estimate.</p></div></section>

  <section class="sec"><div class="sec-h"><h2>Honest limitations</h2></div><div class="box"><ul style="padding-left:20px;display:grid;gap:8px">${LIMITS.map(l => `<li>${l}</li>`).join('')}</ul></div></section>

  <section class="promise reveal"><div><h2>Tried it? Rate it.</h2><p>Take the 10-question System Usability Scale test and see your score.</p></div><a class="btn primary" href="feedback.html">Open the SUS questionnaire</a></section>`;
  reveal();
}
document.addEventListener('click', e => {
  const v = e.target.closest('[data-view]'); if (v) { view = v.dataset.view; render(); return; }
  if (e.target.closest('#print')) { window.print(); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  ({ display: openDisplay, keys: openShortcuts, tour: startTour, policy: openPolicy, demoorder: demoOrder })[a.dataset.act]();
});
render();