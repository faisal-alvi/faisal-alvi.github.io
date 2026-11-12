---
title: "WooCommerce Stripe Gateway Security Update: Check Your Version"
description: "The Stripe Gateway security update (11.2.0, or 11.1.2) is out. How to check your version, who the 10.9.0 password bug affected, and what to test."
read_time: "8 min read"
excerpt_text: "The WooCommerce developer blog asks stores to update the Stripe Gateway to 11.2.0, or 11.1.2 on the 11.1.x branch. Here is how to check your version, who is exposed to the password issue, and what to test on checkout."
date: 2026-11-12 13:45:30 +0530
tags: [woocommerce, security, checkout, maintenance]
cta_title: "Want payment plugin security updates tested before they touch checkout?"
cta_text: "The Care Plan covers updates tested on staging first, a full regression pass and a written update each cycle."
cta_url: /care-plan/
cta_label: "See the Care Plan"
image:
  path: /assets/imgs/blog/og-woocommerce-stripe-gateway-security-update.png
  width: 1200
  height: 630
  alt: "WooCommerce Stripe Gateway Security Update: Check Your Version"
---

If your store uses the WooCommerce Stripe Gateway (also listed as "Stripe for WooCommerce"), update it to 11.2.0 now, or to 11.1.2 if you need to stay on the 11.1.x branch. The WooCommerce developer blog published that guidance on 11 November 2026 as a security fix. Stores that ran version 10.9.0 with a specific checkout setup have an extra task: a bug in that version could store a customer's new account password in plain text in order data.

The facts below come from the WooCommerce developer blog, the plugin changelog and the WordPress.org plugin API, read on 12 November 2026. Recheck them if you are reading later, because follow-up releases are possible.

## What the Stripe Gateway security update says

The [WooCommerce developer blog post](https://developer.woocommerce.com/2026/11/11/stripe-gateway-security-update/) says the update addresses security issues found through Automattic's internal scanning and through issues disclosed to Automattic. It states there is no evidence the issues have been exploited, and that the most significant ones could allow fraudulent purchases. It does not list CVE identifiers, severity ratings or technical details of each issue, so I will not rank them or guess at how they work.

The fixes were applied to two branches, which is why there are two target versions:

- **11.2.0** is the standard update. WordPress.org listed it as the current version, released 10 November 2026.
- **11.1.2** is for stores that need to stay on the 11.1.x line. The post gives manual download steps for it. I could not find 11.1.2 in the public changelog files I read, so I cannot tell you what else it contains beyond what the blog post says.

One requirement matters before you click anything: the post says 11.1.2 and 11.2.0 require WordPress 6.9 and WooCommerce 11.0. WordPress.org also lists PHP 7.4 as the minimum. If your store runs an older WooCommerce or WordPress, the Stripe update may not be offered, and you will need to update those first. That is a bigger change and deserves its own plan, as covered in [how to update WooCommerce plugins safely with a staging workflow]({{ '/blog/update-woocommerce-plugins-safely-staging/' | relative_url }}).

## Check the installed version first

Do this even if automatic updates are on or your host manages updates. The developer post says the same.

1. In WordPress admin, open **Plugins > Installed Plugins** and find **WooCommerce Stripe Gateway**.
2. Read the version number under the plugin name.
3. If it is below 11.2.0, or below 11.1.2 on the 11.1.x line, you do not have the fix.
4. Check staging and development copies too, if they are reachable from the internet. The post specifically says a completed update on one site does not confirm the status of another.

If the update is not offered or fails, the post tells you to contact WooCommerce Support with the installed Stripe version and any error message shown.

## The plain text password issue: who is actually affected

This part is narrow, and worth reading carefully before you worry or dismiss it. According to the developer post, the bug could save a customer's new account password in plain text in the store's order data only when **all** of these were true:

- The store was running Stripe Gateway **10.9.0**.
- The store used **classic checkout** (the shortcode checkout, not the checkout block) and showed Stripe Express Checkout buttons on the checkout page.
- A shopper **created an account with a password at checkout** and paid with **Apple Pay or Google Pay**.

If any one of those did not apply, the post's description does not cover you. Version 10.9.0 was released on 17 August 2026 according to the plugin changelog, and 10.9.1 followed on 31 August. The post says 10.9.1 stopped new passwords from being stored this way, and that starting with 11.1.0 the plugin removes previously stored passwords from order records in the background after the update. The changelog for that cleanup reads "Remove account password data that may have been stored in order metadata by express checkout in version 10.9.0".

If the cleanup finds and removes stored password data, the plugin shows a notice in WordPress admin and emails the site administrator. The email includes a count of accounts that still use a password found in the removed data. The cleanup does not change or reset customer passwords.

### What to do if your store matched those conditions

The post says to check backups, order exports and services that sync order data for copies of the stored passwords, even if you received no email. It also suggests considering asking affected customers to reset their store password and change it anywhere else they used it.

Here is how I would approach that practically:

- **Work out the exposure window.** It runs from when you installed 10.9.0 until the cleanup ran after updating to 11.1.0 or later. The plugin changelog gives the release dates above.
- **List where order data goes.** Accounting tools, shipping software, a CRM, spreadsheet exports and database backups can all hold copies. The password sat in order metadata, so anything that copies order metadata may have it.
- **Remember who could see it.** The post says administrators and shop managers could see the passwords in order details, and that WP-CLI and the REST API could expose them too. It also says it cannot determine whether anyone viewed them. If you have shop managers or integrations with order access, include them in your review.
- **Get proper advice on notification duties.** Whether a stored-password exposure triggers any legal or contractual obligation depends on where you and your customers are. I am not able to advise on that.

## What the 11.2.0 changelog shows, and what it does not

The 11.2.0 changelog lists a long set of "Important Fixes and Updates". Several lines are plainly about payment integrity, for example refunding or voiding a Stripe payment that succeeds for an order already cancelled, preventing a second charge when an interrupted checkout is resubmitted, and preventing the same payment intent from being linked to more than one order. Others concern credentials, such as returning Stripe secret keys and webhook secrets masked from the payment gateways REST API.

The developer post does not say which of these lines correspond to the security issues it describes, so do not treat any single line as "the" vulnerability. What the changelog does tell you is which behavior changed, and that is useful for testing.

Two entries deserve attention if your checkout has customizations. First, "Strengthen order matching when processing payment notifications" and the payment intent linking fix can change how orders and payments pair up, which matters if you run custom order-handling code or a second plugin that edits Stripe-related order data. Second, the webhook fixes include "Rebuild a mode's webhook on update when an earlier 'Reconfigure webhooks' click registered it in the wrong mode". That is a reason to check webhook status after the update, not a reason to avoid it.

## A safe update routine for a live store

1. **Back up first**, files and database, and confirm you can restore it. Payment plugins touch order data, so a database backup matters here.
2. **Update staging first** if you have it. Place a test order with every payment method you offer through Stripe, including Apple Pay or Google Pay if you show those buttons, and a card that requires 3D Secure authentication. Use Stripe's test mode and test cards, never real card numbers.
3. **Test the awkward paths, not only a clean checkout:** pay with a coupon, pay as a guest and as a logged-in customer, pay from the Pay for Order link in a customer email, and refund one test order from the WooCommerce order screen.
4. **Check webhooks** in the Stripe settings and in the Stripe Dashboard after the update. A webhook that fails silently is the type of problem that shows up days later as orders stuck in the wrong status, which is covered in [why WooCommerce orders get stuck on pending payment or on hold]({{ '/blog/woocommerce-orders-stuck-pending-payment-on-hold/' | relative_url }}).
5. **Update production at a quiet time**, then confirm the version number and watch the order list, the payment status in Stripe and customer emails for the next day or two.
6. **Do not stack changes.** WooCommerce 11.3.0 was also released on 11 November. The Stripe update requires WooCommerce 11.0, not 11.3, so you do not need to take both in the same sitting. Updating the payment plugin on its own means a checkout problem points to one change. The [WooCommerce 11.3 pre-update checklist]({{ '/blog/woocommerce-11-3-update/' | relative_url }}) is the place to plan the second step.

If checkout breaks after the update, the quickest safe way to isolate the cause is the method in [finding a plugin conflict without taking the live site down]({{ '/blog/woocommerce-plugin-conflict-without-downtime/' | relative_url }}).

## For agencies and people who manage many stores

The developer post asks agencies and developers to verify the installed version on every site they manage, keep a record of which sites were checked and follow up on those that still need attention. For stores managed by a host or another developer, confirm the installed version with that person.

A simple version of that record is a spreadsheet with the site, environment (production or staging), installed Stripe version, whether it uses classic checkout with Express Checkout buttons, whether it ran 10.9.0 at any point, and the date you verified it. The 10.9.0 column is the one that is easy to forget, because a store now on 11.2.0 gives no sign that it once ran the affected version. Check the change history of the site's plugin updates, your update logs or your backups from August if you need to know.

## Limits of this guidance

Updating removes the known fixed issues. It does not undo fraud that already happened, and the developer post says it has no evidence of exploitation, which is not the same as proof that none occurred. If you see unexplained orders, refunds or Stripe charges that do not match your order list, treat it as an incident. The post on [signs of a checkout card skimmer]({{ '/blog/woocommerce-checkout-card-skimmer-signs/' | relative_url }}) covers a different threat, but its checklist for unexpected code on the checkout page is a reasonable second look, and [what to do in the first hour if WordPress is hacked]({{ '/blog/wordpress-hacked-what-to-do-first-hour/' | relative_url }}) covers the response if something looks wrong.

I would also read the [full 11.2.0 changelog on WordPress.org](https://wordpress.org/plugins/woocommerce-gateway-stripe/#developers) once, since it is public and short enough to scan for features your store relies on.

If you would rather have someone sequence the update, test the payment paths and send a written result, the Care Plan below covers that. If you suspect checkout or payment problems already exist, a [WooCommerce Store Audit]({{ '/woocommerce-audit/' | relative_url }}) is the more direct starting point.
