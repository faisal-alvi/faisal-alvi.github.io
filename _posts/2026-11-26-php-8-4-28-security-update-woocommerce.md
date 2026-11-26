---
title: "PHP 8.4.28 Security Update: What WooCommerce Stores Check"
description: "The PHP 8.4.28 security update, with 8.5.13, 8.3.37 and 8.2.36, fixes 18 CVEs. How to confirm your WooCommerce host is patched and what to test."
read_time: "7 min read"
excerpt_text: "PHP shipped a second security batch on 19 November 2026: 8.5.13, 8.4.28, 8.3.37 and 8.2.36. It also fixes the session issue PHP promised a full advisory for in October."
date: 2026-11-26 13:47:34 +0530
tags: [woocommerce, security, maintenance, wordpress]
cta_title: "Want PHP patches applied and checked without risking checkout?"
cta_text: "The Care Plan covers updates tested on staging first, a full regression pass and a written update each cycle, which is the workflow a PHP patch needs."
cta_url: /care-plan/
cta_label: "See the Care Plan"
image:
  path: /assets/imgs/blog/og-php-8-4-28-security-update-woocommerce.png
  width: 1200
  height: 630
  alt: "PHP 8.4.28 Security Update: What WooCommerce Stores Check"
---

The PHP 8.4.28 security update was released on 19 November 2026, together with PHP 8.5.13, 8.3.37 and 8.2.36, and the PHP team calls each of them a security release. The changelogs list 18 CVE identifiers. If your store runs PHP 8.2 to 8.5, check that your host has moved you to one of those versions or a build that carries the same fixes. This is a server-level update, so it does not need a WordPress or WooCommerce release.

The facts below come from the [PHP 8 ChangeLog](https://www.php.net/ChangeLog-8.php), the [PHP news archive](https://www.php.net/archive/2026.php) and the [supported versions page](https://www.php.net/supported-versions.php), all read on 26 November 2026. I did not find a WordPress.org or WooCommerce announcement about this batch. Recheck the links if you read this much later.

## What the PHP 8.4.28 security update fixes

This is the second PHP security batch in 29 days. The first, on 21 October, is covered in [PHP security update for WooCommerce]({{ '/blog/php-security-update-woocommerce/' | relative_url }}). If your host applied that one, you are not unpatched today, but you are one release behind.

The changelogs give a one-line description per fix, and these are the ones that matter most to a web store:

- **Remote code execution wording.** Four entries say the flaw can lead to remote code execution: CVE-2026-129496 (timezone cache use-after-free), CVE-2026-126714 (partially overwritten session files), CVE-2026-115560 (session serializer mismatch) and CVE-2026-129474 (use-after-free in magic method backtraces, listed only for 8.5 and 8.6).
- **PHP-FPM.** Three fixes: a use-after-free that can lead to local privilege escalation (CVE-2026-129291), request smuggling through an unread request body (CVE-2026-129289) and an XSS in the status endpoint (CVE-2026-129292).
- **PHP-CGI.** An out-of-bounds read and write during PATH_INFO correction (CVE-2026-129538).
- **Smaller items.** SOAP, PHAR signature checking, HTTP stream handling for mixed-case HTTPS URLs and folded response headers.

I worked from those changelog lines, not the full advisories, which carry the exploitation conditions. A changelog entry saying "can lead to remote code execution" is not a statement that your site is exploitable. The practical reading is that PHP considers these worth patching, so patch.

The one with history is CVE-2026-115560. On 23 October PHP said it needed an unusual setup: an application switching `session.serialize_handler` at runtime with `ini_set()` before `session_start()`, with session upload progress still enabled. PHP promised a full advisory with the next release, and this is that release. WooCommerce's own session handler keeps sessions in a database table (`woocommerce_sessions`), not in native PHP sessions, so the exposure here is mostly through a plugin or theme that uses them. I would not assume your store has none, because I cannot see your plugins.

## Which versions are covered

| PHP branch | Fixed release | CVEs in its changelog |
|---|---|---|
| 8.5 | 8.5.13 | 18 |
| 8.4 | 8.4.28 | 14 |
| 8.3 | 8.3.37 | 13 |
| 8.2 | 8.2.36 | 12 |

The first release of the 8.6 branch, PHP 8.6.0, also shipped on 19 November with the same fixes. The count differs by branch because some entries appear only in newer ones. For example the DOM double free (CVE-2026-129501) is listed from 8.4.28 up. I would not read a missing entry as "not affected" without checking the advisory.

The same release day also tells you about support. According to the supported versions page, PHP 8.2 gets security fixes until 31 December 2026, about five weeks from now. 8.3 runs to 31 December 2027, 8.4 to 31 December 2028 and 8.5 to 31 December 2029.

If you are on PHP 8.1 or older, this batch does not cover you. 8.1 is not on the supported list. On 26 November the WordPress.org PHP statistics API put about 31 percent of reporting sites on 8.1 or older (7.4 alone was about 14 percent). That only counts sites that report to WordPress.org, so treat it as a rough indicator. Your first problem is the branch, and the plan is in [PHP 8.2 end of life: WooCommerce upgrade checklist]({{ '/blog/php-8-2-end-of-life-woocommerce/' | relative_url }}).

## Step 1: read your PHP version and SAPI

Open **Tools > Site Health > Info > Server** in the WordPress admin. It shows the PHP version and a "PHP SAPI" line, which comes from the `PHP_SAPI` constant in [WordPress core's debug data code](https://github.com/WordPress/wordpress-develop/blob/trunk/src/wp-admin/includes/class-wp-debug-data.php). SAPI is how PHP talks to the web server, for example `fpm-fcgi`, `litespeed` or `apache2handler`.

The patched version numbers are 8.2.36, 8.3.37, 8.4.28 and 8.5.13 or higher in that branch. Hosts often patch without changing the string, though: the October advisory says some vendors ship backported fixes. So a lower number is a question, not a verdict. Check staging too, because it can run a different version and it is also reachable from the internet.

I would not take the SAPI line to mean "the CGI fix does not apply to me". It tells you which part of PHP is serving requests, and your host knows whether `php-cgi` is in use anywhere on the account.

## Step 2: ask your host one specific question

"Has the 19 November 2026 PHP security release, 8.4.28 or the equivalent for my branch, been applied to the PHP my site runs on? If it is a backport, which package or build?" A useful answer names a version, a build or a date. A reply of "we monitor security" is a reason to ask again.

On a server you manage yourself, update through your package manager or your PHP build process, then restart PHP-FPM or the web server so running workers load the new build. A package upgrade alone does not always reload them, and that depends on your setup.

## Step 3: test a patch-level update safely

Within a branch this is a small change, so the risk is lower than a branch jump. It still touches the layer under your checkout, so:

1. **Take a backup you can restore**, and know how to restore it.
2. **Update staging first** if your host offers it. Place a test order with each active payment method in the gateway's test mode.
3. **Check the PHP error log**, not just the screen, for new warnings after the change.
4. **Look at the extensions that do unusual work.** The changelog includes SOAP, PHAR and session fixes. If a shipping, ERP or accounting extension talks to a SOAP service, run one real request through it. If any plugin calls `session_start()`, test its login or cart flow.
5. **Update live in a quiet window**, repeat the order test and watch new orders for a day. Confirm scheduled actions still run under **WooCommerce > Status > Scheduled Actions**.

For the general routine see [how to update WooCommerce plugins safely with staging]({{ '/blog/update-woocommerce-plugins-safely-staging/' | relative_url }}). The same order applies to PHP: back up, stage, test, then live.

## Should you move to PHP 8.6.0?

Not as a reaction to this news. 8.6.0 is a release-day version, and the WordPress.org statistics show about 0.1 percent of reporting sites on it. A security patch is a good reason to update within your branch, and a poor reason to jump to a new one. I did not find a WordPress or WooCommerce statement on 8.6 support, so check each extension's compatibility notes. Waiting for the first patch releases is the lower-risk path for a store taking orders.

## What the pattern tells you

Two PHP security batches in a month mean PHP patching is a recurring task. If your host does not patch quickly, or will not tell you what it runs, treat that as a finding, because the fixes arrive whether or not anyone owns the job. Patching also does not tell you whether anyone got in earlier. If you see unfamiliar files or admin users, read [what to do in the first hour if WordPress is hacked]({{ '/blog/wordpress-hacked-what-to-do-first-hour/' | relative_url }}).

Next, watch your host's notice about this release, the [PHP news archive](https://www.php.net/archive/2026.php) for the next advisory, and the 31 December 2026 end of security support for PHP 8.2. If you would rather have someone sequence the update, test checkout and confirm the result in writing, that is the work the Care Plan below covers.
