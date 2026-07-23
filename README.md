# Clean The Capital — cleanthecapital.org

Static GitHub Pages site for **Clean The Capital**, a community-led trash cleanup initiative in Salem, Oregon.

## Stack
- Plain HTML/CSS/JS, no build step
- [Leaflet](https://leafletjs.com/) + OpenStreetMap tiles for the events map
- [Formspree](https://formspree.io/) for volunteer/contact forms (form IDs TBD)
- Hosted via GitHub Pages, custom domain via Porkbun → `CNAME`

## Editing the event schedule

All events are defined in **`events.js`** under the `EVENTS` array.
Updating that one array updates:
- The "Next cleanup" card on the homepage and volunteer page
- The map pins (next event is highlighted)
- The events page list (auto-categorized into past / next / upcoming)
- The volunteer signup form's date dropdown (auto-populated, upcoming events only)
- The JSON-LD `Event` schema injected into the page head (SEO)

**Rotation guidance:** don't just repeat the same handful of flagship parks
(Riverfront, Capitol Mall) every cycle. Favor smaller neighborhood parks for
new dates — less competition for space with other park users, easier
parking, and it spreads visible cleanup impact across more of the city. Mix
in a flagship location occasionally for visibility, but keep cycling through
the wider pool. See the comment above `id: 6` in `events.js` for the current
rotation pool.

To add or modify a cleanup, edit `events.js`:
```js
{
  id: 6,
  date: '2026-08-08',
  timeStart: '14:00',
  timeEnd:   '17:00',
  location: 'Park Name',
  meet: 'Where to gather',
  address: 'Full address for schema',
  lat: 44.94, lng: -123.04,
  notes: 'What this cleanup covers'
}
```

## Local preview
```
python -m http.server 8080
# or
npx serve .
```

## Domain setup (Porkbun → GitHub Pages)
1. In Porkbun DNS for `cleanthecapital.org`:
   - `A` records pointing to GitHub Pages IPs (185.199.108.153, .109.153, .110.153, .111.153)
   - `CNAME` `www` → `willametro.github.io`
2. In repo Settings → Pages: enable Pages from `main` branch root, set custom domain to `cleanthecapital.org`, enable HTTPS.
3. The `CNAME` file in this repo handles the custom-domain binding.

## Pages
- `/` — homepage, hero with next event, pillars, map snippet, donate CTA
- `/events.html` — full map + bi-weekly schedule
- `/about.html` — mission, values, long-term plan
- `/get-involved.html` — volunteer signup form
- `/partners.html` — partner directory + ways to partner
- `/donate.html` — donation methods + transparency note
- `/contact.html` — email + contact form
- `/legal/privacy.html`, `/legal/transparency.html`
- `/404.html`

## Forms
The `action` attribute on volunteer and contact forms currently points to `https://formspree.io/f/your-form-id` — replace with the real Formspree endpoint when set up.
