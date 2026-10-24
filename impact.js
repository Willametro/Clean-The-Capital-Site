/* ═══════════════════════════════════════════════════════════
   CLEAN THE CAPITAL — past cleanups + impact totals
   Edit PAST_CLEANUPS below to update the homepage impact
   section and the Transparency page's cleanup report.
   ═══════════════════════════════════════════════════════════ */

/* One entry per cleanup that actually happened, oldest first.
   Leave a value as null until it's known — it shows as "—".
   weight, note: optional free text shown on the homepage card.
   photo: optional path relative to the site root, e.g. 'images/cleanups/2026-05-30.jpg'
   (null shows a text-only card).
   Fill in volunteers/bags from the signed sign-in sheets as they're tallied. */
const PAST_CLEANUPS = [
  /* Earlier cleanups from the EVENTS schedule — text-only, counts not yet logged. */
  { date: '2026-05-30', location: 'Riverfront Park', volunteers: null, bags: null, photo: null },
  { date: '2026-06-13', location: 'Marion Square Park', volunteers: null, bags: null, photo: null },
  { date: '2026-06-27', location: "Bush's Pasture Park", volunteers: null, bags: null, photo: null },
  { date: '2026-07-11', location: 'Oregon State Capitol Mall', volunteers: null, bags: null, photo: null },
  { date: '2026-07-25', location: 'Englewood Park', volunteers: null, bags: null, photo: null },
  { date: '2026-08-08', location: 'Grant School Park', volunteers: null, bags: null, photo: null },
  { date: '2026-08-22', location: 'Highland Park', volunteers: null, bags: null, photo: null },
  { date: '2026-09-05', location: 'Clark Creek Park', volunteers: null, bags: null, photo: null },
  { date: '2026-09-19', location: 'Orchard Heights Park', volunteers: null, bags: null, photo: null },
  { date: '2026-10-03', location: 'Pringle Park', volunteers: null, bags: null, photo: null },
  {
    date: '2026-10-17',
    location: 'Northgate Park',
    volunteers: 3,               // per signed sign-in sheet
    bags: 4,
    weight: 'about 15–20 lbs (estimated)',
    note: 'Large objects flagged for Salem parks crews to remove.',
    photo: 'images/cleanups/2026-10-17-northgate.jpg',
    photoAlt: 'Full bags of trash collected and set beside a bin after the Northgate Park cleanup'
  }
];

/* ── Helpers ────────────────────────────────────────────── */
function impactDate(yyyy_mm_dd, opts) {
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts || { month: 'long', day: 'numeric', year: 'numeric' });
}
function impactNum(n) { return n == null ? '—' : n.toLocaleString('en-US'); }
function impactSum(key) {
  const known = PAST_CLEANUPS.filter(c => c[key] != null);
  return known.length ? known.reduce((t, c) => t + c[key], 0) : null;
}

/* ── Totals row ─────────────────────────────────────────── */
function renderImpactTotals(target) {
  const el = document.querySelector(target);
  if (!el) return;
  const stats = [
    [PAST_CLEANUPS.length, PAST_CLEANUPS.length === 1 ? 'Cleanup held' : 'Cleanups held'],
    [impactSum('volunteers'), 'Volunteer spots logged'],
    [impactSum('bags'), 'Bags of trash logged']
  ];
  el.innerHTML = stats.map(([n, l]) =>
    `<div class="impact-stat"><div class="n">${impactNum(n)}</div><div class="l">${l}</div></div>`
  ).join('');
}

/* ── Homepage: recap cards ──────────────────────────────── */
function renderImpactCards(target) {
  const el = document.querySelector(target);
  if (!el) return;
  el.innerHTML = PAST_CLEANUPS.slice().reverse().map(c => `
    <article class="impact-card">
      ${c.photo
        ? `<img class="impact-photo" src="${c.photo}" alt="${c.photoAlt || ''}" loading="lazy">`
        : ''}
      <div class="impact-body">
        <div class="impact-date">${impactDate(c.date)}</div>
        <h3>${c.location}</h3>
        ${c.volunteers != null || c.bags != null
          ? `<p class="meta"><strong>${impactNum(c.volunteers)}</strong> volunteers · <strong>${impactNum(c.bags)}</strong> bags${c.weight ? ` · ${c.weight}` : ''}</p>`
          : ''}
        ${c.note ? `<p class="meta impact-note">${c.note}</p>` : ''}
      </div>
    </article>`).join('');
}

/* ── Transparency page: cleanup report table ────────────── */
function renderImpactTable(target) {
  const el = document.querySelector(target);
  if (!el) return;
  const rows = PAST_CLEANUPS.map(c => `
    <tr><td>${impactDate(c.date, { month: 'short', day: 'numeric', year: 'numeric' })}</td><td>${c.location}</td>
    <td class="num">${impactNum(c.volunteers)}</td><td class="num">${impactNum(c.bags)}</td></tr>`).join('');
  el.innerHTML = `
    <table class="impact-table">
      <thead><tr><th scope="col">Date</th><th scope="col">Location</th><th scope="col" class="num">Volunteers</th><th scope="col" class="num">Bags</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th scope="row" colspan="2">Total</th><td class="num">${impactNum(impactSum('volunteers'))}</td><td class="num">${impactNum(impactSum('bags'))}</td></tr></tfoot>
    </table>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderImpactTotals('[data-impact-totals]');
  renderImpactCards('[data-impact-cards]');
  renderImpactTable('[data-impact-table]');
});
