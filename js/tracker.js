/* ============================================================
   BUY ALCHIMIA — Site Analytics Tracker
   Sends page views and click events to the backend.
   Fire-and-forget: never blocks the page.
   ============================================================ */

(function () {
  'use strict';

  /* ---- Config ---- */
  const ENDPOINT = '/api/analytics/event';

  /* ---- Device detection ---- */
  function getDevice() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  /* ---- Send event (non-blocking) ---- */
  function send(payload) {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(ENDPOINT, blob);
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }

  /* ---- Clean page path ---- */
  function getPath() {
    return location.pathname + (location.search ? location.search : '');
  }

  /* ---- Track page view on load ---- */
  function trackPageView() {
    send({
      type: 'pageview',
      url: getPath(),
      referrer: document.referrer || '',
      device: getDevice(),
    });
  }

  /* ---- Throttle helper ---- */
  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn.apply(this, args); }
    };
  }

  /* ---- Click event tracking ---- */
  const CLICK_RULES = [
    /* Rule: { selector, target, labelFn } */
    { selector: '.add-btn',              target: 'add_to_cart',   labelFn: el => el.closest('.product-card')?.querySelector('h3')?.textContent?.trim() || '' },
    { selector: '.quick-view-btn',       target: 'quick_view',    labelFn: el => el.closest('.product-card')?.querySelector('h3')?.textContent?.trim() || '' },
    { selector: 'a.product-card',        target: 'product_click', labelFn: el => el.querySelector('h3')?.textContent?.trim() || '' },
    { selector: '.wish-btn',             target: 'wishlist',      labelFn: el => el.closest('.product-card')?.querySelector('h3')?.textContent?.trim() || '' },
    { selector: '.hero-cta .btn-primary,.hero-cta .btn-gold', target: 'hero_cta_shop',  labelFn: el => el.textContent?.trim() || '' },
    { selector: '.hero-cta .btn-outline',target: 'hero_cta_story', labelFn: el => el.textContent?.trim() || '' },
    { selector: '.whatsapp-fab',         target: 'whatsapp_fab',  labelFn: () => 'WhatsApp' },
    { selector: '.cat-chip',             target: 'category_filter', labelFn: el => el.textContent?.trim() || '' },
    { selector: '.nav-links a',          target: 'nav_link',      labelFn: el => el.textContent?.trim() || '' },
    { selector: '#newsletter-form button[type="submit"], .newsletter .btn-primary', target: 'newsletter_subscribe', labelFn: () => 'Subscribe' },
    { selector: '.btn-primary[data-id], .btn-gold[data-id]', target: 'add_to_cart_detail', labelFn: el => document.querySelector('.pd-info h1')?.textContent?.trim() || '' },
    { selector: '#checkout-btn, a[href="checkout.html"]', target: 'checkout_start', labelFn: () => 'Checkout' },
    { selector: '.search-box button[type="submit"], #search-btn', target: 'search', labelFn: () => 'Search' },
  ];

  const trackClick = throttle(function (e) {
    const path = getPath();
    for (const rule of CLICK_RULES) {
      const el = e.target.closest(rule.selector);
      if (el) {
        let label = '';
        try { label = rule.labelFn(el) || ''; } catch (_) {}
        send({ type: 'click', target: rule.target, label: label.slice(0, 120), url: path });
        return; // only fire the first matching rule
      }
    }
  }, 400);

  /* ---- Init ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
  document.addEventListener('click', trackClick, { passive: true });

})();
