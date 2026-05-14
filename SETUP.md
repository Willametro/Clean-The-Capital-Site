# Setup walkthrough — cleanthecapital.org

Two things stand between this repo and a live, working site:

1. **Porkbun DNS** → point `cleanthecapital.org` at GitHub Pages
2. **Formspree** → wire up the volunteer + contact forms so submissions actually email you

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

### 1c. (Optional) Add email forwarding for jacob.powell@willametro.com aliases

Skip this if `willametro.com` already handles mail elsewhere. The site uses `jacob.powell@willametro.com` directly — you don't need any `@cleanthecapital.org` mailboxes unless you want them.

If you later want addresses like `hello@cleanthecapital.org` to forward to your willametro inbox, Porkbun → Domain Details → **Email Forwarding** tab → add `hello → jacob.powell@willametro.com`. No DNS changes needed — Porkbun handles it.

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

## 2. Formspree → working volunteer + contact forms

Goal: when someone submits the volunteer or contact form, you get an email at `jacob.powell@willametro.com`. No backend code, no database — Formspree handles it.

### 2a. Sign up

1. Go to **https://formspree.io/register**
2. Sign up with `jacob.powell@willametro.com` (this is where submissions will land by default)
3. Confirm the email from Formspree
4. The free plan ("Free") allows **50 submissions/month** across all forms. That's plenty for now. Upgrade later if volume justifies it.

### 2b. Create the volunteer form

1. Dashboard → **+ New Form** (or **New Project** → then **+ New Form**)
2. **Form name**: `CTC — Volunteer Signup`
3. **Sending email to**: `jacob.powell@willametro.com` (should be prefilled)
4. Click **Create Form**
5. You'll land on a page showing a **form endpoint URL** like:
   ```
   https://formspree.io/f/abcdwxyz
   ```
   The part after `/f/` is your form ID. Copy the **whole URL**.

### 2c. Create the contact form

Repeat 2b with:
- **Form name**: `CTC — Contact`
- Same destination email
- Copy that endpoint URL too.

You now have two distinct URLs — keep them straight.

### 2d. Paste the URLs into the repo

Edit two files in this repo:

**`get-involved.html`** — find the line:
```html
<form action="https://formspree.io/f/your-form-id" method="POST">
```
Replace `your-form-id` with the **volunteer** form ID.

**`contact.html`** — find the same `your-form-id` placeholder and replace with the **contact** form ID.

Commit and push:

```bash
cd ~/Documents/Clean-The-Capital-Site
git add get-involved.html contact.html
git commit -m "Wire up live Formspree endpoints for volunteer and contact forms"
git push
```

GitHub Pages will redeploy automatically within a minute.

### 2e. Test each form

1. Open `https://cleanthecapital.org/get-involved.html` in a private window
2. Fill out the form with your own email and submit
3. **First submission triggers a Formspree confirmation email** to `jacob.powell@willametro.com` — open it, click **Confirm**. This is one-time per form.
4. Submit the form a second time. You should now receive the actual submission in your inbox.
5. Repeat for the contact form.

### 2f. Recommended Formspree settings (per form)

In the Formspree dashboard, open each form and configure:

- **Settings → Notifications** → confirm `jacob.powell@willametro.com` is the recipient. Add a second recipient (like a partner organizer) if/when you have one.
- **Settings → Reply-To** → set to `email` (the form field). This way you can hit "Reply" in your inbox and reach the volunteer/sender directly.
- **Settings → Spam filter** → enable. Formspree's default Akismet + honeypot is good enough for this volume.
- **Settings → reCAPTCHA** → optional. Worth enabling once volume picks up. Free.
- **Integrations** → if you ever want submissions to also land in Google Sheets, Slack, Notion, etc., this is where you wire that up. Not needed for v1.

### 2g. After-action: confirmation page (nice-to-have, not required)

By default Formspree shows its own "Thanks!" page after submission. If you want users redirected to your own thank-you page:

1. Create a new file `thanks.html` in the repo (copy `404.html` and adapt the copy)
2. In Formspree → form Settings → **After submission** → **Redirect to URL** → `https://cleanthecapital.org/thanks.html`

Skip this for v1 — Formspree's default page is fine.

### Troubleshooting

| Symptom | Fix |
|---|---|
| First submission never arrived | Check spam in jacob.powell@willametro.com. Click Formspree's confirmation link. |
| Submissions go to spam | Add `noreply@formspree.io` to your safe senders. Set up SPF on willametro.com (you likely already have it). |
| 404 on submit | Double-check the form URL — `https://formspree.io/f/XXXXXXXX`, no trailing characters. |
| "Form not found" | The form ID is wrong, or you swapped the volunteer and contact IDs between pages. |
| Submission count climbing without real users | Spam. Enable reCAPTCHA in form Settings. |

---

## Quick checklist

Porkbun DNS:
- [ ] Removed parked-page A/CNAME records
- [ ] Added 4 apex A records (`185.199.108–111.153`)
- [ ] Added `www` CNAME → `willametro.github.io.`
- [ ] GitHub Pages enabled, custom domain saved
- [ ] HTTPS enforced after cert issued

Formspree:
- [ ] Account created with `jacob.powell@willametro.com`
- [ ] Volunteer form created, endpoint copied
- [ ] Contact form created, endpoint copied
- [ ] Both endpoints pasted into the HTML, committed, pushed
- [ ] First test submission confirmed for each form
- [ ] Reply-To set to the email field on both forms
