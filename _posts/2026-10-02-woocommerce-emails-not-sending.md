---
title: "WooCommerce Emails Not Sending: What to Check, in Order"
description: "WooCommerce emails not sending? Work from the cheapest check to the deepest: order status, the email toggle, recipients, sender address, then wp_mail errors."
read_time: "7 min read"
excerpt_text: "Missing order emails have a short list of causes. Here is the order I would check them in, and how to see the actual mail error instead of guessing."
tags: [woocommerce, debugging, checkout, maintenance]
cta_title: "Want the email path checked along with the rest of the store?"
cta_text: "The WooCommerce Store Audit covers checkout, plugin conflicts and payment gateway health, and ends in a written report with the problems ranked."
cta_url: /woocommerce-audit/
cta_label: "See the Store Audit"
image:
  path: /assets/imgs/blog/og-woocommerce-emails-not-sending.png
  width: 1200
  height: 630
  alt: "WooCommerce Emails Not Sending: What to Check, in Order"
---

If WooCommerce emails are not sending, the cause is almost always one of five things: the order never reached the status that triggers the email, that email is switched off, the recipient is empty or invalid, the sender address is being rejected, or the server fails to hand the message on. Check them in that order. The first three take a few minutes and need no code.

The order matters because the last two are the ones people jump to (install an SMTP plugin, blame the host), and they are the hardest to confirm. Rule out the simple ones first, then look at the actual error.

Anything below that changes code or settings on a live store should be tried on a staging copy first, with a backup you have confirmed you can restore.

## 1. Did the order reach the right status?

Each WooCommerce email is tied to a status change. In WooCommerce's source, the list of hooks that send transactional emails includes `woocommerce_order_status_pending_to_processing`, `woocommerce_order_status_failed` and the refund hooks, among others. An order that is still "Pending payment" has not triggered the "Processing order" email, because nothing has moved it to Processing yet.

So if a customer abandoned the payment page, no email is correct behaviour. If customers did pay and orders still sit on Pending payment, the problem is upstream of email: the gateway's confirmation (webhook or return URL) is not arriving. That is a different diagnosis from a mail problem, and it is worth separating early.

Open the order, look at the notes on the right. The status changes are logged there with timestamps. If the status never changed, stop looking at email.

## 2. Is that specific email enabled?

Go to WooCommerce, Settings, Emails. Each email type has its own row and its own "Enable this email notification" checkbox. The checkbox is per email, so "New order" can work while "Processing order" is off, which looks like "customers get nothing, admin gets everything".

In the code, a disabled email is skipped before anything else happens. There is no error, no log line in a default install, just silence. That is why this check comes before any technical one.

Plugins can also switch an email off from code through the `woocommerce_email_enabled_{id}` filter, so an enabled checkbox does not fully prove the email is allowed. If the box is ticked and mail still does not go, a plugin touching that filter is a candidate for the conflict test further down.

## 3. Is there a valid recipient?

For customer emails, the recipient is the order's billing email. For admin emails, it is the recipient list in that email's settings, which defaults to the site admin address.

WooCommerce splits the recipient field on commas and drops anything that fails WordPress's `is_email()` check. If nothing valid is left, the email is not sent at all. Two practical consequences:

- A typo like a trailing space is trimmed, but a missing `@` or a full-width comma is not, and the address silently disappears.
- A customer who mistyped their email at checkout will never get the email, and nothing on your side is broken.

Open the failing order and read the billing email character by character. Then open the admin email's settings and read the recipient field the same way.

## 4. Admin "New order" email arrives once, then never again

This one catches people who test by resending. The "New order" email records a `_new_order_email_sent` flag on the order after it sends successfully, and the code returns early if that flag is already set. Re-triggering the new order email for the same order from code will not produce a second admin email unless something enables the `woocommerce_new_order_email_allows_resend` filter, which defaults to false.

When you test, place a fresh test order each time, not the same one repeatedly. Otherwise you can conclude "email is broken" from a working system.

## 5. Look at the sender address

If the first four checks pass, the mail is being built and handed to WordPress. Now look at who it claims to be from.

In WooCommerce, Settings, Emails, the "Email sender options" section holds the From name and "From" address. WooCommerce applies these through the `wp_mail_from` filter when it sends. If that field is empty or invalid, WordPress core falls back to `wordpress@` plus your domain. Core's own comment notes that some hosts block outgoing mail from that address when it does not exist.

My recommendation: use a real mailbox on your own domain as the From address, not a free webmail address (Gmail, Outlook and similar) and not an address on a domain you do not control. Mail claiming to be from a domain it was not sent by is exactly what receiving servers are built to reject or send to spam. How strictly this is enforced differs by host and mail provider, so check yours.

## 6. Read the real error from wp_mail

By default WooCommerce sends through WordPress's `wp_mail()`. (A plugin can swap that function through the `woocommerce_mail_callback` filter, which matters if you use a mail plugin that replaces it.) When `wp_mail()` fails inside PHPMailer, core fires a `wp_mail_failed` action with the error message. Nothing prints that by default, so you can log it:

```php
// Temporary: put in a small mu-plugin on staging, remove after testing.
add_action( 'wp_mail_failed', function ( $error ) {
	error_log( 'wp_mail_failed: ' . $error->get_error_message() );
} );
```

Then place a test order and read the PHP error log. Enable `WP_DEBUG_LOG` in `wp-config.php` if you do not know where your log is, and turn it off again afterwards.

Two details about what this does and does not tell you:

- A logged error is a real answer (authentication failed, could not connect, invalid address). Fix that specific thing.
- No logged error does not mean delivery. Core's `wp_mail_succeeded` hook documentation says it only means the send method processed the request without errors, not that the message arrived. The server can accept a message that the recipient's provider then rejects or files as spam.

WooCommerce also fires `woocommerce_email_sent` with a true/false result and the email ID, which is useful if you want to log which email types are actually leaving.

## 7. Delivered, but not received

If there is no error and the mail leaves the server, the problem has moved to deliverability. Mail sent straight from a shared web host often has no authentication tied to your domain. The usual fix is to send through a proper transactional mail service or your mailbox provider over SMTP, and to set the SPF and DKIM records that provider tells you to add (DMARC after those pass). Your provider's own setup page has the exact records for your domain, and I would follow it rather than any generic list.

Send a test to a few different providers, and check the spam folder before assuming loss.

## 8. Late rather than missing

WooCommerce can queue transactional emails instead of sending them during the checkout request. In the source this is controlled by the `deferred_transactional_emails` feature and the `woocommerce_defer_transactional_emails` filter. If emails arrive minutes late or in bursts, rather than not at all, that is the place to look, together with a check that your site's scheduled tasks run reliably. The queue can be turned off with that filter on staging to see whether timing is the issue. Its default depends on your WooCommerce version.

## 9. The plugin conflict test

If settings, recipients and the mail log all look fine and emails still do not leave, a plugin is probably interfering. Candidates are email customizers, multilingual plugins, anything touching `wp_mail`, and security plugins that block outbound connections.

Do the test on staging: switch to a default theme, deactivate everything except WooCommerce and your mail plugin, place a test order, then reactivate plugins in small groups. Doing it on production means real customers hitting a stripped-down checkout.

## What I would skip

I would not install a second SMTP plugin on top of a first one, or keep flipping settings without logging the error. Two mail plugins both hooking into `wp_mail` make the next failure harder to read. Get the one error message, then change one thing.

If you want a second pair of eyes on the whole email path, plus the rest of checkout, the [WooCommerce Store Audit]({{ '/woocommerce-audit/' | relative_url }}) covers it. The related checkout-side failure is described in [WooCommerce orders silently failing: a race condition]({{ '/blog/woocommerce-orders-silently-failing-race-condition/' | relative_url }}), and slow checkouts have their own causes in [why WooCommerce gets slower over time]({{ '/blog/woocommerce-slow-checkout-action-scheduler-autoload/' | relative_url }}).
