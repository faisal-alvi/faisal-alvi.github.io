---
title: "PHP Security Update for WooCommerce: What to Check Now"
description: "PHP security update for WooCommerce: two critical flaws were fixed on 21 October 2026. How to check your PHP version, what to ask your host and what to test."
read_time: "7 min read"
excerpt_text: "The PHP project fixed two critical remote code execution flaws on 21 October 2026. No WordPress or WooCommerce update is needed, but your PHP version and your host's patch status are."
date: 2026-10-29 20:41:12 +0530
tags: [woocommerce, security, maintenance, wordpress]
cta_title: "Want the PHP update handled without risking checkout?"
cta_text: "The Care Plan covers updates tested on staging first, a full regression pass and a written update each cycle, which is the workflow a PHP patch needs."
cta_url: /care-plan/
cta_label: "See the Care Plan"
image:
  path: /assets/imgs/blog/og-php-security-update-woocommerce.png
  width: 1200
  height: 630
  alt: "PHP Security Update for WooCommerce: What to Check Now"
---

On 21 October 2026 the PHP project released a PHP security update that fixes two critical vulnerabilities, and WooCommerce stores are affected like any other PHP site. The fixed releases are PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35. No WordPress or WooCommerce update is needed or planned for this. What you need to do is confirm which PHP version your store runs and if your host has applied the patch.

The facts below come from the linked primary sources, read on 29 October 2026. Recheck them if you read this much later, because PHP said a further advisory is coming.

## What PHP fixed on 21 October 2026

The [PHP security advisory](https://www.php.net/archive/2026.php#2026-10-21-5) describes two issues, both able to lead to unauthenticated remote code execution (running an attacker's code on the server):

- **CVE-2026-109618:** an out-of-memory condition can interrupt PHP while request data is only partly set up, and cleanup then treats that invalid data as valid. See the [php-src advisory](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w).
- **CVE-2026-109619:** state that belongs to one request can outlive its memory, and a later request on the same worker may use it. See the [php-src advisory](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp).

Both are rated critical (CVSS v4 base score 9.2), with high attack complexity. The advisories report a working exploit against Apache with mod_php. They describe PHP-FPM as likely susceptible from source analysis, with no complete FPM exploit shown. Those details come from the advisories, and I would not read them as "FPM hosting is safe". The PHP team says updating is the only complete fix.

The [WordPress.org announcement](https://wordpress.org/news/2026/10/critical-php-security-release/) and the [WooCommerce developer blog](https://developer.woocommerce.com/2026/10/21/php-security-release/) both say the same thing: this is a server-level issue, not a flaw in WordPress or WooCommerce code.

## Who is affected, and who may not be

Affected, per the advisories: PHP releases earlier than 8.2.35, 8.3.36, 8.4.27 and 8.5.12 in those branches, plus earlier 8.6.0 pre-release builds.

PHP 8.1 and older no longer get updates from the PHP project. The advisory mentions minimal backport branches for 7.4, 8.0 and 8.1 and says some vendors ship backported fixes. So an old version number does not by itself prove your server is unpatched, and a new-looking one does not prove it is patched. Linux distributions and some hosts patch PHP without changing the version string. Only your host can tell you which build you run.

Per the WooCommerce post, sites on WordPress.com, WordPress VIP, Pressable and WP Cloud were already protected. Other hosts may be patching or filtering requests, and you should ask.

The WordPress.org PHP statistics API showed about 33 percent of reporting sites on a PHP branch older than 8.2 on 29 October 2026 (PHP 7.4 alone was about 15 percent). Those figures cover only sites that report to WordPress.org, so treat them as a rough indicator.

## Step 1: find your PHP version

In the WordPress admin, open **Tools > Site Health > Info > Server**. In WooCommerce, **WooCommerce > Status** shows it in the server environment section. Your host's control panel is the third place to look.

Check staging as well as live. They can run different versions, and a staging site is also reachable from the internet.

## Step 2: ask your host a specific question

Skip "is my site secure?" and ask: "Has the 21 October PHP security release for CVE-2026-109618 and CVE-2026-109619 been applied to the PHP my site runs on, and if not, when?" Ask them to name the fixed version or the patched package.

A useful answer names a version or a date. A vague answer is a reason to ask again, or to plan a move.

## Step 3: apply the PHP security update to your WooCommerce store

If your PHP branch is 8.2 to 8.5 and a fixed release is available, the update is a patch-level change, which carries less compatibility risk than moving to a new branch. Still:

1. **Take a backup you can restore.** If you have never restored one, test it.
2. **Update staging first** if your host offers it, and place a test order with each active payment method in the gateway's test mode.
3. **Check the error log**, not just the screen, for new notices after the change.
4. **Update live in a quiet window**, then repeat the order test and watch new orders for a day.

Given the severity, I would not hold a patch-level update for a staging cycle that takes a week. A shorter test of checkout, login and one scheduled task is a reasonable compromise.

If you are on PHP 8.1 or older, a patch is not the whole story. The branch is unsupported, and WooCommerce has [announced](https://developer.woocommerce.com/2026/09/29/php-8-1-requirement/) that version 11.6, planned for February 2027, requires PHP 8.1 or newer, and it recommends PHP 8.3 or newer. Moving to a supported branch now solves both problems, but it is a larger change, so follow the staging workflow in [PHP 8.2 end of life: WooCommerce upgrade checklist]({{ '/blog/php-8-2-end-of-life-woocommerce/' | relative_url }}) and update plugins first, as a separate step.

## If you cannot update immediately

The advisories list interim mitigations for people who control their own server. They are partial, and the advisories say so. Examples:

- `session.upload_progress.enabled = 0`, set in `php.ini` or the FPM pool configuration, then restart all workers.
- On PHP 8.5, `fatal_error_backtraces = 0`.
- Enforcing `memory_limit = -1` administratively, together with request-size limits at the web server. This one has a cost: with no PHP memory cap, a runaway script is no longer stopped by PHP, so the advisory suggests a container or cgroup limit instead. Settings changed at runtime with `ini_set()` do not count, and WordPress core itself calls `ini_set( 'memory_limit', ... )` in its memory-raising function, which is the kind of application-level setting the advisory warns can bring a finite limit back.

I would treat these as a bridge of days, not a plan, and I would not apply the memory change on shared hosting where you cannot enforce it anyway. The PHP project also published an informational advisory on 23 October about a separate, unlikely issue, CVE-2026-115560, with a full advisory promised for the next release. Watch the [PHP news archive](https://www.php.net/archive/2026.php) for it.

The WooCommerce and WordPress posts both cite the UK National Cyber Security Centre, which says to consider taking a system offline if you cannot fix or mitigate it quickly. The [NCSC notice](https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php) also advises checking an unpatched system for signs of compromise. For a store taking orders that is a business decision, and it is worth making deliberately, not by default.

## What a patch does not tell you

The advisories note that clean logs do not prove a server was not attacked. The advisories I read do not report exploitation against WordPress sites. If your server ran an unpatched build for a while and you see unfamiliar files, new admin users or odd outbound traffic, treat that as a possible compromise and read [what to do in the first hour if WordPress is hacked]({{ '/blog/wordpress-hacked-what-to-do-first-hour/' | relative_url }}). Patching closes the door but does not remove anyone who is already inside.

## What to monitor next

- Your host's status page or support notice about this release.
- The PHP release for CVE-2026-115560, once published.
- Your PHP version after any host-side change. Hosts sometimes reset a version when they migrate a server.
- The WooCommerce 11.6 PHP 8.1 requirement, if you are still on PHP 7.4 or 8.0.

If you would rather have someone else sequence the PHP change, test checkout and confirm the result in writing, that is the kind of work the Care Plan below covers.
