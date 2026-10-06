---
title: "WooCommerce Orders Stuck on Pending Payment or On Hold: Causes"
description: "WooCommerce orders stuck on pending payment or on hold? What each status means, which gateways set on-hold by design, and how to find the missing callback."
read_time: "8 min read"
excerpt_text: "Pending payment and on hold look similar in the order list but mean different things. Here is how to tell which problem you have and where to look first."
tags: [woocommerce, checkout, debugging, maintenance]
cta_title: "Want someone to trace where the payment step is breaking?"
cta_text: "The WooCommerce Store Audit covers checkout, payment gateway health and plugin conflicts, and ends in a written report with the problems ranked."
cta_url: /woocommerce-audit/
cta_label: "See the Store Audit"
image:
  path: /assets/imgs/blog/og-woocommerce-orders-stuck-pending-payment-on-hold.png
  width: 1200
  height: 630
  alt: "WooCommerce Orders Stuck on Pending Payment or On Hold: Causes"
---

If WooCommerce orders are stuck on pending payment or on hold, first work out which of the two you have, because they point at different problems. Pending payment means WooCommerce created the order and has not been told the money arrived. On hold means WooCommerce is deliberately waiting, and some payment methods put every order there by design. Before you change anything, check the gateway's own dashboard to see whether the customer was actually charged.

Do that check first, every time. Marking an order Processing by hand because the customer emailed a screenshot is how stores ship goods that were never paid for.

## What the two statuses mean in WooCommerce

The core status list includes "Pending payment" and "On hold" as separate statuses. In the WooCommerce source, a gateway finishes a successful payment by calling `payment_complete()` on the order, and that method moves the order to Processing, or to Completed if nothing needs shipping. It is the single point where "paid" gets recorded.

So a pending order usually means one of two things: the customer never finished paying (abandoned, closed the tab, card declined), or they did pay and the message saying so never reached your site. The second case is the one that costs you. The first is normal.

## On hold is often expected

The built-in offline gateways set On hold on purpose:

- Direct bank transfer (BACS) puts a new order on hold with the note "Awaiting BACS payment."
- Check payments do the same with "Awaiting check payment."
- Cash on delivery goes to Processing by default, but to On hold when the order contains a downloadable item.

Each of those statuses can be changed by a filter (for example `woocommerce_bacs_process_payment_order_status`), so a custom snippet or a plugin may have altered the behavior on your store. If your stuck orders all use one of these methods, nothing is broken. Someone has to confirm the payment and change the status, and that is a process question, not a bug.

Card gateways are different. An order sitting on hold with a card or wallet method usually means the gateway plugin is waiting for a confirmation (a fraud review, an asynchronous method, a delayed notification) and has not received it. Read the order notes before anything else. Gateway plugins tend to write what they were waiting for.

## Why a paid order stays pending

For redirect and asynchronous payment methods, the final "paid" signal often arrives separately from the customer's browser, as a webhook or callback from the gateway to your site. If that request never lands, the order stays pending even though the card was charged. The general-purpose causes worth checking, in this order:

1. **The gateway's webhook log shows failures.** Most gateways list delivered and failed notifications with the response your site returned. A 403, 401, 404 or timeout there tells you more than any amount of guessing on the WordPress side.
2. **Something is blocking the callback.** A security plugin, a firewall or CDN rule, HTTP basic auth on the site, or a maintenance-mode plugin can reject requests from the gateway, because they look like unknown bots.
3. **The webhook points at the wrong URL.** After a domain change, an HTTP to HTTPS switch or a staging copy going live, the endpoint registered at the gateway can still be the old one. Re-save the gateway settings so the plugin registers the current one, if your plugin does that.
4. **The site errored while handling it.** Check WooCommerce > Status > Logs for a gateway log around the order time, and the PHP error log for fatal errors in the same minute.
5. **The race between redirect and callback.** The customer's return trip and the webhook can both try to finish the same order. That pattern is covered in the [payment race condition post]({{ '/blog/woocommerce-orders-silently-failing-race-condition/' | relative_url }}).

A detail that helps when you are deciding whether a late callback can still fix an order: `payment_complete()` only acts when the order is currently On hold, Pending payment, Failed or Cancelled. A late "paid" signal can still move an order that WooCommerce already cancelled, but it does nothing if the order is already Processing.

## The automatic cancellation that surprises people

WooCommerce can cancel unpaid pending orders on its own. The setting is at WooCommerce > Settings > Products > Inventory, labelled "Hold stock (minutes)", and its description says the pending order will be cancelled when the limit is reached. The default in the source is 60.

Three conditions from the code are worth knowing:

- It only runs when stock management is enabled. With "Manage stock" off, the cleanup is not scheduled.
- It only cancels orders created through the customer-facing checkout, not orders added by an admin, the REST API or a plugin (a filter, `woocommerce_cancel_unpaid_order`, can change that).
- The check is scheduled through Action Scheduler (or WP-Cron as a fallback), so if scheduled actions are not running, old pending orders just stay there.

That last point is a quick diagnostic. If hundreds of pending orders from weeks ago are still pending, look at WooCommerce > Status > Scheduled Actions for overdue or failed items. A stuck queue is a bigger problem than the pending orders, and it is the same family of issue described in the [slow checkout and Action Scheduler post]({{ '/blog/woocommerce-slow-checkout-action-scheduler-autoload/' | relative_url }}).

Also consider the opposite case: an order that goes pending, then cancelled, while the customer is still on the payment page of a slow gateway. If you set the hold time very low on a store that takes slow payment methods, you can cancel orders that were about to be paid. I would not go below the default unless you know how long your payment methods take.

## Stock and the on-hold status

Status changes move stock. In the WooCommerce source, moving an order to On hold, Processing or Completed reduces stock, and moving it to Pending payment, Cancelled or Failed puts it back. So a batch of on-hold orders is already holding stock against your products, and a bulk change to Cancelled returns it. Do bulk status changes only after you know which orders are really unpaid, and take a database backup first if you are touching more than a handful.

## A sensible order of work

1. Pick one stuck order and read its order notes and the gateway dashboard entry for it.
2. Decide: was the customer charged? If not, it is an abandoned checkout and needs no fix.
3. If charged, check the gateway's webhook delivery log and the response your site gave.
4. Look at WooCommerce > Status > Logs and the PHP error log for that time.
5. Check for firewall, security plugin, basic auth or maintenance mode rules touching the callback URL.
6. Only then change the order status by hand, and add a note saying why.

If you can reproduce the problem, do it on a staging copy with the gateway in test mode, not on the live store. Whatever you change in a payment flow, place a real test order afterwards.

If the stuck orders keep arriving and the logs do not explain them, a structured review of the payment path is cheaper than another round of trial and error. That is what the [WooCommerce Store Audit]({{ '/woocommerce-audit/' | relative_url }}) is for.
