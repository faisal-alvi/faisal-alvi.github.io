# Analytics implementation (GA4)

Not published (`docs` is in `_config.yml` `exclude`).

## 1. Existing setup found
- GA4 property `G-7JH7HHRTV6` via inline gtag.js, copy-pasted in `_layouts/default.html` and `index.html` (homepage is standalone, no layout). `index-v1/v2.html` and `components.html` are excluded from the build and untouched.
- No GTM, no consent logic, no cookie banner. Homepage also loads Google reCAPTCHA (contact form).
- One custom event: `contact_form_submitted`, fired after Formspree returns OK (homepage form only).
- No duplicate page_view: each page loaded the tag once.
- Booking = Calendly (third party). Email = `mailto:hello@faisalalvi.com`. No phone, no pricing page. `/schedule/` is an internal tool, no tracking.

## 2. Architecture
Keep direct gtag. GTM adds nothing for a static site with ~8 events and no container exists. **Do not add GTM later while this file is active**, or GA4 will double-count.

`assets/js/analytics.js` (deferred, ~4 KB, loaded by both templates) owns: measurement ID, Consent Mode defaults, `config`, gtag.js loader, click events. Change the ID in one place.
- Only `faisalalvi.com` / `www` load gtag.js. Other hosts (localhost, previews) log events to the console instead, so dev traffic never reaches GA4.
- Full-page navigation only, so no SPA page_view handling. UTMs are read by GA4 automatically; nothing overwrites them.

## 3. Events
Automatic / enhanced measurement (leave ON in GA4 Admin > Data streams): `page_view`, `first_visit`, `session_start`, `scroll`, outbound `click`. Calendly clicks therefore also appear as the automatic outbound `click`; that is expected.

| Event | Type | Trigger | Parameters | Key event | Validate |
|---|---|---|---|---|---|
| `view_service` | custom | load of /care-plan/, /woocommerce-audit/, /hack-recovery/, /woocommerce-ga4-audit/ | `service_name`, `page_type` | no | DebugView |
| `click_book_call` | custom | link to calendly.com | `cta_location`, `cta_text`, `cta_destination=calendly`, `page_type` | no (intent only) | DebugView |
| `click_free_audit` | custom | link to /woocommerce-ga4-audit/ | `cta_location`, `cta_text`, `cta_destination`, `page_type` | no | DebugView |
| `click_service_cta` | custom | link to another service page | `service_name`, `cta_location`, `cta_text` | no | DebugView |
| `click_case_study` | custom | link to a case study | `content_slug`, `cta_location`, `cta_text` | no | DebugView |
| `click_contact` | custom | `#contact` anchor on homepage | `cta_location`, `cta_text` | no | DebugView |
| `click_email` | custom | `mailto:` link | `cta_location` | no | DebugView |
| `click_phone` | custom | `tel:` link (none exist yet) | `cta_location` | no | n/a |
| `generate_lead` | GA4 recommended | Formspree returned HTTP OK on homepage form | `form_type=contact_form`, `page_type` | **yes** | submit real form, DebugView |
| `view_pricing` | not implemented | no pricing page exists | | | |

`page_type` is also set on `config` (values: home, service, blog_index, blog_post, case_study_index, case_study, other). `contact_form_submitted` is replaced by `generate_lead`; old history stays in reports, no new data.

No form values, emails, names or free text are sent. `cta_text` is the link label only (max 40 chars). Failed/validation-failed submits send nothing.

### GA4 Admin steps (Faisal)
1. Admin > Events: mark **`generate_lead`** as key event. Nothing else yet (booking clicks are intent, not conversions; a Calendly click is not a booking).
2. Admin > Custom definitions > event-scoped dimensions: `cta_location`, `service_name`, `page_type`, `content_slug`, `cta_destination`. `cta_text` is registered too (few fixed button labels).
3. Admin > Data retention: set 14 months.
4. Optional: link Search Console (Admin > Product links) for organic landing-page queries.

### Calendly click report (which button, which page)
Explore > Free form. Rows: `Page path and screen class` + `CTA location` + `CTA text`. Values: `Event count`. Filter: `Event name` exactly matches `click_book_call`. Compare against `page_view` of the same page for a click rate. `cta_location` values: nav, footer, sticky, post_cta, article_body, header, body.

## 4. UTM convention
Lowercase, hyphens, always `utm_source`, `utm_medium`, `utm_campaign`.
- LinkedIn post: `?utm_source=linkedin&utm_medium=social&utm_campaign=<post-slug>`
- X: `utm_source=x&utm_medium=social`; Facebook: `utm_source=facebook&utm_medium=social`
- Newsletter: `utm_source=newsletter&utm_medium=email&utm_campaign=<issue-date>`
Never put UTMs on internal links (resets attribution). Inconsistent case/spelling creates separate rows; keep a list of campaign names.

## 5. Consent and privacy
- Consent Mode v2 defaults in `analytics.js`: EEA, UK, CH start `analytics_storage=denied` (cookieless pings only, no cookies); elsewhere `granted`. `ad_*` always denied (no ads).
- **Banner enabled** (`data-consent-banner="true"` on the script tag in both templates). Shown only when the browser timezone is European (`Europe/*`, Reykjavik, Canary, Madeira, Azores): a network-free hint that deliberately over-includes. Everyone else: analytics on, no banner. Google's IP-based region defaults (EEA/UK/CH denied) control what is actually stored, so a European visitor with a non-European timezone is simply treated as denied. Accept/Decline equal weight, choice in localStorage. Consent Mode is not a substitute for consent. Privacy policy at `/privacy/`.
- No fingerprinting, no user IDs, no Google Signals configuration changed.

## 6. Validation
Live check (production, Chrome): `page_view` (with `page_type`), `view_service` and `click_book_call` fire once each and reach GA4 collect; banner renders. Done (code-level, node + jsdom): each event name/params for home click types, `view_service` on a service page, no event on self-links, no gtag.js on localhost, gtag.js on production host, consent defaults precede `config`. Not done: Jekyll build (Jekyll not installed locally), live GA4/DebugView/Tag Assistant, mobile nav, consent banner UI, real form submit. The browser pane refused localhost.

### Verify yourself
1. Push, then open the site with GA4 DebugView (Chrome "Google Analytics Debugger" extension).
2. Click: Book a Call, Free Audit, a service button, a case study, email; each should show once.
3. Submit the homepage form with a test message: exactly one `generate_lead`. Submit with network offline: none.
4. Admin > Events: confirm `generate_lead` is a key event and no other.
5. Load `/?utm_source=linkedin&utm_medium=social&utm_campaign=test`; check Realtime source/medium.
6. From a VPN in EU/UK, confirm no `_ga` cookie before consent.

## 7. Reports (small set)
Reports > Acquisition > Traffic acquisition (source/medium); Landing page report; Explore > path exploration from blog_post pages to `view_service`; event counts by `cta_location`; `generate_lead` by source/medium and device. Lead counts are small, so read trends over months, not days. Unmeasurable: Calendly booking completion (needs a Calendly+GA integration or a redirect-back confirmation page), lead quality, and which article "caused" a lead (only paths, not causation).
