---
title: "PHP 8.2 End of Life: WooCommerce Upgrade Checklist"
description: "PHP 8.2 end of life is 31 December 2026. How to check your PHP version, pick a target, and test a WooCommerce store on staging before you switch."
read_time: "8 min read"
excerpt_text: "PHP 8.2 stops receiving security fixes on 31 December 2026. Your store will not break that day, but here is how to check your version and move without risking checkout."
date: 2026-10-27 21:08:47 +0530
tags: [woocommerce, maintenance, security, wordpress]
cta_title: "Preparing for a PHP upgrade?"
cta_text: "The Care Plan covers updates tested on staging first, a full regression pass and a written update each cycle, which is the workflow a PHP version change needs."
cta_url: /care-plan/
cta_label: "See the Care Plan"
image:
  path: /assets/imgs/blog/og-php-8-2-end-of-life-woocommerce.png
  width: 1200
  height: 630
  alt: "PHP 8.2 End of Life: WooCommerce Upgrade Checklist"
---

PHP 8.2 end of life is 31 December 2026, when security fixes stop for that branch. Your WooCommerce store will not stop working on 1 January, but PHP will stop publishing security patches for that branch, so any new PHP vulnerability stays unfixed on 8.2. If your host runs PHP 8.2, plan to move to PHP 8.3 or 8.4 before the end of the year, and test checkout on a staging copy first.

This post covers how to confirm which version you run, which version to pick, and a test order that protects revenue. Dates below were checked against php.net on 27 October 2026, so recheck them if you read this much later.

## What PHP 8.2 end of life actually means for a WooCommerce store

The [PHP supported versions page](https://www.php.net/supported-versions.php) lists these dates:

| Branch | Active support until | Security support until |
|---|---|---|
| 8.2 | 31 Dec 2024 | 31 Dec 2026 |
| 8.3 | 31 Dec 2025 | 31 Dec 2027 |
| 8.4 | 31 Dec 2026 | 31 Dec 2028 |
| 8.5 | 31 Dec 2027 | 31 Dec 2029 |

PHP 8.2 has been in security-only mode since the end of 2024. The latest 8.2 release listed by the php.net release feed is 8.2.35, dated 21 October 2026 and tagged as a security release. After 31 December, there will be no further 8.2 releases of this kind.

Two things this does not mean:

- It does not mean every 8.2 site is vulnerable today. Running the latest patch release is fine until the deadline.
- It does not mean WordPress or WooCommerce will stop working on 8.2 on a set date. The checks below are about security patches, not compatibility.

Your host may set an earlier deadline than PHP does. Some hosts retire a branch ahead of the official date, and some keep patching longer for a fee. This differs by host, so look for their notice rather than assuming the 31 December date applies to you.

## How common is PHP 8.2 on WordPress sites

The WordPress.org [PHP stats endpoint](https://api.wordpress.org/stats/php/1.0/) reports the share of sites using each version. On 27 October 2026 it showed PHP 8.2 at about 23 percent, PHP 8.3 at about 27 percent, PHP 8.4 at about 10 percent and PHP 8.5 at about 6 percent. These figures cover sites that report to WordPress.org and change over time, so treat them as a rough indicator, not a precise count.

The practical reading: if you are on 8.2, you have a lot of company, and plugin authors will have had to support 8.3 and 8.4 already.

## Step 1: find out which PHP version you run

Do not guess from the hosting plan name. Check the site itself:

- **WooCommerce > Status > System status.** The Server Environment section shows the PHP version.
- **Tools > Site Health > Info > Server.** Shows the same.

Then check where PHP is changed. Many hosts have a PHP selector in their control panel, and some set it per site or per directory. A staging copy and the live site can run different versions, so check both before you trust a staging test.

Also write down the PHP version of any separate server that talks to the store, such as a custom API or a scheduled job that loads WordPress through the command line. Those can run a different PHP from the web server.

## Step 2: pick a target version

I would pick PHP 8.3 or 8.4, depending on what your plugins support:

- **PHP 8.3** has security support until 31 December 2027. WordPress's own version-check API currently returns 8.3 as its recommended version (queried on 27 October 2026), so core is comfortable there.
- **PHP 8.4** buys another year, to 31 December 2028, but it deprecates a pattern that older plugin code still uses. The [PHP 8.4 deprecation list](https://www.php.net/manual/en/migration84.deprecated.php) includes implicitly nullable parameter types, meaning a parameter such as `Type $x = null` should be written `?Type $x = null`. Deprecations are warnings, not fatal errors, but they can fill your error log and show on screen if display errors is on.
- **PHP 8.5** is current, but jumping two branches on a store with many third-party plugins gives you more unknowns in one move.

Core itself still allows old versions. WordPress core currently lists PHP 7.4 as its minimum, and the WooCommerce plugin header declares `Requires PHP: 7.4`, per their GitHub source. That is a floor, not a recommendation, and it says nothing about the newest PHP a plugin has been tested on.

## Step 3: audit your plugins and theme before you touch anything

This is the step that decides whether the upgrade is boring or not.

1. **Export your plugin list with versions.** Include inactive plugins, because an old inactive plugin is still code on the server. Delete what you no longer use.
2. **Check each plugin's changelog and support page for the PHP version it was tested with.** WordPress plugin headers have a `Requires PHP` field, but there is no matching field for the highest tested PHP. A plugin can install fine and still throw deprecation notices on a newer branch, so the changelog and recent support threads are the real evidence.
3. **Flag anything abandoned.** If a payment, shipping or tax plugin has not been updated in a long time, a PHP upgrade is when that debt shows up. Decide whether to replace it before the upgrade, not after.
4. **Review custom code.** Custom plugins and theme files are the likeliest place for PHP 8.4 deprecations. Static analysis with the PHPCompatibilityWP ruleset for PHP_CodeSniffer can scan a codebase for version problems, which is quicker than reading it by eye. It finds code patterns, not behavior, so it supplements testing and does not replace it.

If you already use the staging workflow in [how to update WooCommerce plugins safely]({{ '/blog/update-woocommerce-plugins-safely-staging/' | relative_url }}), reuse it here. Update plugins to their latest versions first, as a separate change, then change PHP. Changing both at once makes any failure harder to attribute.

## Step 4: test on staging in a useful order

Copy the live site to staging, set staging to the target PHP version, and confirm the version on the System status screen. Then test in this order, because the money paths matter more than the homepage:

1. **Turn on logging, not on-screen errors.** Set `WP_DEBUG`, `WP_DEBUG_LOG` and `WP_DEBUG_DISPLAY` (to false) in `wp-config.php` on staging, and watch `wp-content/debug.log` during every step below.
2. **Place a test order with each active payment method**, using the gateway's sandbox or test mode. A product page loading proves very little. Confirm the order reaches the right status and the confirmation email arrives.
3. **Test the cart and checkout with a coupon, a shipping change and a tax change.** Rate calculations are where older code tends to be exercised.
4. **Run a refund and a failed payment.** Failure paths are rarely tested and often use different code.
5. **Test the account area, login and password reset.**
6. **Trigger scheduled tasks.** Subscriptions, renewals, stock syncs and abandoned-cart emails run on background jobs. Check WooCommerce > Status > Scheduled Actions for failed entries.
7. **Test integrations**: shipping labels, accounting, CRM, analytics events.
8. **Read the log.** Notices and deprecations that mention a specific plugin folder tell you where to look.

If something fails, use the process in [finding a plugin conflict without taking the site down]({{ '/blog/woocommerce-plugin-conflict-without-downtime/' | relative_url }}) to narrow it to one plugin before you decide whether to update it, replace it or stay on the old PHP for now.

## Step 5: switch the live site with a rollback plan

- **Take a backup** and confirm you can restore it. A backup you have never restored is a guess.
- **Pick a quiet window.** The deadline falls at the end of a busy retail period, so I would schedule the change in early or mid November, or after the main sales rush, and not during a promotion. If you use a fixed code freeze for peak season, put the PHP change on your calendar now.
- **Know how to roll back.** On most hosts, changing the PHP version back is a setting you can reverse in minutes, but this differs by host, so confirm yours before you start.
- **Repeat the order test on live** with a real low-value order or the gateway's test mode, then watch the error log and new orders for the next day.

If the site shows a white screen or a critical error after the change, the recovery steps in [WordPress critical error after an update]({{ '/blog/wordpress-critical-error-after-update/' | relative_url }}) apply, and the first one is usually to switch PHP back.

## Common mistakes

- **Only looking at the staging site's PHP version.** Staging often inherits a different default.
- **Upgrading PHP and plugins on the same day.** It removes your ability to tell which change caused a problem.
- **Treating "no errors on screen" as a pass.** Errors can go to the log only.
- **Waiting for the last week of December.** Hosts get busy, your own team is away, and there is no room for a retest.
- **Assuming the update makes the site more secure on its own.** Running a supported PHP branch means security fixes are still published, but your plugins, passwords and hosting setup matter just as much.

## What to watch before the deadline

Recheck the [PHP supported versions page](https://www.php.net/supported-versions.php) and your host's announcements in early December. If you depend on a plugin that does not yet list support for PHP 8.3 or newer, contact its developer now, while you still have time to find an alternative.
