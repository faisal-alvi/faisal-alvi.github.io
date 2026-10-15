---
title: "WooCommerce Store Audit: What a Real One Covers"
description: "A WooCommerce store audit should test checkout, headers, logs, templates and plugins, not just run a speed score. Here is what to expect in a real one."
read_time: "8 min read"
excerpt_text: "A store audit is a set of tests with written findings, not a score from a tool. Here is what each part checks and what a useful report looks like."
tags: [woocommerce, performance, security, maintenance]
cta_title: "Want these checks run on your store?"
cta_text: "The Store Audit is $249 flat: a written report in 2 to 3 business days, credited toward fix work if you hire me afterward."
cta_url: /woocommerce-audit/
cta_label: "See the Store Audit"
image:
  path: /assets/imgs/blog/og-woocommerce-store-audit-what-it-covers.png
  width: 1200
  height: 630
  alt: "WooCommerce Store Audit: What a Real One Covers"
---

A WooCommerce store audit is a set of hands-on tests of your live store, checkout, security headers, error logs, template overrides, plugins and mobile speed, ending in a written, prioritised list of findings. If what you received is a PDF of tool scores with no test order in it, that was a scan, not an audit. This post lists what a real one covers so you can judge any quote, including mine.

An audit looks, it does not change. Nothing here should be done on a live store without a fresh backup, and anything that alters settings or code belongs on a staging copy first.

## The checkout test comes first

Everything else is secondary to whether a customer can pay you. A real audit places test orders through every payment method that is switched on, as a guest and as a logged-in customer, with a coupon and without, to every shipping zone you serve. Settings screens can look right while the flow underneath fails.

What gets checked in each run:

- The cart total, shipping options and tax lines match what you expect for that address.
- The payment completes and the order lands in the status you intended.
- The customer and admin emails actually arrive. If they do not, see [why WooCommerce emails stop sending]({{ '/blog/woocommerce-emails-not-sending/' | relative_url }}).
- Nothing is left sitting in an in-between state. [Orders stuck on pending payment or on hold]({{ '/blog/woocommerce-orders-stuck-pending-payment-on-hold/' | relative_url }}) are a common symptom of a gateway callback that never arrived.

Use a gateway's test or sandbox mode where one exists. If a method has none, say so in the audit scope and agree how a live test will be refunded, because a test on a live gateway is a real transaction.

## Logs and scheduled actions show failures nobody reported

Many failures are quiet. WooCommerce records errors and warnings in its own logger, which you can read at **WooCommerce > Status > Logs**, according to the [WooCommerce logging documentation](https://github.com/woocommerce/woocommerce/blob/trunk/docs/best-practices/data-management/logging.md). Log entries are grouped by source, which is normally the extension or part of core that wrote them, so a payment gateway that keeps failing has its own file or filterable entries.

Two details from that documentation matter in an audit:

- Logging can be switched off entirely, and there is a level threshold that hides anything below a chosen severity. A store with logging disabled is not a store without errors, so an auditor checks the settings before trusting an empty log.
- The retention period deletes old entries. Evidence of an intermittent failure from last month may already be gone.

Next is **WooCommerce > Status > Scheduled Actions**. Background tasks queued by WooCommerce and its extensions run there, and a long list of failed or past-due actions points at a cron or hosting problem. A healthy checkout page can sit on top of a broken background queue for a long time. The related database costs are covered in [the slow checkout post on Action Scheduler and autoload]({{ '/blog/woocommerce-slow-checkout-action-scheduler-autoload/' | relative_url }}).

## Template overrides and the status report

Open **WooCommerce > Status** (the System Status report) and scroll to the end. WooCommerce lists the templates your theme or child theme overrides there, with a warning when one is outdated, as described in its guide to [fixing outdated WooCommerce templates](https://github.com/woocommerce/woocommerce/blob/trunk/docs/theming/theme-development/fixing-outdated-woocommerce-templates.md).

This is an audit favourite because an outdated override can sit unnoticed for months. The page still loads, so nobody reports it, but it may be missing markup that newer versions of WooCommerce or an extension expect. The fix is manual: back up the old template, copy the current default from the plugin, and re-apply your customisations. Every override your store keeps is a recurring maintenance cost, which is one reason maintenance prices vary, as explained in the [WooCommerce maintenance cost breakdown]({{ '/blog/woocommerce-maintenance-cost/' | relative_url }}).

The same report shows versions of WordPress, PHP, WooCommerce, the theme and every active plugin. An audit records these as a baseline so that later problems can be tied to a change.

## Security headers are cheap to check and often missing

Headers are one place where an audit can be objective. Four are worth reading on the response from your home page and checkout:

| Header | What it does | Source |
|---|---|---|
| `Strict-Transport-Security` | Tells browsers to use HTTPS only for a stated `max-age`; setting `max-age=0` disables it | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) |
| `Content-Security-Policy` | Limits which origins a page may load resources from, which helps against cross-site scripting | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy) |
| `X-Frame-Options` | Controls whether the page can be framed, to avoid clickjacking; `frame-ancestors` in CSP is the more flexible option | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options) |
| `X-Content-Type-Options` | `nosniff` stops browsers guessing a file type that differs from the declared one | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options) |

In a small set of nine sites whose headers were checked, all had gaps and most were missing all four. That is nine sites, not a statistic about the web, and the full write-up is in [the missing security headers post]({{ '/blog/woocommerce-missing-security-headers/' | relative_url }}).

Be careful with the order of work. HSTS is the one to test most carefully, because browsers remember it for the stated `max-age`, so a mistake can keep affecting visitors after you fix the server. A strict CSP on a checkout that loads payment scripts from several origins can break the payment form. Start any CSP in a report-only mode on staging and read what it flags before enforcing it.

## Plugins, conflicts and leftovers

An audit lists every installed plugin and sorts it into used, unused and unclear. Deactivated plugins still sit on disk, so leftovers are worth listing even when they are switched off, and removing the ones you do not need shrinks what has to be kept updated. Overlap matters too: two plugins that both modify the checkout, or two that both cache pages, are a conflict waiting to happen.

Finding a real conflict is done on a staging copy by switching to a default theme and deactivating plugins in groups while repeating the failing action. Doing that on a live store can interrupt real customers at checkout, so I would not accept it as part of an audit.

## Mobile performance, measured against desktop

Run the same page on mobile and desktop and compare. In Lighthouse numbers from ten sites reviewed before quoting, nine showed mobile LCP far worse than desktop, commonly 3 to 9 times worse. That is a small sample, but it is why an audit should never report a single desktop number. The causes are usually images, third-party scripts and theme code, covered in [why WooCommerce is slower on mobile than desktop]({{ '/blog/woocommerce-mobile-slower-than-desktop/' | relative_url }}).

## What a WooCommerce store audit report should look like

Judge the output more than the checklist. A useful report has:

1. Findings in priority order, each with the evidence (a screenshot, a log line, a header value).
2. A plain-language reason each one matters, and what it would cost to fix.
3. A clear line between things confirmed by a test and things that are only suspected.
4. No scores for their own sake.

Watch for audits that are free but exist to sell a package, and for ones with no test order at all. The scope should be written down before you pay. My own version, the [WooCommerce Store Audit]({{ '/woocommerce-audit/' | relative_url }}), is $249 flat, delivered as a written report in 2 to 3 business days, and the fee is credited toward fix work if you hire me for it.
