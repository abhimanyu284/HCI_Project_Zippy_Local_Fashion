/* ============ SUS USABILITY QUESTIONNAIRE ============ */
Layout('feedback');

const SUS = [
  'I think that I would like to use Zippy frequently.',
  'I found Zippy unnecessarily complex.',
  'I thought Zippy was easy to use.',
  'I think that I would need the support of a technical person to be able to use Zippy.',
  'I found the various functions in Zippy were well integrated.',
  'I thought there was too much inconsistency in Zippy.',
  'I would imagine that most people would learn to use Zippy very quickly.',
  'I found Zippy very cumbersome to use.',
  'I felt very confident using Zippy.',
  'I needed to learn a lot of things before I could get going with Zippy.'
];
/* standard SUS scoring: odd items contribute (answer - 1), even items (5 - answer); sum x 2.5 => 0 to 100 */
const susScore = a => a.reduce((t, x, i) => t + (i % 2 === 0 ? x - 1 : 5 - x), 0) * 2.5;
const grade = n => (n >= 80.3 ? ['Excellent', 'A'] : n >= 68 ? ['Good (above average)', 'B'] : n >= 51 ? ['OK (needs work)', 'C'] : ['Poor', 'D']);

let last = null;
function render() {
  const rs = Store.s.sus, avg = rs.length ? rs.reduce((t, r) => t + r.score, 0) / rs.length : 0;
  $('#main').innerHTML = `
  <div class="pr-hero"><span class="eyebrow">${ic('thumb', 15)} Usability test</span><h1>How easy was Zippy to use?</h1>
    <p class="muted" style="font-size:17px">Do a task first (for example, order a blazer), then answer these 10 quick statements. It takes about 2 minutes. Your answers are saved only in this browser.</p></div>
  <div class="pgrid2" style="margin-top:20px">
    <form class="box" id="susf" novalidate>
      <div class="two" style="margin-bottom:8px"><div class="field"><label for="who">Participant (optional)</label><input class="inp" id="who" placeholder="e.g. P1 or a first name" maxlength="30"></div>
        <div class="field"><label for="task">Did you complete the task?</label><select class="inp" id="task"><option>Yes, easily</option><option>Yes, with difficulty</option><option>No</option></select></div></div>
      <div class="field"><label for="secs">Time taken, in seconds (optional)</label><input class="inp" id="secs" type="number" min="1" max="3600" placeholder="e.g. 45"><div class="errt" id="secs-e"></div></div>
      ${SUS.map((q, i) => `<fieldset class="sus-q" id="q${i}" style="border:0;padding:16px 0"><legend style="font-weight:600;padding:0">${i + 1}. ${q}</legend>
        <div class="scale" role="radiogroup"><small>Strongly disagree</small>${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="q${i}" value="${n}" aria-label="${n} of 5"><span>${n}</span></label>`).join('')}<small>Strongly agree</small></div><div class="errt" id="q${i}-e" role="alert"></div></fieldset>`).join('')}
      <div class="field" style="margin-top:8px"><label for="note">Anything confusing or great? (optional)</label><textarea class="inp" id="note" rows="3" maxlength="300"></textarea></div>
      <button class="btn primary block">Submit and see my score</button></form>
    <aside class="stack" style="position:sticky;top:96px">
      <div class="box" id="result">${last ? resultHTML(last) : `<h3 style="font-size:20px">Your score</h3><p class="muted small" style="margin-top:6px">Answer all 10 statements to see your SUS score (0–100). Above 68 is better than average.</p>`}</div>
      <div class="box"><div class="row between"><h3 style="font-size:20px">All responses</h3><span class="muted small">${rs.length} saved</span></div>
        ${rs.length ? `<p style="margin:10px 0 4px">Average SUS: <b class="price" style="font-size:22px">${avg.toFixed(1)}</b> <span class="muted small">(${grade(avg)[0]})</span></p>
          <div style="max-height:220px;overflow:auto;margin-top:8px">${rs.map(r => `<div class="trow" style="grid-template-columns:1fr auto"><div><b>${esc(r.who || 'Anonymous')}</b><div class="tiny muted">${esc(r.task)}${r.secs ? ' · ' + r.secs + 's' : ''}</div></div><b>${r.score.toFixed(1)}</b></div>`).join('')}</div>
          <div class="row" style="margin-top:12px"><button type="button" class="btn ghost sm" id="csv">Download CSV</button><button type="button" class="link" id="clr" style="color:var(--red)">Clear all</button></div>`
          : '<p class="muted small" style="margin-top:8px">No responses yet. Ask classmates to try it and submit.</p>'}</div></aside></div>`;
  $('#susf').onsubmit = submit;
  const c = $('#csv'); if (c) c.onclick = exportCsv;
  const x = $('#clr'); if (x) x.onclick = async () => { if (await confirmBox({ title: 'Delete all responses?', text: 'This removes every saved SUS response from this browser.', ok: 'Delete', danger: true })) { Store.update(s => { s.sus = []; }); last = null; render(); toast('Responses deleted'); } };
}
function resultHTML(r) {
  const g = grade(r.score);
  return `<h3 style="font-size:20px">Your score</h3><div class="score" style="margin:10px 0">${r.score.toFixed(1)}</div><b>${g[0]}</b><p class="small muted" style="margin-top:6px">Grade ${g[1]}. The industry average SUS score is about 68.</p>`;
}
function submit(e) {
  e.preventDefault();
  const answers = []; let first = null;
  SUS.forEach((_, i) => {
    const v = document.querySelector(`input[name=q${i}]:checked`);
    $('#q' + i + '-e').textContent = v ? '' : 'Please choose a number from 1 to 5.';
    if (v) answers.push(+v.value); else if (first === null) first = i;
  });
  const secs = $('#secs').value.trim(), okS = secs === '' || (+secs >= 1 && +secs <= 3600);
  $('#secs-e').textContent = okS ? '' : 'Enter a time between 1 and 3600 seconds.';
  if (!okS) { $('#secs').focus(); return; }
  if (first !== null) { toast(`Please answer statement ${first + 1}`); document.getElementById('q' + first).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const r = { id: Date.now(), who: $('#who').value.trim(), task: $('#task').value, secs: secs ? +secs : null, answers, score: susScore(answers), note: $('#note').value.trim(), at: Date.now() };
  Store.update(s => { s.sus.unshift(r); });
  last = r; toast('Thanks! Response saved'); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function exportCsv() {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [['participant', 'task', 'seconds', ...SUS.map((_, i) => 'Q' + (i + 1)), 'SUS score', 'comment', 'date'], ...Store.s.sus.map(r => [r.who, r.task, r.secs, ...r.answers, r.score, r.note, new Date(r.at).toISOString()])];
  const blob = new Blob([rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'zippy-sus-results.csv'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('CSV downloaded');
}
render();