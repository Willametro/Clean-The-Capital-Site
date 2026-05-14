# Setup walkthrough — Cloudflare Worker visitor logger

This site posts a small JSON blob to a Cloudflare Worker every time a visitor
loads (and unloads) a page. The Worker enriches the data with Cloudflare's
edge geo/network info and forwards a Discord embed to the configured webhook.

You need **one Worker per site** (because each forwards to a different Discord
channel). This document walks you through deploying the Worker for
**Clean The Capital**. The same steps apply to the Andrade site — just use a
different name and a different webhook URL.

---

## What you need

- A Cloudflare account (free tier is fine — Workers free plan = 100,000 requests/day)
- The Discord webhook URL for the **#clean-the-capital** channel:
  `https://discord.com/api/webhooks/1504515884658589796/YO2zG7KnbonDA63M3oEJsvW0Ul1CEVCTAFm80rjaJ0E7CTz-Yp0aWxoUzTLKvfKQzvyj`
  *(Keep this URL secret. It goes into a Cloudflare encrypted secret — never into the Worker source code.)*
- 10 minutes

---

## 1. Create the Worker (dashboard method)

1. Sign in at **https://dash.cloudflare.com**
2. In the left sidebar: **Workers & Pages** → **Create application** → **Create Worker**
3. **Name:** `ctc-visitor-logger`
   - This sets the URL to `https://ctc-visitor-logger.<your-account>.workers.dev/`
   - The existing site code at `/tracker.js` expects `ctc-visitor-logger.jacobhulk2002.workers.dev`. If your workers.dev subdomain is something different, you'll need to update line 7 of `tracker.js` accordingly.
4. Click **Deploy** to ship the boilerplate "Hello World" Worker first — this is just to get the URL allocated.

## 2. Replace the Worker source

1. From the deployed worker's page, click **Edit code** (top right)
2. Delete everything in the editor
3. Paste the contents of **`cloudflare/worker.js`** from this repo
4. Click **Save and deploy**

## 3. Add the Discord webhook as a secret

The Worker reads the webhook URL from `env.DISCORD_WEBHOOK`. **Never** put the
webhook URL in the source code — anyone who can read the Worker's source could
spam your channel.

1. Go to the Worker's **Settings** tab → **Variables and Secrets**
2. Click **Add** → set:
   - **Variable type:** `Secret` *(critical — not "plain text")*
   - **Variable name:** `DISCORD_WEBHOOK`
   - **Value:** the full webhook URL: `https://discord.com/api/webhooks/1504515884658589796/YO2zG7KnbonDA63M3oEJsvW0Ul1CEVCTAFm80rjaJ0E7CTz-Yp0aWxoUzTLKvfKQzvyj`
3. **Save**
4. Cloudflare will tell you the secret is bound. The next request will pick it up automatically (or click **Deploy** to be safe).

## 4. (Optional) Lock down CORS

By default the Worker accepts requests from any origin. If you want to lock it
to only your site, edit `worker.js` and replace:

```js
const origin = request.headers.get('Origin') || '*';
```

with:

```js
const allowed = ['https://cleanthecapital.org', 'https://www.cleanthecapital.org'];
const requestOrigin = request.headers.get('Origin') || '';
const origin = allowed.includes(requestOrigin) ? requestOrigin : 'null';
```

Then redeploy. Skip this for v1 — keeping it permissive makes local testing easier.

## 5. Verify

1. Open `https://cleanthecapital.org/` in a private browser window
2. Within 1–3 seconds, you should see a Discord embed in `#clean-the-capital` like:
   ```
   🌿 Visitor arrived
   Page:    https://cleanthecapital.org/
   Geo:     Salem, Oregon, US (America/Los_Angeles)
   IP:      72.x.x.x
   Network: COMCAST · AS7922
   Referrer: direct
   User-Agent: Mozilla/5.0 ...
   ...
   ```
3. Close the tab — within a few seconds you should see a follow-up `👋 Visitor left` embed with the session duration.

If nothing arrives, see **Troubleshooting** below.

---

## Repeat for the Andrade site

Same procedure, different values:

| Setting | Andrade value |
|---|---|
| Worker name | `andrade-visitor-logger` |
| Worker URL  | `https://andrade-visitor-logger.<account>.workers.dev/` |
| Webhook secret | `https://discord.com/api/webhooks/1504513037338546267/HRtODd6KrE343jfAMZWO3RyCKUVPlwNtlKyTRUMCvhtrSGda6Ah8rplWsLz1I1bHZbnq` |
| Discord channel | `#andrade-construction` |
| `tracker.js` endpoint | already wired to `andrade-visitor-logger.jacobhulk2002.workers.dev` in the Andrade repo |

The Worker source is **identical** for both sites — only the `DISCORD_WEBHOOK`
secret differs. Use the same `cloudflare/worker.js` from this repo (a copy also
lives in the Andrade repo).

---

## Deploy via wrangler CLI (optional alternative)

If you prefer command line over the dashboard:

```bash
# from cloudflare/ in this repo
npm i -g wrangler
wrangler login
wrangler deploy
wrangler secret put DISCORD_WEBHOOK
# paste the webhook URL when prompted
```

`wrangler.toml` in `cloudflare/` is already configured with the Worker name and
entry point.

---

## What gets sent

Every page load posts JSON like:

```json
{
  "sid": "a8b3c712-fae4-4ef8-...",
  "event": "load",
  "url": "https://cleanthecapital.org/events.html",
  "referrer": "https://www.google.com/",
  "screen": "1920x1080",
  "viewport": "1456x789",
  "dpr": 1,
  "tz": "America/Los_Angeles",
  "lang": "en-US",
  "platform": "Win32",
  "cores": 16,
  "mem": 8,
  "touch": 0,
  "webdriver": false,
  "plugins": 5,
  "notChrome": false,
  "duration": 0
}
```

The Worker adds (from Cloudflare's edge):
- **IP** (`CF-Connecting-IP`)
- **User-Agent**
- **Geo:** city, region, country, timezone
- **Network:** ISP/ASN

…and posts a Discord embed with all of it.

The unload event sends a smaller payload (`event: "unload"`, `duration: 47`, etc.)
via `navigator.sendBeacon`, so the duration metric is recorded even when the user
closes the tab quickly.

## Privacy note

Visitors are not anonymized — full IP, geo, and fingerprinting fields are logged
to a Discord channel only you can see. This is fine for a small site and is
consistent with the existing Willametro setup, but if Clean The Capital ever
gets formal nonprofit status with a published privacy policy, you may want to:
- Truncate the IP to /24 in the Worker before forwarding
- Drop the fingerprint fields (cores / mem / touch / plugins)
- Or replace this entirely with a privacy-respecting analytics tool (Cloudflare Web Analytics is built-in and free)

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Discord channel is silent after visiting the site | Open the Worker's **Logs** tab in Cloudflare. If you see `env.DISCORD_WEBHOOK is undefined`, the secret didn't save — re-add it as **Secret**, not plain text. |
| 405 errors in the browser console | `tracker.js` is hitting the Worker via GET (cache or browser preflight retry). Hard-refresh once; the POST should succeed. |
| `CORS error` in console | The Worker URL in `tracker.js` doesn't match the deployed Worker URL (typo, wrong account subdomain, or http vs https). Compare them carefully. |
| Embeds arrive but say `Geo: unknown` | The request is being proxied through something that strips `request.cf` (rare). Usually fine for end users. |
| Spam / repeated visits from the same IP | That's probably you. You can quiet your own visits by adding an early-return for your IP at the top of the worker's fetch handler. |
| Worker hits the free-tier limit (100k req/day) | Realistic for a small site = not happening. If you ever do, upgrade to the $5/mo paid plan for 10M req/day. |

## Quick checklist

- [ ] Cloudflare account created
- [ ] Worker named `ctc-visitor-logger` deployed
- [ ] `worker.js` source pasted in and deployed
- [ ] `DISCORD_WEBHOOK` added as a **Secret** (not plain var)
- [ ] Test visit produces a Discord embed in the CTC channel
- [ ] Same procedure repeated for the Andrade site
- [ ] (Optional) CORS locked to the production domains
