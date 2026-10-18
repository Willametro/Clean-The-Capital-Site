# Setup walkthrough: volunteer + contact forms

The volunteer and contact forms post to a Cloudflare Worker called `ctc-forms`
(`cloudflare/forms/worker.js`). For each submission, the Worker:

1. emails it to `jacob.powell@cleanthecapital.org` through **Resend**, with Reply-To set to the visitor's address
2. sends the visitor an auto-reply (you can turn this off)
3. posts a copy to Discord (optional)
4. redirects the visitor to `/thanks.html`

Cost: $0. The Cloudflare Workers free plan allows 100,000 requests a day, and
the Resend free plan allows 3,000 emails a month. Each submission uses two
emails: one to you and one auto-reply.

Spam protection: there's a hidden honeypot field, a per-field length limit,
and the Worker only accepts posts from cleanthecapital.org.

---

## 1. Resend: create an account and verify the domain

1. Sign up at **https://resend.com** with `jacob.powell@cleanthecapital.org`.
2. Go to **Domains → Add Domain** and enter **`forms.cleanthecapital.org`**. Resend recommends sending from a subdomain, so if it ever has delivery trouble, your main `@cleanthecapital.org` inbox isn't affected. Region **us-east-1** is fine.
   - You don't need to create the subdomain in Porkbun first. Adding the DNS records below is what creates it.
3. Resend shows 3 or 4 DNS records: a DKIM `TXT` at `resend._domainkey.forms`, an `MX` and a `TXT` at `send.forms`, and an optional DMARC `TXT`.
4. In **Porkbun → Domain Management → cleanthecapital.org → DNS**, add each record exactly as Resend shows it. In Porkbun's **Host** box, type only the part before `.cleanthecapital.org` (for example `send.forms` or `resend._domainkey.forms`).
   - These records only affect the `forms` subdomain, so they **don't touch** the MX records for your Porkbun mailbox. Don't edit or delete those.
   - If you already have a DMARC record (`_dmarc`), keep it and skip Resend's.
5. Back in Resend, click **Verify DNS Records**. It usually takes a few minutes, occasionally up to a few hours.
6. Go to **API Keys → Create API Key**, name it `ctc-forms`, and give it **Sending access** to `forms.cleanthecapital.org`. Copy the key now, because Resend only shows it once.

## 2. Cloudflare: deploy the Worker

### Dashboard method (no tools needed)

1. Go to **https://dash.cloudflare.com → Workers & Pages → Create → Create Worker**.
2. **Name:** `ctc-forms`. The site expects the URL `https://ctc-forms.jacobhulk2002.workers.dev`. If your workers.dev subdomain is different, update the `action` URL on the `<form>` tags in `contact.html` and `get-involved.html`.
3. Click **Deploy**, then **Edit code**. Replace everything with the contents of `cloudflare/forms/worker.js`, then click **Deploy**.
4. Go to **Settings → Variables and Secrets** and add:

   | Type | Name | Value |
   |---|---|---|
   | Text | `TO_EMAIL` | `jacob.powell@cleanthecapital.org` |
   | Text | `FROM_EMAIL` | `Clean The Capital <noreply@forms.cleanthecapital.org>` |
   | Text | `SITE_URL` | `https://cleanthecapital.org` |
   | Text | `ALLOWED_ORIGINS` | `https://cleanthecapital.org,https://www.cleanthecapital.org` |
   | Text | `SEND_AUTOREPLY` | `true` (or `false` to turn off auto-replies) |
   | Secret | `RESEND_API_KEY` | the key from step 1.6 |
   | Secret | `DISCORD_WEBHOOK` | optional; a Discord webhook URL to get pinged |

5. Click **Deploy** again so the variables take effect.

### CLI method

```bash
cd cloudflare/forms
npx wrangler deploy                      # plain vars come from wrangler.toml
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put DISCORD_WEBHOOK  # optional
```

## 3. Test

1. Submit the contact form on https://cleanthecapital.org/contact.html using a different email address than your own.
2. You should land on the thanks page, get the submission in your inbox, and get the auto-reply at the test address.
3. Repeat with the volunteer form on `/get-involved.html`.

If you land on "Something went wrong", open **Workers & Pages → ctc-forms → Logs** in Cloudflare. A `Resend error 403` almost always means the domain isn't verified yet or the API key lacks access to it.

## 4. Shut down Formspree

Once both forms work, delete the two forms in the Formspree dashboard. You can also close the account.

---

## Changing the forms

Everything is in the `FORMS` object at the top of `cloudflare/forms/worker.js`:

- **Add a field:** add an `<input name="...">` to the HTML form, then add the same name under that form's `fields`, with a label, a max length, and `required: true` if needed. Fields not listed are ignored.
- **Change the email subject or auto-reply text:** edit `subject` or `autoreply`.
- **Add a new form:** add a new key such as `sponsor: { ... }`, then point a `<form>` at `https://ctc-forms.jacobhulk2002.workers.dev/sponsor`.

After editing, paste the file into the dashboard editor again, or run `npx wrangler deploy`.

## Quick checklist

- [ ] Resend account created, `forms.cleanthecapital.org` added
- [ ] Resend DNS records added in Porkbun and showing **Verified**
- [ ] Resend API key created
- [ ] `ctc-forms` Worker deployed with the variables and `RESEND_API_KEY` secret
- [ ] Contact form test received, with auto-reply
- [ ] Volunteer form test received, with auto-reply
- [ ] Formspree forms deleted
