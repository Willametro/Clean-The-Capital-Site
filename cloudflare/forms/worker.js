/* Cloudflare Worker — Clean The Capital form handler (replaces Formspree).
   The site's <form> tags POST here. Each submission is emailed to TO_EMAIL
   through Resend, optionally echoed to Discord, and the visitor is sent an
   optional auto-reply before being redirected to /thanks.html.

   Deploy:  see ../../SETUP-FORMS.md
   Secrets: RESEND_API_KEY (required), DISCORD_WEBHOOK (optional)
   Vars:    TO_EMAIL, FROM_EMAIL, SITE_URL, ALLOWED_ORIGINS, SEND_AUTOREPLY
            (set in wrangler.toml or the dashboard) */

/* ── Form definitions ────────────────────────────────────────
   Add a form by adding an entry here and pointing a <form> at
   https://<worker-url>/<key>. Fields not listed are ignored. */
const FORMS = {
  contact: {
    label: 'Contact form',
    fields: {
      name:    { label: 'Name',    required: true, max: 120 },
      email:   { label: 'Email',   required: true, max: 200, type: 'email' },
      topic:   { label: 'Topic',   max: 80 },
      message: { label: 'Message', required: true, max: 5000 }
    },
    subject: d => `Contact: ${d.topic || 'General question'} from ${d.name}`,
    autoreply: {
      subject: 'We got your message — Clean The Capital',
      text: d => `Hi ${d.name},\n\nThanks for reaching out to Clean The Capital. We got your message about "${d.topic || 'General question'}" and will get back to you within a few days.\n\n— Clean The Capital, Salem, OR\nhttps://cleanthecapital.org`
    }
  },
  volunteer: {
    label: 'Volunteer signup',
    fields: {
      name:  { label: 'Name',             required: true, max: 120 },
      email: { label: 'Email',            required: true, max: 200, type: 'email' },
      event: { label: 'First cleanup',    max: 120 },
      group: { label: 'Group',            max: 200 },
      notes: { label: 'Notes',            max: 3000 }
    },
    subject: d => `Volunteer signup: ${d.name}${d.event ? ` (${d.event})` : ''}`,
    autoreply: {
      subject: "You're signed up — Clean The Capital",
      text: d => `Hi ${d.name},\n\nThanks for signing up to volunteer with Clean The Capital!${d.event ? `\n\nFirst cleanup you picked: ${d.event}` : ''}\n\nWe provide trash grabbers and bags. Bring water, sun protection and closed-toe shoes. We'll email you event-day details before the cleanup.\n\nSchedule: https://cleanthecapital.org/events.html\n\n— Clean The Capital, Salem, OR`
    }
  }
};

const HONEYPOT = '_gotcha';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const originOk = !origin || allowed.length === 0 || allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': originOk && origin ? origin : (allowed[0] || '*'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Vary': 'Origin'
    };
    const siteUrl = (env.SITE_URL || 'https://cleanthecapital.org').replace(/\/$/, '');
    const wantsJson = (request.headers.get('Accept') || '').includes('application/json');

    const done = (status, formKey, error) => {
      if (wantsJson) {
        return new Response(JSON.stringify(error ? { ok: false, error } : { ok: true }), {
          status, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
      const target = `${siteUrl}/thanks.html?form=${encodeURIComponent(formKey || '')}${error ? '&error=1' : ''}`;
      return Response.redirect(target, 303);
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });
    if (!originOk) return new Response('Forbidden', { status: 403, headers: cors });

    const formKey = url.pathname.replace(/^\/+|\/+$/g, '');
    const form = FORMS[formKey];
    if (!form) return new Response('Unknown form', { status: 404, headers: cors });

    let raw = {};
    try {
      const type = request.headers.get('Content-Type') || '';
      if (type.includes('application/json')) raw = await request.json();
      else Object.assign(raw, Object.fromEntries(await request.formData()));
    } catch {
      return done(400, formKey, 'Could not read the form');
    }

    // Bots fill the hidden honeypot field; pretend success and drop it.
    if (raw[HONEYPOT]) return done(200, formKey);

    const data = {};
    for (const [key, def] of Object.entries(form.fields)) {
      const value = String(raw[key] ?? '').trim().slice(0, def.max || 1000);
      if (def.required && !value) return done(400, formKey, `${def.label} is required`);
      if (value && def.type === 'email' && !EMAIL_RE.test(value)) return done(400, formKey, 'Email address looks invalid');
      data[key] = value;
    }

    if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
      return done(500, formKey, 'Form handler is not configured');
    }

    const rows = Object.entries(form.fields).map(([k, def]) => [def.label, data[k] || '—']);
    const text = rows.map(([l, v]) => `${l}: ${v}`).join('\n');
    const html = `<h2 style="font-family:sans-serif">${escapeHtml(form.label)}</h2>
<table style="font-family:sans-serif;border-collapse:collapse">${rows.map(([l, v]) =>
  `<tr><th align="left" valign="top" style="padding:4px 12px 4px 0">${escapeHtml(l)}</th><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`).join('')}</table>
<p style="font-family:sans-serif;color:#666;font-size:12px">Reply to this email to answer ${escapeHtml(data.name || 'them')} directly.</p>`;

    const sent = await sendEmail(env, {
      from: env.FROM_EMAIL,
      to: [env.TO_EMAIL],
      reply_to: data.email || undefined,
      subject: form.subject(data),
      text, html
    });
    if (!sent) return done(502, formKey, 'Could not send your message, please email us instead');

    if (form.autoreply && env.SEND_AUTOREPLY === 'true' && data.email) {
      ctx.waitUntil(sendEmail(env, {
        from: env.FROM_EMAIL,
        to: [data.email],
        reply_to: env.TO_EMAIL,
        subject: form.autoreply.subject,
        text: form.autoreply.text(data)
      }));
    }

    if (env.DISCORD_WEBHOOK) {
      ctx.waitUntil(fetch(env.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [{
          title: `📬 ${form.label}`,
          color: 0x4ea96b,
          timestamp: new Date().toISOString(),
          fields: rows.map(([name, value]) => ({ name, value: String(value).slice(0, 1000), inline: false }))
        }] })
      }).catch(() => {}));
    }

    return done(200, formKey);
  }
};

async function sendEmail(env, payload) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) console.log('Resend error', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.log('Resend fetch failed', err);
    return false;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
