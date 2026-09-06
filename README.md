# voipcom — marketing site

Static site for **Voipcom System (Pvt) Ltd** (Pakistan). Minimal, professional, built to convert
paid traffic. Four services: call center solutions, cloud PBX, business automation, and
Pakistani DIDs/SIP for AI voice agents. No framework, no build step.

## Pages

**Landing pages (every one captures leads):**
`index.html` · `call-center.html` · `cloud-pbx.html` · `automation.html` · `ai-phone-numbers.html`
· `contact.html` · `pricing.html` → all submit to `thank-you.html` (noindex; put conversion pixels there).

**SEO content (same chrome, `.article/.prose` layout):** `what-is-a-pbx`, `pabx-vs-cloud-pbx`,
`pabx-price-in-pakistan`, `reduce-cod-returns-pakistan`, `glossary`, `learn`, `products`,
`cloud-pbx-pakistan`, `ip-pbx-pakistan`, `pakistan-did-numbers`, `shopify-cod-confirmation`,
`ivr-system-pakistan`, `business-phone-system-pakistan`, `cloud-pbx-{karachi,lahore,islamabad}`.

Infra: `sitemap.xml`, `robots.txt`, `llms.txt`, per-page JSON-LD (Breadcrumb + Service/Article + FAQPage).

## Lead capture (read before launching ads)

`js/site.js` → `CONFIG` at the top:

- `whatsapp` — your WhatsApp number in E.164 without `+` (e.g. `923001234567`). Every
  `data-wa` button and the thank-you page use it. **Currently a placeholder.**
- `endpoint` — optional URL that accepts a JSON POST (Formspree, HubSpot Forms API, your own
  API). Leave empty and leads still flow: the form stores the lead, redirects to
  `thank-you.html`, and offers a prefilled WhatsApp handoff. Set it to also get an email/CRM copy.

Every form (`form[data-lead]`) auto-attaches: `page`, `service`, and any `utm_*` / `gclid` /
`fbclid` captured on landing (kept for the session). Events pushed to `dataLayer`:
`lead_submit` (on submit) and `lead_confirmed` (on thank-you). Paste GA4 / Google Ads / Meta
base code where each page's `<!-- TRACKING -->` comment sits; fire your conversion on
`thank-you.html`.

## Design system

`css/style.css` — tokens at the top. Cool off-white ground `#F6F8F7`, ink `#0B1512`, brand
green `#12A268` for signals only, dark ink footer. Bricolage Grotesque (display) ·
Instrument Sans (body) · JetBrains Mono (labels). Components: `.nav`, `.hero-grid`,
`.lead-card/.lead-form`, `.proof`, `.pas`, `.checks`, `.steps`, `.plans`, `.faq`,
`.cta-band`, `.foot-cols`, plus the article classes for content pages. Scroll-reveal is
JS-gated (`.js .reveal`) so content is always visible without JS.

## Add a landing page

Copy `call-center.html`, change title/meta/canonical/JSON-LD, `data-lead` values, copy and
`data-wa` messages. Keep the header/footer verbatim. Add the URL to `sitemap.xml` and `llms.txt`.

## Run locally

```sh
npx serve -l 5180 .
```

## Deploy

Hosted on GitHub Pages from the `main` branch of the `voipcom-site` repo (static, no build).
Push = deploy. Custom domain: add a `CNAME` file containing `voipcomsystem.com`, then at the
DNS host point `A @` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
`185.199.111.153` and `CNAME www` → `<org>.github.io`; enable "Enforce HTTPS" in repo Settings → Pages.
Keep the existing MX records untouched so email keeps working.

## Before launch

- Set `whatsapp` (and optionally `endpoint`) in `js/site.js`.
- Paste tracking code + thank-you conversion event.
- Confirm plan prices on `pricing.html` (current PKR figures are starting prices).
- Replace `sales@voipcomsystem.com` if a different inbox is used.
