// voipcom — shared behaviour for every page (no framework).
// Nav toggle · active link · scroll reveal · lead forms (UTM capture, optional
// endpoint POST, dataLayer events, WhatsApp handoff, thank-you redirect).
(() => {
  // ---- site config: change these two before launch ----
  const CONFIG = {
    whatsapp: '920000000000',        // E.164 without "+", e.g. 923001234567
    endpoint: '',                    // optional: Formspree / HubSpot / your API URL that accepts JSON POST
    thankYou: 'thank-you.html',
  };
  window.VOIPCOM = CONFIG;

  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === here) a.classList.add('active');
  });

  /* ---------- reveal (decoration only — never gates above-the-fold content) ---------- */
  const els = document.querySelectorAll('.reveal');
  const show = (el) => el.classList.add('in');
  // anything already inside the first viewport is visible immediately
  els.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight * 1.05) show(el); });
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(show);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    els.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
    // belt and braces: nothing stays hidden longer than 2.5s once it has been scrolled to
    window.addEventListener('load', () => setTimeout(() => {
      els.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) show(el); });
    }, 2500));
  }

  /* ---------- attribution: remember UTM / click ids for the session ---------- */
  const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ttclid'];
  try {
    const q = new URLSearchParams(location.search);
    const found = {};
    KEYS.forEach((k) => { const v = q.get(k); if (v) found[k] = v; });
    if (Object.keys(found).length) {
      found.landing = location.pathname;
      found.referrer = document.referrer || '';
      sessionStorage.setItem('vc_attr', JSON.stringify(found));
    }
  } catch { /* storage blocked — fine */ }
  const attr = (() => { try { return JSON.parse(sessionStorage.getItem('vc_attr') || '{}'); } catch { return {}; } })();

  /* ---------- WhatsApp links: fill the number everywhere ---------- */
  document.querySelectorAll('a[data-wa]').forEach((a) => {
    const msg = a.getAttribute('data-wa') || 'Salaam! I want a demo of voipcom.';
    a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- lead forms ---------- */
  const push = (ev, data) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: ev }, data)); };

  document.querySelectorAll('form[data-lead]').forEach((form) => {
    // hidden attribution fields
    const hid = (n, v) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = n; i.value = v; form.appendChild(i); };
    hid('page', location.pathname);
    hid('service', form.getAttribute('data-lead') || 'general');
    Object.entries(attr).forEach(([k, v]) => hid(k, v));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      data.submitted_at = new Date().toISOString();

      // quick sanity: phone should look like a Pakistani mobile/landline
      const phone = (data.phone || '').replace(/[^\d+]/g, '');
      if (phone.length < 9) { form.querySelector('[name="phone"]')?.focus(); return; }

      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
      push('lead_submit', { service: data.service, page: data.page });

      if (CONFIG.endpoint) {
        try {
          await fetch(CONFIG.endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data), keepalive: true,
          });
        } catch { /* never block the user on a failed post */ }
      }
      try { sessionStorage.setItem('vc_lead', JSON.stringify(data)); } catch {}
      location.href = `${CONFIG.thankYou}?s=${encodeURIComponent(data.service || 'general')}`;
    });
  });

  /* ---------- thank-you page: prefilled WhatsApp continue button ---------- */
  const ty = document.querySelector('[data-thankyou]');
  if (ty) {
    let lead = {};
    try { lead = JSON.parse(sessionStorage.getItem('vc_lead') || '{}'); } catch {}
    push('lead_confirmed', { service: lead.service || new URLSearchParams(location.search).get('s') || 'general' });
    const nameEl = ty.querySelector('[data-lead-name]');
    if (nameEl && lead.name) nameEl.textContent = lead.name.split(' ')[0];
    const wa = ty.querySelector('a[data-wa-lead]');
    if (wa) {
      const lines = [
        `Salaam! I just requested a demo on voipcom.`,
        lead.name ? `Name: ${lead.name}` : null,
        lead.business ? `Business: ${lead.business}` : null,
        lead.city ? `City: ${lead.city}` : null,
        lead.service ? `Interested in: ${lead.service}` : null,
      ].filter(Boolean).join('\n');
      wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines)}`;
      wa.target = '_blank'; wa.rel = 'noopener';
    }
  }
})();
