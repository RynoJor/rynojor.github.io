/* Ryno Jordaan portfolio: hero ledger, clock, reveal, lightbox and the lead-router demo. Plain JS, fake data. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString('en-US');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  /* ---------- Hero ledger: count to $881,884 ---------- */
  const leak = $('#leak'), bars = $('#bars'), feed = $('#feed');
  const TOTAL = 881884;
  const feedSteps = ['scanning 2,000 leads…', 'scanning 600 deals…', 'checking 6 leak rules…', '625 records flagged'];
  function runLedger() {
    bars.classList.remove('pre');
    if (reduce) { leak.textContent = '$' + fmt(TOTAL); feed.textContent = feedSteps[3]; return; }
    const dur = 2000, t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      leak.textContent = '$' + fmt(Math.round(TOTAL * e));
      feed.textContent = feedSteps[Math.min(3, Math.floor(p * 4))];
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if (leak) {
    leak.textContent = reduce ? '$' + fmt(TOTAL) : '$0';
    setTimeout(runLedger, reduce ? 0 : 350);
  }

  /* ---------- Clock + business-hours strip (Pretoria time) ---------- */
  function offsetHours(tz, d = new Date()) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      .formatToParts(d).filter(x => x.type !== 'literal').map(x => [x.type, +x.value]));
    return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(d.getTime() / 60000) * 60000) / 3600000;
  }
  const clock = $('#clock'), hours = $('#hours');
  function drawClock() {
    if (!clock) return;
    const now = new Date();
    let sast;
    try {
      sast = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
    } catch { sast = ''; }
    clock.textContent = sast || '--:--';
    if (!hours) return;
    const [h, m] = (sast || '12:00').split(':').map(Number);
    const nowPct = ((h + m / 60) / 24) * 100;
    const zones = [['UK', 'Europe/London'], ['EU', 'Europe/Berlin'], ['US East', 'America/New_York']];
    hours.innerHTML = zones.map(([label, tz]) => {
      let off = 0; try { off = offsetHours(tz, now); } catch { /* keep 0 */ }
      const start = 9 + (2 - off), end = Math.min(24, start + 8);
      return `<div class="row"><span>${label}</span><span class="track"><i style="left:${(start / 24) * 100}%;width:${((end - start) / 24) * 100}%"></i><b class="now" style="left:${nowPct}%"></b></span></div>`;
    }).join('') + '<div class="row"><span></span><span style="display:flex;justify-content:space-between"><span>00</span><span>12</span><span>24</span></span></div>';
  }
  drawClock();
  setInterval(drawClock, 30000);

  /* ---------- Scroll reveal ---------- */
  const rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));

  /* ---------- Lightbox ---------- */
  const lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('#lbImg'), cap = $('#lbCap');
    let opener = null;
    $$('[data-lb]').forEach(b => b.addEventListener('click', () => {
      opener = b;
      img.src = b.dataset.lb;
      img.alt = b.querySelector('img')?.alt || '';
      cap.textContent = b.dataset.cap || '';
      lb.showModal();
    }));
    $('#lbClose').addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => opener && opener.focus());
  }

  /* ================= Lead router demo ================= */
  const form = $('#leadForm');
  if (!form) return;
  const F = n => form.elements.namedItem(n);

  const FREE = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'proton.me'];
  const DISPOSABLE = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'example.com', 'test.com'];
  const REGION = { UK: 'UK and Ireland', EU: 'Europe', USE: 'US East', ZA: 'South Africa', ROW: 'Rest of world' };
  const SIZE = { 1: '1–10', 2: '11–50', 3: '51–200', 4: '201–1,000', 5: '1,000+' };
  const SRC = { demo: 'Demo request', pricing: 'Pricing page', webinar: 'Webinar', ebook: 'Ebook' };
  const SIZE_PTS = { 1: 2, 2: 8, 3: 14, 4: 20, 5: 24 };
  const SRC_PTS = { demo: 30, pricing: 22, webinar: 12, ebook: 6 };
  const SLA = { A: 5, B: 15, C: 60 };

  const START_REPS = [
    { id: 'dan', name: 'Dan Mercer', terr: 'UK', load: 3 },
    { id: 'priya', name: 'Priya Shah', terr: 'UK', load: 2 },
    { id: 'lena', name: 'Lena Vogt', terr: 'EU', load: 2 },
    { id: 'marco', name: 'Marco Bianchi', terr: 'EU', load: 4 },
    { id: 'jordan', name: 'Jordan Ellis', terr: 'USE', load: 3 },
    { id: 'maya', name: 'Maya Brooks', terr: 'USE', load: 1 },
    { id: 'sipho', name: 'Sipho Dlamini', terr: 'ZA', load: 2 },
    { id: 'grace', name: 'Grace Whitman', terr: 'ENT', load: 1 }
  ];
  const START_CRM = [
    { co: 'Riverlight Clinic', name: 'Thandi Naidoo', email: 'thandi@riverlight.co.za', owner: 'sipho' },
    { co: 'Nordlicht Labs', name: 'Tom Becker', email: 'tom.becker@nordlicht.de', owner: 'lena' },
    { co: 'Kestrel Freight', name: 'Ben Carter', email: 'ben@kestrelfreight.co.uk', owner: 'dan' },
    { co: 'Brisa Health', name: 'Lucía Ortega', email: 'lucia@brisahealth.es', owner: 'marco' },
    { co: 'Copperleaf', name: 'Marcus Hale', email: 'marcus@copperleaf.com', owner: 'maya' }
  ];
  const PRESETS = {
    fresh: { name: 'Amara Okafor', company: 'Halden Robotics', email: 'amara@haldenrobotics.com', region: 'UK', size: '4', src: 'demo' },
    dupe: { name: 'Tom Becker', company: 'Nordlicht Labs GmbH', email: 'tom.becker@nordlicht.de', region: 'EU', size: '3', src: 'pricing' },
    near: { name: 'Jaco Venter', company: 'Silverlight Clinic Co.', email: 'jaco@silverlightclinic.co.za', region: 'ZA', size: '2', src: 'webinar' },
    ent: { name: 'Jun Park', company: 'Tidewater Global', email: 'jun.park@tidewaterglobal.com', region: 'USE', size: '5', src: 'demo' },
    junk: { name: 'test test', company: '', email: 'asdf@mailinator.com', region: 'ROW', size: '1', src: 'ebook' }
  };

  let reps, crm, log;
  const reset = () => {
    reps = START_REPS.map(r => ({ ...r }));
    crm = START_CRM.map(r => ({ ...r }));
    log = [];
    renderBoard();
  };
  const repById = id => reps.find(r => r.id === id);

  /* text helpers */
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(co|ltd|limited|inc|gmbh|pty|llc|plc|group|the|sa|bv)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const bigrams = s => { const t = s.replace(/ /g, ''); const o = []; for (let i = 0; i < t.length - 1; i++) o.push(t.slice(i, i + 2)); return o; };
  function dice(a, b) {
    a = norm(a); b = norm(b);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const A = bigrams(a), B = bigrams(b);
    const m = new Map(); B.forEach(x => m.set(x, (m.get(x) || 0) + 1));
    let hit = 0; A.forEach(x => { const c = m.get(x); if (c) { hit++; m.set(x, c - 1); } });
    return (2 * hit) / (A.length + B.length);
  }
  const surname = n => norm(n).split(' ').filter(Boolean).pop() || '';
  const domainOf = e => (e.split('@')[1] || '').toLowerCase().trim();

  /* The router: a pure function. Returns every decision with its reason. */
  function route(lead, reps, crm) {
    const out = { steps: {} };
    // 1. validate
    const email = lead.email.trim().toLowerCase();
    const okEmail = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);
    const dom = domainOf(email);
    const free = FREE.includes(dom);
    const problems = [];
    if (!okEmail) problems.push('email is not valid');
    if (DISPOSABLE.includes(dom)) problems.push(`${dom} is a throwaway domain`);
    if (!lead.company.trim()) problems.push('company is missing');
    if (/^(test|asdf|qwerty|xxx)\b/i.test(lead.name.trim()) || !lead.name.trim()) problems.push('name looks fake');
    if (problems.length) {
      out.steps.validate = { st: 'stop', tag: 'rejected', txt: 'Rejected: ' + problems.join(', ') + '.' };
      out.final = { kind: 'reject', why: 'Bad data never reaches a rep. It goes to a review queue instead, so nobody wastes a call on it.' };
      return out;
    }
    out.steps.validate = { st: free ? 'warn' : 'ok', tag: free ? 'free email' : 'pass', txt: free ? `Valid, but ${dom} is a personal address. Scored lower.` : `Valid business email at ${dom}.` };

    // 2. dedupe: a name match alone is never enough
    let dup = null, colleague = null, lookalike = null;
    for (const r of crm) {
      const rd = domainOf(r.email);
      const sameEmail = r.email.toLowerCase() === email;
      const sameDom = !free && rd === dom;
      const sameSur = surname(r.name) === surname(lead.name);
      const sim = dice(r.co, lead.company);
      if (sameEmail || (sameDom && sameSur) || (sim >= 0.8 && sameSur)) { dup = { r, sim, sameEmail, sameDom, sameSur }; break; }
      if (sameDom && !colleague) colleague = { r };
      if (sim >= 0.8 && !lookalike) lookalike = { r, sim };
    }
    if (dup) {
      const sig = dup.sameEmail ? 'same email' : [dup.sameDom && 'same domain', dup.sameSur && 'same surname', dup.sim >= 0.8 && `company match ${dup.sim.toFixed(2)}`].filter(Boolean).join(' + ');
      out.steps.dedupe = { st: 'warn', tag: 'duplicate', txt: `Matches ${dup.r.name} at ${dup.r.co} (${sig}). Merged, not created twice.`, hit: dup.r };
    } else if (colleague) {
      out.steps.dedupe = { st: 'ok', tag: 'colleague', txt: `Same domain as ${colleague.r.co}, different person. New lead, same account.`, hit: colleague.r };
    } else if (lookalike) {
      out.steps.dedupe = { st: 'ok', tag: 'new', txt: `"${lead.company}" looks like "${lookalike.r.co}" (${lookalike.sim.toFixed(2)}), but there is no second signal. Treated as new.`, hit: lookalike.r };
    } else {
      out.steps.dedupe = { st: 'ok', tag: 'new', txt: 'No match on email, domain or company name.' };
    }

    // 3. score
    const covered = lead.region !== 'ROW';
    const parts = [
      [SRC[lead.src], SRC_PTS[lead.src]],
      [SIZE[lead.size] + ' staff', SIZE_PTS[lead.size]],
      [free ? 'Personal email' : 'Business email', free ? -10 : 12],
      [covered ? 'Covered territory' : 'Outside territories', covered ? 10 : 0]
    ];
    const score = Math.max(0, Math.min(100, parts.reduce((a, p) => a + p[1], 0) + 24));
    const tier = score >= 80 ? 'A' : score >= 62 ? 'B' : score >= 45 ? 'C' : 'D';
    out.score = score; out.tier = tier;
    out.steps.score = { st: tier === 'D' ? 'warn' : 'ok', tag: `${score} · ${tier}`, txt: parts.map(p => `${p[0]} ${p[1] >= 0 ? '+' : ''}${p[1]}`).join(', ') + ', base +24.' };

    // 4. assign
    let owner = null, how;
    if (dup) { owner = dup.r.owner; how = `Existing owner keeps the account, so the buyer talks to one person.`; }
    else if (colleague) { owner = colleague.r.owner; how = `Account owner of ${colleague.r.co} gets the new contact.`; }
    else if (tier === 'D') { owner = null; how = 'Score too low for a rep. Sent to a nurture sequence.'; }
    else if (lead.size === '5') { owner = 'grace'; how = '1,000+ staff goes to the enterprise rep.'; }
    else {
      const pool = reps.filter(r => r.terr === (covered ? lead.region : r.terr) && r.terr !== 'ENT');
      const min = Math.min(...pool.map(r => r.load));
      const pick = pool.find(r => r.load === min);
      owner = pick.id;
      how = covered ? `${REGION[lead.region]} pod, round robin to the rep with the fewest open leads (${min}).` : `No territory, so it goes to the least busy rep overall (${min} open).`;
    }
    out.owner = owner;
    out.steps.assign = { st: owner ? 'ok' : 'warn', tag: owner ? (reps.find(r => r.id === owner) || {}).name.split(' ')[0] : 'nurture', txt: how };

    // 5. alert
    if (owner) {
      const mins = SLA[tier] || 60;
      out.sla = mins;
      out.steps.alert = { st: 'ok', tag: `${mins} min SLA`, txt: `Slack DM to ${(reps.find(r => r.id === owner) || {}).name} with a lead brief. Reply due in ${mins} min, or it escalates to the manager.` };
    } else {
      out.steps.alert = { st: 'skip', tag: '—', txt: 'No rep alert. Marketing gets it.' };
    }
    out.final = { kind: owner ? 'routed' : 'nurture' };
    return out;
  }

  /* rendering */
  function renderBoard(hitRep, hitCrm) {
    const max = Math.max(6, ...reps.map(r => r.load));
    $('#reps').innerHTML = reps.map(r => `<li class="rep${r.id === hitRep ? ' hit' : ''}"><b>${esc(r.name)}</b><span class="n">${r.load}</span><span>${r.terr === 'ENT' ? 'Enterprise, all regions' : REGION[r.terr]}</span><span class="load"><i style="width:${(r.load / max) * 100}%"></i></span></li>`).join('');
    $('#crm').innerHTML = crm.map(r => `<tr${r === hitCrm ? ' class="hit"' : ''}><td>${esc(r.co)}</td><td>${esc(r.name)}</td><td>${esc(domainOf(r.email))}</td><td>${esc(repById(r.owner)?.name || '')}</td></tr>`).join('');
    $('#log').innerHTML = log.slice(0, 4).map(l => `<li><span><b>${esc(l.who)}</b> → ${esc(l.to)}</span><span>${l.ms}</span></li>`).join('');
  }

  const stages = $$('#stages .stage');
  const ORDER = ['validate', 'dedupe', 'score', 'assign', 'alert'];
  const DEFAULT_TXT = stages.map(s => $('p', s).textContent);
  function clearStages() {
    stages.forEach((s, i) => { s.className = 'stage'; $('p', s).textContent = DEFAULT_TXT[i]; $('.ms', s).textContent = ''; });
  }

  const readLead = () => ({
    name: F('name').value, company: F('company').value, email: F('email').value, region: F('region').value,
    size: (form.querySelector('input[name=size]:checked') || {}).value || '3',
    src: (form.querySelector('input[name=src]:checked') || {}).value || 'demo'
  });

  let busy = false;
  async function run() {
    if (busy) return;
    busy = true;
    const btn = $('#goBtn');
    btn.disabled = true;
    clearStages();
    const lead = readLead();

    // measure the real compute: average of 500 runs of the pure router
    const N = 500, t0 = performance.now();
    let res;
    for (let i = 0; i < N; i++) res = route(lead, reps, crm);
    const ms = (performance.now() - t0) / N;

    $('#r-title').textContent = 'Routing…';
    $('#r-sub').textContent = `${lead.name || 'Unnamed'} · ${lead.company || 'no company'}`;
    $('#r-av').textContent = '…';
    $('#r-why').textContent = '';

    let stopped = false;
    for (const [i, key] of ORDER.entries()) {
      const s = stages[i], step = res.steps[key];
      if (stopped || !step) { s.classList.add('skip'); continue; }
      s.classList.add('run');
      await sleep(420);
      s.classList.remove('run');
      s.classList.add(step.st);
      $('p', s).textContent = step.txt;
      $('.ms', s).textContent = step.tag;
      if (key === 'dedupe' && step.hit) renderBoard(null, step.hit);
      if (step.st === 'stop') stopped = true;
      await sleep(120);
    }

    // apply side effects
    let to = 'review queue';
    if (res.final.kind === 'routed') {
      const r = repById(res.owner); r.load++; to = r.name;
    } else if (res.final.kind === 'nurture') to = 'nurture';
    const dupHit = res.steps.dedupe && res.steps.dedupe.tag === 'duplicate';
    if (res.final.kind !== 'reject' && !dupHit) crm.unshift({ co: lead.company.trim(), name: lead.name.trim(), email: lead.email.trim().toLowerCase(), owner: res.owner || '' });
    if (crm.length > 7) crm.length = 7;
    const msTxt = ms < 0.01 ? '<0.01 ms' : ms.toFixed(2) + ' ms';
    log.unshift({ who: lead.name || 'Unnamed', to, ms: msTxt });
    renderBoard(res.owner, null);

    const r = repById(res.owner);
    if (res.final.kind === 'routed') {
      $('#r-av').textContent = r.name[0];
      $('#r-title').textContent = `Routed to ${r.name}`;
      $('#r-sub').textContent = `Score ${res.score}, tier ${res.tier} · reply due in ${res.sla} min`;
      $('#r-why').textContent = res.steps.assign.txt;
    } else if (res.final.kind === 'nurture') {
      $('#r-av').textContent = 'N';
      $('#r-title').textContent = 'Sent to nurture';
      $('#r-sub').textContent = `Score ${res.score}, tier ${res.tier}`;
      $('#r-why').textContent = 'A rep\'s time goes to leads that can buy now. This one gets an email sequence and is rescored if it engages.';
    } else {
      $('#r-av').textContent = '✕';
      $('#r-title').textContent = 'Stopped at the door';
      $('#r-sub').textContent = res.steps.validate.txt;
      $('#r-why').textContent = res.final.why;
    }
    $('#r-ms').innerHTML = (ms < 0.01 ? '&lt;0.01' : ms.toFixed(2)) + '<small>ms</small>';
    btn.disabled = false;
    busy = false;
  }

  form.addEventListener('submit', e => { e.preventDefault(); run(); });
  $$('.preset[data-p]').forEach(b => b.addEventListener('click', () => {
    const p = PRESETS[b.dataset.p];
    F('name').value = p.name; F('company').value = p.company; F('email').value = p.email; F('region').value = p.region;
    form.querySelector(`input[name=size][value="${p.size}"]`).checked = true;
    form.querySelector(`input[name=src][value="${p.src}"]`).checked = true;
    $$('.preset[data-p]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    run();
  }));
  $('#resetBtn').addEventListener('click', () => { reset(); clearStages(); $('#r-title').textContent = 'Waiting for a lead'; $('#r-sub').textContent = 'Pick one above, or press Route.'; $('#r-av').textContent = '?'; $('#r-ms').innerHTML = '0.00<small>ms</small>'; });
  form.addEventListener('input', () => $$('.preset[data-p]').forEach(x => x.setAttribute('aria-pressed', 'false')));

  reset();
})();
