---
title: "How to Update WooCommerce Plugins Safely With a Staging Site"
description: "How to update WooCommerce plugins safely: clone to staging, update in a sensible order, test checkout and emails, then repeat on live with a rollback ready."
read_time: "8 min read"
excerpt_text: "A staging copy only protects you if you test the right things on it. Here is the order I would update in, what to check, and what staging cannot tell you."
tags: [woocommerce, maintenance, debugging, wordpress]
cta_title: "Would you rather not do plugin updates yourself?"
cta_text: "The Care Plan covers weekly updates tested on staging first, a full regression pass, and a written update each cycle."
cta_url: /care-plan/
cta_label: "See the Care Plan"
image:
  path: /assets/imgs/blog/og-update-woocommerce-plugins-safely-staging.png
  width: 1200
  height: 630
  alt: "How to Update WooCommerce Plugins Safely With a Staging Site"
---

To update WooCommerce plugins safely, copy the live store to a staging site, run the updates there in a set order, test the paths that make money (cart, checkout, payment, emails), and only then repeat the same updates on live with a fresh backup beside you. The staging copy is only as useful as the test list you run on it, so most of this post is about what to test and what staging cannot show you.

Everything below that touches the live store assumes you have a full backup (files and database) that you have confirmed you can restore. A backup you have never restored is a hope, not a backup.

## Start with a staging copy that is actually current

Staging is only worth the effort if it matches live. Clone it right before you update, not from last month's copy, because a stale database hides problems that depend on recent products, orders or settings.

Two things to do on the clone before you press any update button:

- Make sure the site knows it is not production. WordPress has `wp_get_environment_type()`, which returns `local`, `development`, `staging` or `production`, and falls back to `production` if the value is missing or invalid. You set it with the `WP_ENVIRONMENT_TYPE` constant in `wp-config.php` or an environment variable. Some hosts set it on a staging clone. This differs by host, so check yours, because plugins can use this value to behave differently on non-production sites.
- Stop the clone from talking to real customers. A copied database holds real customer emails and possibly live payment credentials. Put your payment gateways in test mode and make sure outgoing mail is blocked or redirected. Test orders that email real people are an avoidable mistake.

If your host's one-click staging does not copy the database, or you take orders constantly, say so in your notes: any orders placed on live after the clone will not exist on staging, and you will not see how an update handles them.

## Read what is waiting before you update anything

Open Dashboard, Updates, and Plugins. Write down the current and target version of every plugin. If something goes wrong you will want to know exactly what changed, and the list is also your rollback map.

Then check three things before you start:

1. **Release notes for WooCommerce itself.** WooCommerce posts template file changes with each release on its developer blog, per its own documentation on [fixing outdated templates](https://github.com/woocommerce/woocommerce/blob/trunk/docs/theming/theme-development/fixing-outdated-woocommerce-templates.md). If your theme overrides WooCommerce templates, those changes matter to you.
2. **Which plugins need a newer WooCommerce.** WooCommerce extensions are expected to declare WooCommerce as a requirement through the `Requires Plugins` header, according to WooCommerce's [extension development docs](https://github.com/woocommerce/woocommerce/blob/trunk/docs/extensions/getting-started-extensions/how-to-design-a-simple-extension.md). The update screen does not always make an incompatibility obvious, so read each changelog for a minimum WooCommerce version.
3. **Whether a plugin is abandoned.** A payment or shipping plugin that has not updated in a long time is a risk before you touch anything. Decide now whether it stays.

## Update WooCommerce plugins safely, in an order you can trace

Updating everything at once with "Select all" is fast and tells you nothing when it breaks. I would use this order on staging:

1. Themes and non-WooCommerce utility plugins that do not touch the store, one at a time.
2. WooCommerce core.
3. WooCommerce extensions (shipping, tax, subscriptions, memberships).
4. Payment gateways last.

The reason for gateways last is diagnostic. If checkout breaks after the final update, the suspect list is one plugin long. If you did it all at once, it is the whole stack.

Where an extension says it needs the newest WooCommerce, update WooCommerce first. Where the extension's changelog says the reverse, follow the changelog. Version requirements win over any general rule, including mine.

If you have WP-CLI, `wp plugin update --all --dry-run` previews which plugins would be updated without changing anything, per the [WP-CLI plugin command source](https://github.com/wp-cli/extension-command/blob/main/src/Plugin_Command.php). The same command accepts `--version=<version>` for a single plugin, which is useful both for staged rollouts and for rolling back to a known-good version.

## Let the database update finish before you test

After a WooCommerce update, the plugin may need to update its own database tables. In WooCommerce's installer code, database auto-update is the default since version 9.9.0, and it can be switched off with the `woocommerce_enable_auto_update_db` filter. When it runs, it writes entries to the WooCommerce log with the source `wc-updater`.

The practical gotcha: the update can be queued as background work rather than completing instantly. If you test checkout seconds after clicking update, you may be testing a half-migrated store. Go to WooCommerce, Status, Scheduled Actions and wait until nothing related to WooCommerce is pending or running. Then clear any caches (page cache, object cache, CDN) before testing, because a cached cart or checkout page will make a broken update look fine.

## What to test on staging

Test what earns money, in this order:

- **Product page to cart to checkout to order received**, logged out, on a phone-sized screen as well as desktop. Use a real product with variations if you sell them.
- **Every payment method you offer**, in the gateway's test mode. A gateway that loads on the page but fails on submit is the classic update casualty.
- **Coupons and shipping rates.** Apply a coupon, change the address, and watch the totals recalculate.
- **Emails.** Place a test order and confirm the customer and admin emails fire. If they do not, the checklist in [WooCommerce emails not sending]({{ '/blog/woocommerce-emails-not-sending/' | relative_url }}) will narrow it down.
- **Theme overrides.** Open WooCommerce, Status, System Status and scroll to the Templates section. WooCommerce lists the templates your theme overrides and warns when they are outdated. An outdated override is a common reason the cart or checkout looks wrong after an update.
- **The browser console and the PHP error log.** A visible page can still be throwing errors.

Write the test list down once and reuse it. Consistency matters more than depth: you want to notice what changed.

## What staging cannot tell you

Staging catches code and layout problems. It does not reliably catch:

- Payment gateway behaviour that depends on live credentials, webhooks or the gateway's own servers calling your site. Test mode covers much of this, not all of it.
- Load. A slow query that is fine with no visitors can hurt on a busy day.
- New orders and customers that arrived on live after the clone.

That is why the live update still needs care. Do it at your quietest hour, not during a sale, and place one real or test order straight afterward. If it fails, you want to know in minutes, not when the next customer emails you. If you also see odd behaviour after the live update, [what to do about a critical error after an update]({{ '/blog/wordpress-critical-error-after-update/' | relative_url }}) covers recovery.

## Plan the rollback before you click Update

Decide in advance how you will go back. Your options, from cheapest to most disruptive:

1. Reinstall the previous version of the one plugin that broke (for example with the WP-CLI `--version` flag above, or by uploading the older zip). This only works if the update did not change data in a way the old version cannot read.
2. Restore the backup you took just before updating. This is why that backup must be fresh and tested. Be aware that restoring also rolls back any orders placed since the backup.
3. Put the site in maintenance while you fix it forward.

Because of the order risk in option 2, I would rather update small and often than let a store fall months behind. A big jump across many versions is harder to test and harder to undo.

If you would rather not run this routine yourself every week, the [Care Plan]({{ '/care-plan/' | relative_url }}) is exactly this process, run for you.
