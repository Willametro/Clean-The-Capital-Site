# Setup walkthrough — cleanthecapital.org

Two things stand between this repo and a live, working site:

1. **Porkbun DNS** → point `cleanthecapital.org` at GitHub Pages
2. **Forms** → wire up the volunteer + contact forms so submissions actually email you

Do them in that order. Each section below is a click-by-click walkthrough.

---

## 1. Porkbun DNS → GitHub Pages

Goal: when someone types `cleanthecapital.org`, they land on the site served from this GitHub repo, over HTTPS.

### 1a. Enable GitHub Pages on the repo first

GitHub needs to know we want to publish, and it needs the custom domain saved so it can issue a TLS certificate.

1. Go to **https://github.com/Willametro/Clean-The-Capital-Site/settings/pages**
2. Under **Source**, select **Deploy from a branch**
3. **Branch**: `main` · **Folder**: `/ (root)` · click **Save**
4. Under **Custom domain**, enter: `cleanthecapital.org` → **Save**
   - GitHub will start a DNS check (it will fail until step 1b is done — that's expected)
   - The repo already contains a `CNAME` file, so GitHub will respect it
5. Leave the **Enforce HTTPS** box for later — you can't tick it until DNS resolves and Let's Encrypt issues a certificate (usually 10–30 minutes after DNS propagates)

### 1b. Add DNS records in Porkbun

1. Log in at **https://porkbun.com/account/login**
2. Click **Domain Management** in the top nav
3. Find `cleanthecapital.org` in your domain list → click the **Details** button on the right
4. Click the **DNS** tab (or **DNS Records**)
5. **Delete any existing A, AAAA, ALIAS, or CNAME records for the root (`@`) and `www`** that point to Porkbun's parked page. Keep `MX` records if you're already using Porkbun email forwarding; leave `NS` and `SOA` alone.

6. Add the four **apex A records** (one at a time — Porkbun's UI is one row per record):

   | Type | Host | Answer            | TTL |
   |------|------|-------------------|-----|
   | A    | (blank) | `185.199.108.153` | 600 |
   | A    | (blank) | `185.199.109.153` | 600 |
   | A    | (blank) | `185.199.110.153` | 600 |
   | A    | (blank) | `185.199.111.153` | 600 |

   > Leave the **Host** field empty for the apex (`cleanthecapital.org` itself). Porkbun shows `@` as a placeholder — that's fine.

7. Add the **`www` CNAME**:

   | Type  | Host | Answer                  | TTL |
   |-------|------|-------------------------|-----|
   | CNAME | `www` | `willametro.github.io.` | 600 |

   > The trailing dot in `willametro.github.io.` is optional in Porkbun's form; either works.

8. Save. Porkbun applies changes immediately, but recursive resolvers around the world may take **10 minutes to a few hours** to pick them up.

### 1c. Site email address

The site uses `jacob.powell@cleanthecapital.org` everywhere (contact links, footer, donate, privacy, and as the Formspree recipient). Make sure that mailbox is set up with your email provider before relying on it.

If you later want extra addresses like `hello@cleanthecapital.org`, add them as aliases or forwards to `jacob.powell@cleanthecapital.org` in your email provider.

### 1d. Verify

After ~15 minutes:

```bash
nslookup cleanthecapital.org
# Expect: 185.199.108.153, .109.153, .110.153, .111.153

nslookup www.cleanthecapital.org
# Expect: alias to willametro.github.io
```

Or just open `https://cleanthecapital.org` in your browser. If you see the site, you're done. If you get a certificate warning, wait another 15–30 minutes for Let's Encrypt to finish issuing.

### 1e. Lock it in

1. Back in **GitHub repo → Settings → Pages**
2. Confirm the green checkmark next to your custom domain
3. **Tick "Enforce HTTPS"**

Done. Site is live.

### Troubleshooting

| Symptom | Fix |
|---|---|
| GitHub says "Domain does not resolve" | Wait. DNS hasn't propagated yet. Recheck in 15 min. |
| "Both `www` and apex are required" warning | Make sure you added the `www` CNAME and all 4 apex A records. |
| Cert won't issue (Enforce HTTPS greyed out) | Remove the custom domain in GitHub settings, save, re-add it. Forces GitHub to retry the cert. |
| Old parked page still showing | Clear browser cache or test in a private window. |
| Email forwarding for the willametro side stopped working | You shouldn't have touched willametro DNS — only edit DNS on `cleanthecapital.org`. |

---

## 2. Volunteer + contact forms

The forms are handled by our own Cloudflare Worker, which emails each submission through Resend. Follow **[SETUP-FORMS.md](SETUP-FORMS.md)**.

---

## Quick checklist

Porkbun DNS:
- [ ] Removed parked-page A/CNAME records
- [ ] Added 4 apex A records (`185.199.108–111.153`)
- [ ] Added `www` CNAME → `willametro.github.io.`
- [ ] GitHub Pages enabled, custom domain saved
- [ ] HTTPS enforced after cert issued

Forms:
- [ ] Followed the checklist at the end of SETUP-FORMS.md
