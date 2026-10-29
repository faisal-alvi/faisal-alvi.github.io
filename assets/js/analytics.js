/*
 * GA4 loader, Consent Mode defaults and commercial-intent click events.
 * Single source of truth for the measurement ID. Loaded with `defer` from
 * _layouts/default.html and index.html. See docs/analytics.md.
 *
 * - Production hosts load gtag.js. Any other host (localhost, previews) only
 *   logs events to the console, so dev traffic never reaches GA4.
 * - No form values, emails or free text are ever sent. Only fixed labels.
 */
(function () {
    'use strict';

    var GA_ID = 'G-7JH7HHRTV6';
    var PROD_HOSTS = ['faisalalvi.com', 'www.faisalalvi.com'];
    var IS_PROD = PROD_HOSTS.indexOf(location.hostname) !== -1;
    var BOOKING_HOST = 'calendly.com';
    // Banner is switched on via data-consent-banner="true" on the script tag.
    var SCRIPT = document.currentScript;
    var BANNER_ON = !!(SCRIPT && SCRIPT.getAttribute('data-consent-banner') === 'true');
    var CONSENT_KEY = 'fa_analytics_consent';

    // ---- Consent Mode defaults (before any config call) -------------------
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    var DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
    var stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    // EEA + UK + Switzerland: analytics denied until the visitor opts in.
    gtag('consent', 'default', Object.assign({}, DENIED, {
        region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'],
        wait_for_update: 500
    }));
    // Everywhere else: analytics on, ads signals off (no ads are run).
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });

    if (stored === 'granted') gtag('consent', 'update', { analytics_storage: 'granted' });
    if (stored === 'denied') gtag('consent', 'update', { analytics_storage: 'denied' });

    // ---- Page classification ----------------------------------------------
    var path = location.pathname.replace(/\/+$/, '/') || '/';
    var SERVICES = {
        '/care-plan/': 'care_plan',
        '/woocommerce-audit/': 'woocommerce_audit',
        '/hack-recovery/': 'hack_recovery',
        '/woocommerce-ga4-audit/': 'ga4_audit'
    };
    // Own products and tools: link clicks become click_product.
    var PRODUCTS = {
        '/culpritly/': 'culpritly',
        '/teamwork-timelogger/': 'teamwork_timelogger',
        '/dev-dashboard/': 'dev_dashboard',
        '/schedule-demo/': 'personal_schedule',
        '/tools/': 'tools_index'
    };
    var SOCIAL = {
        'linkedin.com': 'linkedin', 'github.com': 'github', 'profiles.wordpress.org': 'wordpress_org',
        'wordpress.org': 'wordpress_org', 'twitter.com': 'x', 'x.com': 'x'
    };
    var pageType = 'other';
    if (path === '/') pageType = 'home';
    else if (SERVICES[path]) pageType = 'service';
    else if (path === '/blog/') pageType = 'blog_index';
    else if (path.indexOf('/blog/') === 0) pageType = 'blog_post';
    else if (path === '/case-studies/') pageType = 'case_study_index';
    else if (path.indexOf('/case-studies/') === 0) pageType = 'case_study';
    else if (path === '/portfolio/') pageType = 'portfolio';
    else if (path === '/tools/' || path === '/schedule-demo/') pageType = 'tools';
    else if (path === '/privacy/') pageType = 'privacy';

    // ---- Load GA4 ---------------------------------------------------------
    gtag('js', new Date());
    gtag('config', GA_ID, { page_type: pageType });
    if (IS_PROD) {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
    }

    function track(name, params) {
        params = params || {};
        params.page_type = pageType;
        gtag('event', name, params);
        if (!IS_PROD && window.console) console.log('[analytics]', name, params);
    }
    window.faTrack = track; // used by the homepage form success handler

    if (SERVICES[path]) track('view_service', { service_name: SERVICES[path] });

    // ---- Click classification ---------------------------------------------
    function location_of(a) {
        if (a.closest('nav')) return 'nav';
        if (a.closest('footer')) return 'footer';
        if (/sticky/.test(a.className)) return 'sticky';
        if (a.closest('.post-cta')) return 'post_cta';
        if (a.closest('article')) return 'article_body';
        if (a.closest('header')) return 'header';
        return 'body';
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href') || '';
        var url;
        try { url = new URL(href, location.href); } catch (err) { return; }

        var base = {
            cta_location: location_of(a),
            cta_text: (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40)
        };

        if (url.protocol === 'mailto:') {
            track('click_email', { cta_location: base.cta_location });
        } else if (url.protocol === 'tel:') {
            track('click_phone', { cta_location: base.cta_location });
        } else if (url.hostname === BOOKING_HOST) {
            base.cta_destination = 'calendly';
            track('click_book_call', base);
        } else if (url.origin !== location.origin) {
            var host = url.hostname.replace(/^www\./, '');
            if (SOCIAL[host] && !a.closest('.folio, .folio-card, [class*="folio-"]')) {
                track('click_social', { network: SOCIAL[host], cta_location: base.cta_location });
            } else if (a.closest('[class*="folio-"]')) {
                base.link_domain = host;
                track('click_portfolio', base);
            }
        } else if (url.origin === location.origin) {
            var p = url.pathname.replace(/\/+$/, '/');
            if (PRODUCTS[p] && p !== path) {
                base.product_name = PRODUCTS[p];
                track('click_product', base);
            } else if (a.closest('[class*="folio-"]') && p !== path) {
                track('click_portfolio', base);
            } else if (p === '/woocommerce-ga4-audit/') {
                base.cta_destination = 'ga4_audit';
                track('click_free_audit', base);
            } else if (SERVICES[p] && p !== path) {
                base.service_name = SERVICES[p];
                track('click_service_cta', base);
            } else if (p.indexOf('/case-studies/') === 0 && p !== '/case-studies/' && p !== path) {
                base.content_slug = p.split('/')[2];
                track('click_case_study', base);
            } else if (url.hash === '#contact' && p === path) {
                track('click_contact', base);
            }
        }
    }, true);

    // ---- Section views (homepage only): which parts of the pitch get seen ---
    var SECTIONS = ['clients', 'services', 'portfolio', 'work', 'care', 'about', 'faq', 'culpritly', 'contact'];
    if (path === '/' && 'IntersectionObserver' in window) {
        document.addEventListener('DOMContentLoaded', function () {
            var seen = {};
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    var id = en.target.id;
                    if (en.isIntersecting && !seen[id]) {
                        seen[id] = true;
                        io.unobserve(en.target);
                        track('view_section', { section_name: id });
                    }
                });
            }, { threshold: 0.35 });
            SECTIONS.forEach(function (id) {
                var el = document.getElementById(id);
                if (el) io.observe(el);
            });
        });
    }

    // ---- Contact form: started (typed or focused) vs submitted -------------
    document.addEventListener('focusin', function (e) {
        var f = e.target.closest && e.target.closest('form');
        if (!f || f.getAttribute('data-fa-started')) return;
        f.setAttribute('data-fa-started', '1');
        track('form_start', { form_type: f.id === 'v2ContactForm' ? 'contact_form' : 'other_form' });
    });

    // ---- Blog: counts a real read, not a bounce ---------------------------
    if (pageType === 'blog_post') {
        var t0 = Date.now(), readSent = false;
        var onScroll = function () {
            if (readSent) return;
            var art = document.querySelector('article') || document.body;
            var r = art.getBoundingClientRect();
            var total = art.offsetHeight - window.innerHeight;
            var done = total <= 0 ? 1 : (-r.top) / total;
            if (done >= 0.75) {
                readSent = true;
                window.removeEventListener('scroll', onScroll);
                track('blog_read', { content_slug: path.split('/').filter(Boolean).pop(), read_seconds: Math.round((Date.now() - t0) / 1000) });
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ---- AI assistants as a traffic source (once per session) -------------
    (function () {
        var AI = {
            'chatgpt.com': 'chatgpt', 'chat.openai.com': 'chatgpt', 'perplexity.ai': 'perplexity',
            'claude.ai': 'claude', 'gemini.google.com': 'gemini', 'copilot.microsoft.com': 'copilot',
            'you.com': 'you', 'phind.com': 'phind', 'kagi.com': 'kagi'
        };
        var src = '', ref = '', utm = '';
        try { ref = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (e) {}
        try { utm = (new URLSearchParams(location.search).get('utm_source') || '').replace(/^www\./, ''); } catch (e) {}
        src = AI[ref] || AI[utm] || '';
        if (!src) return;
        try { if (sessionStorage.getItem('fa_ai_ref')) return; sessionStorage.setItem('fa_ai_ref', '1'); } catch (e) {}
        track('ai_referral', { ai_source: src, landing_type: pageType });
    })();

    // ---- Consent banner: only where consent is required -------------------
    // Browser timezone is a coarse, network-free hint for Europe (EEA, UK, CH).
    // It over-includes a few non-EEA zones on purpose. Google's IP-based region
    // defaults above stay the authority for what is actually stored.
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var IN_EUROPE = /^Europe\//.test(tz) || ['Atlantic/Reykjavik', 'Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Azores'].indexOf(tz) !== -1;
    // ?consent=show forces the banner on any visitor (preview and re-choosing).
    var FORCE = /[?&]consent=show(&|$)/.test(location.search);
    if (BANNER_ON && (FORCE || (IN_EUROPE && !stored))) {
        document.addEventListener('DOMContentLoaded', function () {
            var box = document.createElement('div');
            box.setAttribute('role', 'dialog');
            box.setAttribute('aria-label', 'Analytics cookies');
            box.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;max-width:520px;z-index:99999;background:#fff;color:#0d1117;border:1px solid #d0d7de;border-radius:10px;padding:16px;font:14px/1.5 Inter,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.15)';
            box.innerHTML = '<p style="margin:0 0 12px">I use Google Analytics cookies to see which pages are useful. See the <a href="/privacy/" style="color:#4338ca">privacy policy</a>.</p>' +
                '<button type="button" data-c="granted" style="margin-right:8px;padding:8px 16px;border-radius:6px;border:1px solid #4338ca;background:#4338ca;color:#fff;cursor:pointer">Accept</button>' +
                '<button type="button" data-c="denied" style="padding:8px 16px;border-radius:6px;border:1px solid #4338ca;background:#fff;color:#4338ca;cursor:pointer">Decline</button>';
            box.addEventListener('click', function (ev) {
                var v = ev.target.getAttribute && ev.target.getAttribute('data-c');
                if (!v) return;
                try { localStorage.setItem(CONSENT_KEY, v); } catch (err) {}
                gtag('consent', 'update', { analytics_storage: v });
                box.remove();
            });
            document.body.appendChild(box);
        });
    }
})();
