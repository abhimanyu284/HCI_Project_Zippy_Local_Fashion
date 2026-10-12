/* ============ HOW IT WORKS PAGE ============ */
Layout('home');
const STEPS3 = [['search', 'Find it nearby', 'Search or filter by size, price and distance. Only styles in stock around you show up.'], ['bag', 'Pick your size', 'Sizes that the shop doesn’t have are greyed out, so you never order what can’t be delivered.'], ['truck', 'Get it in minutes', 'Track your rider live and exchange for free within 24 hours.']];
$('#main').innerHTML = `<section class="sec" style="padding-top:28px">${pageHead('how.html', 'How Zippy works', 'From search to your door in three steps.')}
  <div class="steps">${STEPS3.map((s, i) => `<div class="step"><div class="n">${ic(s[0], 22)}</div><h3>${i + 1}. ${s[1]}</h3><p class="muted">${s[2]}</p></div>`).join('')}</div></section>
  <section class="promise"><div><h2>Wrong size? Exchange it free within 24 hours.</h2><p>No questions about fit, no return trips. Our rider picks up the old size when delivering the new one.</p></div><button class="btn primary" data-policy>Read the exchange policy</button></section>
  <p style="margin-top:28px"><button type="button" class="btn ghost" data-tour>Take the quick tour</button></p>`;