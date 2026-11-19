---
title: "WordPress 7.1.5 Security Update: 20 Fixes, What to Check"
description: "WordPress 7.1.5 security update fixes 20 issues, and 7.1.4 is now flagged insecure. What a WooCommerce store should verify, update and test."
read_time: "8 min read"
excerpt_text: "WordPress 7.1.5 shipped on 18 November 2026 with 20 security fixes, three weeks after 7.1.4. Here is how to confirm your store has it, which fixes touch store workflows, and what to test."
date: 2026-11-19 13:45:30 +0530
tags: [woocommerce, wordpress, security, maintenance]
cta_title: "Want core security updates applied without risking checkout?"
cta_text: "The Care Plan covers updates tested on staging first, a full regression pass and a written update each cycle."
cta_url: /care-plan/
cta_label: "See the Care Plan"
image:
  path: /assets/imgs/blog/og-wordpress-7-1-5-security-update-woocommerce.png
  width: 1200
  height: 630
  alt: "WordPress 7.1.5 Security Update: 20 Fixes, What to Check"
---

The WordPress 7.1.5 security update was released on 18 November 2026 and fixes 20 vulnerabilities. WordPress.org recommends updating immediately. If your store runs 7.1.4, the previous security release, it is now classed as insecure. Check your version first, take a backup, update, then test checkout, customer logins and product reviews.

The facts below come from the [7.1.5 announcement](https://wordpress.org/news/2026/11/wordpress-7-1-5-release/), the [HelpHub page for 7.1.5](https://wordpress.org/documentation/wordpress-version/version-7-1-5/) and the WordPress.org version APIs, read on 19 November 2026. Backports and compatibility notes keep changing for a few days after a release, so recheck them if you read this later.

## What the WordPress 7.1.5 security update covers

The release is a short-cycle security release with no feature changes listed. HelpHub lists 20 issues. Grouped by the parts of a store they touch:

- **Comments, which include product reviews.** An unauthenticated stored XSS via shortcode attributes in comments, an Author-level authorization bypass when editing comments in the admin, and a Contributor-level stored XSS in the Comment Date block.
- **XML-RPC.** An unauthenticated denial of service via batched pingbacks, and a Subscriber-level information disclosure through `wp.getComments`.
- **The REST API.** Unauthenticated disclosure of private taxonomy terms through the search endpoint, user email addresses exposed to Author-level accounts through the comments endpoint, and an Editor-level disclosure through post and template author assignment.
- **Database queries.** SQL injection in `WP_Meta_Query` through nested relation values, and SQL injection through the front page setting in Customizer changeset previews.
- **Blocks and the editor.** An unauthenticated privilege escalation through Template Part block attributes that could lead to remote code execution, plus several XSS issues (Openverse image metadata, media filenames, the Interactivity API data context, and oEmbed responses).
- **Customizer and multisite.** An Administrator-level stored XSS through Customizer previews, and a multisite issue where a site Administrator could take over a Super Admin account.
- **A reflected XSS in the legacy media library popup**, a regular expression hardening fix, and the removal of the block editor's Imgur embed variation.

The two entries a store owner should read twice are the unauthenticated ones. "Unauthenticated" means the person needs no account. The announcement does not publish exploit details, so this article cannot tell you how easy any of them is to abuse, and it does not claim that any store was attacked.

## Who is affected, and who is not

The announcement says 7.0, 6.9, 6.8, 6.7, 6.6 and 6.5 are affected by all 20 issues. Older branches are affected by fewer, down to 11 of the 20 on 4.7. Branches before 4.7 no longer receive security updates. So "my WordPress is old" does not make you safe, it makes you unsupported.

Within a vulnerable version, exposure still depends on your setup:

- The multisite issue only matters if you run a multisite network.
- Several issues need an account at Contributor, Author or Editor level. A store where two trusted people log in has a different risk from one with open registration or many freelancer accounts.
- The XML-RPC issues only matter while `xmlrpc.php` answers requests. Many stores never use it, and it can be switched off (more on that below).
- Whether your theme and plugins expose the code paths behind the SQL injection and Template Part issues is not something the announcement states. Assume you are exposed until you have updated.

## Step 1: check your version

Open **Dashboard > Updates**. It shows your version and whether an update is offered. **Tools > Site Health > Info > WordPress** also shows it. Check staging too, since a staging copy is reachable from the internet and often lags behind.

On 19 November the [core version-check API](https://api.wordpress.org/core/version-check/1.7/) offered 7.1.5 as the current release, and 7.0.9, 6.9.12, 6.8.13 and so on down to 4.7.40 as the fixed build for each older branch. The [stable-check API](https://api.wordpress.org/core/stable-check/1.0/) listed every 7.1 release from 7.1 to 7.1.4 as "insecure" and 7.1.5 as "latest". That is WordPress.org's own classification. It also means the [7.1.4 update I wrote about earlier]({{ '/blog/wordpress-7-1-4-security-update-woocommerce/' | relative_url }}) is no longer the stopping point: if you stopped there, you now need one more update.

If your site is on an old branch because a plugin or theme will not run on anything newer, take the fixed build for that branch as a stopgap, and plan the move. WooCommerce's current `readme.txt` on [GitHub](https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/readme.txt) lists "Requires at least: 7.0", so the latest WooCommerce already needs WordPress 7.0 or newer, and sites on 6.9 are choosing to also stay on an older WooCommerce.

## Step 2: do not assume it updated itself

WordPress core installs minor and security releases in the background by default. The updater is switched off by the `AUTOMATIC_UPDATER_DISABLED` constant or by filters, as the [auto-updater source](https://github.com/WordPress/wordpress-develop/blob/trunk/src/wp-admin/includes/class-wp-automatic-updater.php) shows, and hosts, deployment pipelines and developers change those settings on purpose. Even where it is on, the background check does not run the instant a release ships, and a failed run can be silent.

So confirm with your own eyes. If you manage several stores, the cheap fix is a list of the sites with their versions, checked after every security release. I covered the wider picture in [WooCommerce automatic security updates: what still needs you]({{ '/blog/woocommerce-automatic-security-updates/' | relative_url }}), which also explains why core and extension updates follow different rules.

## Step 3: update with a safety net

A core security update is normally low risk next to a major release, but it still touches files and the database on a store that takes payments.

1. **Take a backup you can restore.** If you have never restored it, try on staging first.
2. **Update staging first** if you have one. Otherwise choose a quiet period on live.
3. **Do not interrupt the update.** If it fails or leaves the site stuck in maintenance mode, read [WordPress critical error after an update]({{ '/blog/wordpress-critical-error-after-update/' | relative_url }}) before retrying.
4. **Update core on its own**, then plugins separately. If something breaks you want to know which change did it. The [safe WooCommerce update workflow]({{ '/blog/update-woocommerce-plugins-safely-staging/' | relative_url }}) has the longer version.

On compatibility: the plugin directory API listed WooCommerce 11.3.0 as "tested" up to WordPress 7.1.5 on 19 November, while the readme in the code repository still says 7.1. A "tested up to" label is a compatibility signal from the plugin author, not a guarantee for your mix of extensions, so the test pass below is what actually answers the question for your store.

## Step 4: test what earns money

After the update, run this on a real product, using each payment gateway's test mode where one exists:

- Add to cart, change quantity, apply a coupon, complete checkout with each active payment method. Confirm the order exists and the confirmation email arrives.
- Log in as a customer and open an order. Log in as a shop manager and open an order.
- **Submit a product review.** WooCommerce stores reviews as WordPress comments with the comment type `review` (see [`class-wc-comments.php`](https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/includes/class-wc-comments.php)), and this release changes comment handling, so confirm a review can be posted, moderated and displayed.
- Open a page built with the block editor, preview it, and check the front end. If your theme uses Template Part blocks or custom block templates, look at headers and footers in particular.
- Check the PHP error log for new notices, not only the screen.

If you have custom code that builds `meta_query` arguments from request data, ask your developer to look at it. The release changes how nested `relation` values are handled in `WP_Meta_Query`, and queries built from untrusted input are the place where that kind of issue matters. The announcement does not say which patterns were affected, so this is a review prompt, not a diagnosis.

## Step 5: reduce what an attacker can reach

None of this replaces the update, and none of it is a fix for the specific flaws. It is general hardening that happens to line up with this release.

- **XML-RPC.** If nothing you run needs it, WordPress lets you turn it off with the [`xmlrpc_enabled` filter](https://github.com/WordPress/wordpress-develop/blob/trunk/src/wp-includes/class-wp-xmlrpc-server.php). Some plugins and mobile apps use it, so check before you disable it, ideally on staging. To see whether anything calls it, look for `xmlrpc.php` in your access logs.
- **Accounts.** Review **Users > All Users**. Remove accounts nobody uses, check roles you do not recognize, and be careful with open registration that assigns a role above Subscriber. Several of these issues need Contributor, Author or Editor rights.
- **Signs of compromise.** If you notice unfamiliar admin users, changed files or odd redirects, treat it as a possible compromise and follow [what to do in the first hour if WordPress is hacked]({{ '/blog/wordpress-hacked-what-to-do-first-hour/' | relative_url }}). An update closes the hole. It does not remove anyone already inside.

## What to keep an eye on

- **WordPress 7.2.** The announcement lists 8 December 2026 as the planned date, Release Candidate 1 came out on 17 November, and the 7.1.5 post says RC 2 already contains the applicable fixes. Do not test a release candidate on a live store.
- **Your host.** Some hosts apply core updates for you and some only offer them. Ask which, and how quickly.
- **Plugin and theme advisories.** Core fixes are one layer. The [PHP security update checklist]({{ '/blog/php-security-update-woocommerce/' | relative_url }}) covers the server layer from late October.

Two core security releases in three weeks is a reason to have a standing routine, not a reason to panic. If you would rather have someone else sequence the update, test checkout and confirm the result in writing, that is what the Care Plan below covers.
