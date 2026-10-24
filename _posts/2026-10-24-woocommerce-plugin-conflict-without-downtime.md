---
title: "Find a WooCommerce Plugin Conflict Without Downtime"
description: "Find a WooCommerce plugin conflict without taking your live store down: staging first, then Health Check troubleshooting mode, and what that mode cannot do."
read_time: "8 min read"
excerpt_text: "Switching plugins off one by one on a live store is the slowest and riskiest way to find a conflict. Here is the order I would use instead, and the one trap that can take a real payment."
tags: [woocommerce, debugging, wordpress, checkout]
cta_title: "Want a second pair of eyes on a conflict?"
cta_text: "The WooCommerce Store Audit checks checkout, payment gateway health, plugin conflicts and leftover plugins, and gives you a prioritized written report."
cta_url: /woocommerce-audit/
cta_label: "See the Store Audit"
image:
  path: /assets/imgs/blog/og-woocommerce-plugin-conflict-without-downtime.png
  width: 1200
  height: 630
  alt: "Find a WooCommerce Plugin Conflict Without Downtime"
---

To find a WooCommerce plugin conflict without downtime, reproduce the problem on a staging copy first. If you cannot, use the Health Check & Troubleshooting plugin, which disables plugins only inside your own browser session while visitors keep seeing the normal store. Never deactivate plugins one by one on the live site while customers are checking out.

Both routes have limits, and the second has one that can cost real money. The rest of this post is the order I would work in and what each step can and cannot prove.

## Start by writing down exactly what breaks

A conflict hunt without a precise symptom turns into guessing. Before touching anything, write down:

- The exact page and action (for example "Place order button does nothing on mobile checkout").
- Whether it happens logged in, logged out, or both.
- Any error text on screen, in the browser console, or in the PHP error log.
- When it started, and what changed just before: a plugin update, a theme update, a new plugin, a PHP version change.

That last point does most of the work. If the problem began right after one update, you have a suspect before you begin. The update list on the Dashboard, Updates screen and your host's change history are the places to look. If it began after several updates at once, the [staging workflow for WooCommerce updates]({{ '/blog/update-woocommerce-plugins-safely-staging/' | relative_url }}) explains why updating in a set order makes this kind of diagnosis easier next time.

Check the error log before you disable anything, because a fatal error names the file and therefore the plugin. WordPress controls this through three constants in `wp-config.php`. According to the WordPress core source in [load.php](https://github.com/WordPress/wordpress-develop/blob/trunk/src/wp-includes/load.php), `WP_DEBUG_LOG` and `WP_DEBUG_DISPLAY` do nothing unless `WP_DEBUG` is true, setting `WP_DEBUG_LOG` to true writes errors to `wp-content/debug.log`, and setting `WP_DEBUG_DISPLAY` to false stops errors printing on the page. Use all three together on a live site, so visitors never see file paths, and switch them off and delete the log afterwards.

## Reproduce it on staging before anything else

A staging copy is the cleanest place to break things. On the clone you can deactivate every plugin, switch theme, and even delete things, with no customer affected.

Two cautions apply to the clone, and both matter more when the clone holds real data:

- Put payment gateways into test mode, and block or redirect outgoing email. A copied database contains real customer addresses.
- Confirm the problem actually happens on staging. If it does not, the cause may be something staging lacks: live payment credentials, a CDN or page cache, a firewall rule, or traffic. That is a finding in itself, and it points away from a plain plugin-versus-plugin conflict.

If the problem reproduces on staging, the method is a bisect. Deactivate everything except WooCommerce, test, then reactivate in halves rather than one at a time. With 20 active plugins, deactivating and reactivating one by one can mean up to 20 rounds of testing; halving the list finds a single culprit in roughly five. This only works when one plugin is responsible. Two plugins that fail only when both are active will look like "the problem went away when I turned off either one", so when the halves do not add up, test pairs.

## Use troubleshooting mode when staging is not an option

If you cannot clone the site, or the problem will not reproduce on staging, use the [Health Check & Troubleshooting plugin](https://github.com/WordPress/health-check), maintained under the WordPress.org account. Its readme describes troubleshooting as a clean WordPress session where all plugins are disabled and a default theme is used, "but only for your user until you disable it or log out."

WooCommerce documents the same approach in its guide to [troubleshooting using Health Check](https://woocommerce.com/document/troubleshooting-using-health-check/). The steps it gives:

1. Take a backup first.
2. Go to Tools, Site Health, Troubleshooting, and click Enable Troubleshooting Mode.
3. On the Plugins screen, click "Enable while troubleshooting" for WooCommerce.
4. Test. Enable further plugins one at a time, still in troubleshooting mode, until the problem returns.
5. Click Disable Troubleshooting Mode when you are finished.

Switch themes the same way: if the problem is gone with all other plugins enabled, change to your real theme inside the session and test again. Theme templates that override WooCommerce files are a common source of "conflicts" that are not plugin-versus-plugin at all.

Two practical notes from the plugin's own documentation. If you get stuck in the mode, clearing your cookies exits it, according to the readme FAQ. And the 1.7.1 changelog mentions a notice about future changes to the Troubleshooting and Tools sections, so check what your installed version shows before relying on this page from memory.

## The trap: troubleshooting mode does not make payments safe

WooCommerce's own guide is explicit that troubleshooting mode does not put a payment gateway into sandbox mode, and that if an order is placed during a session, live payment will be taken. So do not place a test order on a live store in this mode to check whether checkout is fixed, unless you are prepared to take and refund a real payment.

That shapes what you can use it for. It is well suited to problems you can see without paying: a broken layout, a cart that will not update, a button that does nothing, a JavaScript error in the console. It is a poor fit for a fault that only shows up at the payment step. For that, go back to staging with the gateway in test mode.

The guide also says results may not always match actually deactivating plugins and themes, which can produce false positives. Treat a clean result in troubleshooting mode as a strong hint, then confirm on staging before you remove or replace anything on live.

## Rule out the problems that only look like a WooCommerce plugin conflict

Many reported conflicts are not conflicts. Before blaming a plugin pair, clear every cache layer (page cache, object cache, CDN, and the browser), and test in a private window logged out. A cached checkout page can make a fixed problem look unfixed, or a broken one look fine.

Also look at the scheduled work: WooCommerce, Status, Scheduled Actions. If an update left database migration tasks pending, the store may simply be half-migrated rather than in conflict.

If you do have the command line, WP-CLI can help on staging. Its plugin command supports `wp plugin list --status=active` to record the current set, and `wp plugin deactivate` and `wp plugin activate` to switch them, according to the [WP-CLI plugin command source](https://github.com/wp-cli/extension-command/blob/main/src/Plugin_Command.php). Save the active list to a file first so you can restore the exact set. I would keep this to staging; a deactivated payment or shipping plugin on live changes behavior immediately for every visitor.

## When to stop and bring someone in

Stop when any of these is true:

- The problem only appears on live and you cannot reproduce it anywhere else.
- Two or three plugins each look guilty and none is clearly at fault, which usually means a shared dependency such as a script loaded twice or a hook one plugin changes for another.
- The culprit is a payment, tax or shipping plugin you cannot simply remove.
- You have found the plugin but the vendor has no fix and you still need the feature.

At that point the useful output is a written finding: which plugins, which versions, the exact steps, and the error text. That is what a developer needs, and what a vendor's support team needs too. If the store is also behind on updates or carrying leftover plugins, [a store audit]({{ '/woocommerce-audit/' | relative_url }}) covers checkout, payment gateway health and plugin conflicts in one written report. If the conflict keeps returning after updates, a process change is the better fix, and the [Care Plan]({{ '/care-plan/' | relative_url }}) tests updates on staging before they reach live. And if the site is already showing a white screen, start with [recovering from a critical error after an update]({{ '/blog/wordpress-critical-error-after-update/' | relative_url }}).
