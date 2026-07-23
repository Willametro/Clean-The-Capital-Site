/* ═══════════════════════════════════════════════════════════
   CLEAN THE CAPITAL — events data + UI logic
   Edit EVENTS below to update the schedule sitewide.
   ═══════════════════════════════════════════════════════════ */

const EVENTS = [
  {
    id: 1,
    date: '2026-05-30',          // YYYY-MM-DD, local (Salem, OR)
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Riverfront Park',
    meet: 'Meet at the Eco-Earth Globe',
    address: 'Riverfront Park, 200 Water St NE, Salem, OR 97301',
    lat: 44.9412, lng: -123.0440,
    notes: 'Riverside walkways and downtown perimeter. Supplies and gloves provided — bring water and closed-toe shoes.'
  },
  {
    id: 2,
    date: '2026-06-13',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Marion Square Park',
    meet: 'Meet at the gazebo near Front St NE',
    address: 'Marion Square Park, Front St NE, Salem, OR 97301',
    lat: 44.9472, lng: -123.0399,
    notes: 'Bridge approaches and underpasses. Groups will split between street level and lower park paths.'
  },
  {
    id: 3,
    date: '2026-06-27',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: "Bush's Pasture Park",
    meet: 'Meet at Soap Box Derby Hill (Mission St SE entrance)',
    address: "Bush's Pasture Park, 600 Mission St SE, Salem, OR 97302",
    lat: 44.9282, lng: -123.0353,
    notes: 'Trails, picnic areas, and rose garden perimeter. Family-friendly — kids welcome with a guardian.'
  },
  {
    id: 4,
    date: '2026-07-11',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Oregon State Capitol Mall',
    meet: 'Meet at the Capitol east steps',
    address: 'Oregon State Capitol, 900 Court St NE, Salem, OR 97301',
    lat: 44.9382, lng: -123.0298,
    notes: 'Capitol grounds, Willson Park, and the State St corridor. High-visibility cleanup near civic landmarks.'
  },
  {
    id: 5,
    date: '2026-07-25',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Englewood Park',
    meet: 'Meet at the park gazebo (19th St NE side)',
    address: 'Englewood Park, 1260 19th St NE, Salem, OR 97301',
    lat: 44.9588, lng: -123.0223,
    notes: 'Neighborhood streets and park grounds. Quieter route — good first-timer event.'
  },
  /* ── Fall rotation ──────────────────────────────────────
     Starting in August we're weighting new dates toward smaller
     neighborhood parks rather than repeating the busiest downtown
     spots every time — less competition for space with other park
     visitors, easier parking, and it spreads cleanup coverage across
     more of Salem. When adding future dates, pull from (or add to)
     this same pool and keep cycling through it rather than settling
     on just a couple of locations. */
  {
    id: 6,
    date: '2026-08-08',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Grant School Park',
    meet: 'Meet at the play structure near Cottage St NE',
    address: 'Grant School Park, 1390 Cottage St NE, Salem, OR 97301',
    lat: 44.9516, lng: -123.0268,
    notes: 'Quiet residential streets around the Grant neighborhood park and school. Low-traffic route — a good one for first-timers and families.'
  },
  {
    id: 7,
    date: '2026-08-22',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Highland Park',
    meet: 'Meet at the tennis and pickleball courts off Broadway St NE',
    address: 'Highland Park, 2025 Broadway St NE, Salem, OR 97301',
    lat: 44.9593, lng: -123.0292,
    notes: 'Highland neighborhood streets and park grounds, a calmer route well away from downtown foot and car traffic.'
  },
  {
    id: 8,
    date: '2026-09-05',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Clark Creek Park',
    meet: 'Meet at the picnic shelter near Ratcliff Dr SE',
    address: 'Clark Creek Park, 745 Ratcliff Dr SE, Salem, OR 97302',
    lat: 44.9106, lng: -123.0394,
    notes: 'South Salem creekside paths and surrounding residential streets. Quiet, shaded, and family-friendly.'
  },
  {
    id: 9,
    date: '2026-09-19',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Orchard Heights Park',
    meet: 'Meet at the pickleball courts off Orchard Heights Rd NW',
    address: 'Orchard Heights Park, 1165 Orchard Heights Rd NW, Salem, OR 97304',
    lat: 44.9584, lng: -123.0613,
    notes: 'West Salem hillside park and nearby neighborhood streets. Fewer crowds than our downtown routes.'
  },
  {
    id: 10,
    date: '2026-10-03',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Pringle Park',
    meet: 'Meet at the Pringle Community Hall parking lot on Church St SE',
    address: 'Pringle Park, 606 Church St SE, Salem, OR 97301',
    lat: 44.9339, lng: -123.0369,
    notes: 'Pringle Creek banks and the surrounding park grounds. Shaded and low-traffic — a good pick for a cooler fall afternoon.'
  },
  {
    id: 11,
    date: '2026-10-17',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Northgate Park',
    meet: 'Meet at the playground near Fairhaven Ave NE',
    address: 'Northgate Park, 3575 Fairhaven Ave NE, Salem, OR 97301',
    lat: 44.9725, lng: -122.9937,
    notes: 'Northgate neighborhood streets and park grounds. Quiet residential route, well suited to first-timers.'
  },
  {
    id: 12,
    date: '2026-10-31',
    timeStart: '14:00',
    timeEnd:   '17:00',
    location: 'Cascades Gateway Park',
    meet: 'Meet at the main parking lot off Turner Rd SE',
    address: 'Cascades Gateway Park, 2100 Turner Rd SE, Salem, OR 97302',
    lat: 44.9120, lng: -122.9920,
    notes: 'Open trails and fields on the edge of the city, away from downtown foot traffic. Bring a layer — it runs a bit more exposed than our park cleanups.'
  }
];

/* ── Helpers ────────────────────────────────────────────── */
function parseLocalDate(yyyy_mm_dd, hhmm) {
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  const [hh, mm]  = (hhmm || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}
function fmtDate(d, opts) {
  return d.toLocaleDateString('en-US', opts || { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtTimeRange(s, e) {
  const f = t => {
    const [h, m] = t.split(':').map(Number);
    const dt = new Date(2000, 0, 1, h, m);
    return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: m ? '2-digit' : undefined });
  };
  return `${f(s)} – ${f(e)}`;
}
function getNextEvent() {
  const now = new Date();
  return EVENTS.find(ev => parseLocalDate(ev.date, ev.timeEnd) >= now) || null;
}
function statusFor(ev) {
  const now  = new Date();
  const next = getNextEvent();
  const end  = parseLocalDate(ev.date, ev.timeEnd);
  if (end < now) return 'past';
  if (next && next.id === ev.id) return 'next';
  return 'future';
}

/* ── Hero: next-event card ──────────────────────────────── */
function renderNextEventCard(target) {
  const el = document.querySelector(target);
  if (!el) return;
  const ev = getNextEvent();
  if (!ev) {
    el.innerHTML = `
      <div class="nec-tag"><span class="pulse"></span> Next cleanup</div>
      <div class="nec-body">
        <div class="nec-date">More dates coming</div>
        <div class="nec-time">Check back soon — fall schedule in planning.</div>
      </div>`;
    return;
  }
  const d = parseLocalDate(ev.date, ev.timeStart);
  el.innerHTML = `
    <div class="nec-tag"><span class="pulse"></span> Next cleanup</div>
    <div class="nec-body">
      <div class="nec-date">${fmtDate(d, { weekday:'long', month:'long', day:'numeric' })}</div>
      <div class="nec-time">${fmtTimeRange(ev.timeStart, ev.timeEnd)}</div>
      <div class="nec-loc">
        <strong>${ev.location}</strong>
        <span>${ev.meet}</span>
      </div>
      <div class="nec-actions">
        <a class="btn btn-primary" href="get-involved.html">Join us</a>
        <a class="btn btn-outline" href="events.html">All dates</a>
      </div>
    </div>`;
}

/* ── Events page: list ──────────────────────────────────── */
function renderEventList(target) {
  const el = document.querySelector(target);
  if (!el) return;
  el.innerHTML = EVENTS.map(ev => {
    const d = parseLocalDate(ev.date, ev.timeStart);
    const status = statusFor(ev);
    const badge =
      status === 'next' ? '<span class="ec-badge">Next up</span>' :
      status === 'past' ? '<span class="ec-badge">Completed</span>' :
                          '<span class="ec-badge" style="background:var(--leaf-soft);color:var(--forest)">Upcoming</span>';
    return `
      <article class="event-card is-${status}" data-id="${ev.id}">
        <div class="ec-date">
          <div class="m">${d.toLocaleDateString('en-US',{month:'short'})}</div>
          <div class="d">${d.getDate()}</div>
          <div class="y">${d.getFullYear()}</div>
        </div>
        <div class="ec-body">
          <h3>${ev.location}</h3>
          <p class="meta"><strong>${fmtTimeRange(ev.timeStart, ev.timeEnd)}</strong> · ${ev.meet}</p>
          <p class="meta muted" style="margin-top:.4rem;font-size:.9rem">${ev.notes}</p>
        </div>
        ${badge}
      </article>`;
  }).join('');
}

/* ── Volunteer form: keep the date dropdown in sync ─────── */
function renderEventOptions(target) {
  const el = document.querySelector(target);
  if (!el) return;
  EVENTS.filter(ev => statusFor(ev) !== 'past').forEach(ev => {
    const d = parseLocalDate(ev.date, ev.timeStart);
    const opt = document.createElement('option');
    opt.textContent = `${fmtDate(d, { month: 'long', day: 'numeric' })} — ${ev.location}`;
    el.appendChild(opt);
  });
}

/* ── Map (Leaflet) ──────────────────────────────────────── */
function renderMap(target) {
  const el = document.querySelector(target);
  if (!el || typeof L === 'undefined') return;

  const center = [44.9429, -123.0351]; // downtown Salem
  const map = L.map(el, { scrollWheelZoom: false }).setView(center, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const colors = { next: '#f5b942', future: '#4ea96b', past: '#b9beb6' };
  const bounds = [];
  EVENTS.forEach(ev => {
    const status = statusFor(ev);
    const color = colors[status];
    const isNext = status === 'next';
    const marker = L.circleMarker([ev.lat, ev.lng], {
      radius: isNext ? 14 : 10,
      color: '#ffffff',
      weight: 2,
      fillColor: color,
      fillOpacity: status === 'past' ? 0.55 : 0.95
    }).addTo(map);

    const d = parseLocalDate(ev.date, ev.timeStart);
    marker.bindPopup(`
      <strong>${ev.location}</strong>
      ${fmtDate(d, { weekday:'short', month:'short', day:'numeric', year:'numeric' })}<br>
      <small>${fmtTimeRange(ev.timeStart, ev.timeEnd)} · ${ev.meet}</small>
    `);
    if (isNext) marker.openPopup();
    bounds.push([ev.lat, ev.lng]);
  });
  if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
}

/* ── JSON-LD Event schema injection ─────────────────────── */
function injectEventSchema() {
  const upcoming = EVENTS.filter(ev => statusFor(ev) !== 'past');
  if (!upcoming.length) return;
  const data = upcoming.map(ev => ({
    // NOTE: -07:00 is Pacific Daylight Time. Oregon falls back to PST
    // (-08:00) on the first Sunday of November — update this offset for
    // any event dated on or after that switchover.
    "@context": "https://schema.org",
    "@type": "Event",
    "name": `Clean The Capital — ${ev.location} Cleanup`,
    "startDate": `${ev.date}T${ev.timeStart}:00-07:00`,
    "endDate":   `${ev.date}T${ev.timeEnd}:00-07:00`,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": ev.location,
      "address": ev.address
    },
    "organizer": {
      "@type": "Organization",
      "name": "Clean The Capital",
      "url": "https://cleanthecapital.org"
    },
    "description": ev.notes,
    "isAccessibleForFree": true
  }));
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.text = JSON.stringify(data);
  document.head.appendChild(tag);
}

/* ── Nav toggle ─────────────────────────────────────────── */
function initNav() {
  const btn = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('open'));
}

/* ── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  injectEventSchema();
  renderNextEventCard('[data-next-event]');
  renderEventList('[data-event-list]');
  renderEventOptions('#event');
  renderMap('#map');
  // footer year
  const y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
});
