---
title: "Why WooCommerce Orders Fail Silently, and How to Trace a Payment Race Condition"
description: "Card charged, gateway says success, but WooCommerce has no order. How to prove the gap exists, find the pattern, and trace the redirect-versus-webhook race behind it."
read_time: "7 min read"
excerpt_text: "The card is charged and the gateway shows success, but WooCommerce has no order. Here is a step-by-step way to prove the gap, find the pattern, and trace the race condition behind it."
tags: [woocommerce, debugging, payments]
image:
  path: /assets/imgs/blog/og-woocommerce-orders-silently-failing-race-condition.png
  width: 1200
  height: 630
  alt: "Why WooCommerce Orders Fail Silently, and How to Trace a Payment Race Condition"
---

Some of the most expensive WooCommerce bugs never throw an error. The order just doesn't appear. The customer's card gets charged, the payment gateway shows success, but WooCommerce has no record of the sale. No error log, no failed-order email, nothing.

This is a general guide to that class of bug: how to prove it is happening, how to narrow it down, and the most common cause, a race condition between the customer's return to the site and the gateway's webhook. The numbers below are illustrative, to show the method.

## The symptom: money in, no order out

It usually surfaces the slow way: a customer emails asking where their product is. The charge is on their statement. WooCommerce has no order. Then it happens again.

The reason it is so hard to catch: **there is nothing to see in the obvious places.** An order that fails to be written can't show up in a report, an error log, or a failed-order query.

## Step 1: Reconcile the gateway against WooCommerce

The first move is not to read code. It is to **prove the gap exists and measure it.** Pull every successful transaction from the payment gateway's dashboard for a date range, then pull every WooCommerce order for the same range, and diff them.

```
Gateway successful charges:   1,000
WooCommerce orders recorded:    880
Missing:                        120  (12%)
```

Now you have two things: proof it is real, and a set of *specific* failed transactions with timestamps you can investigate. That list is the key to the rest of the debugging.

## Step 2: Look for what the failures have in common

Line up the failed transactions and look for a pattern. Time of day? Product? Payment method? The most common tell is **timing**: failures cluster around traffic spikes, and each one has a gateway callback (webhook) that landed within a second or two of the customer returning to the site.

That is the fingerprint of a **race condition**: two processes touching the same order at the same time, one clobbering the other.

## Step 3: Map the two racing paths

WooCommerce records an order from a gateway through (at least) two independent paths:

1. **The customer redirect.** The shopper returns from the gateway to the *thank-you* URL, which triggers order processing.
2. **The server-to-server webhook.** The gateway calls your site directly to confirm payment, often within the same second.

Both paths try to move the order into a paid state. Normally WooCommerce's locking handles this. But anything that changes the order state machine, such as a custom order status added years ago for a fulfillment workflow, can break the assumption. When both paths fire together, one sees a status it does not expect, bails out, and leaves the order half-written. Under load, that is your missing percentage.

Related, well-documented variants include duplicate webhook callbacks overwriting a correct status, and webhooks that arrive before the order record exists. Both are worth ruling out.

## Step 4: Confirm before you fix

A theory is not a fix. Reproduce it: fire the redirect and the webhook concurrently against a staging order and watch it fail on demand. Once it fails reliably in staging, you *know* you have the real cause, not just a plausible one.

```php
// Reproduce: hit the return handler and the webhook handler
// against the same order id within the same request window.
// If the order is left in an unexpected status with no order note
// from one of the handlers, you've reproduced the race.
```

## The fix pattern

The durable fix is rarely "remove the custom status," since that usually breaks something else. It is to make the order transition **atomic and idempotent**:

- Wrap the state transition so only one path can win, using a proper lock on the order.
- Make each handler **idempotent**, so running it twice is safe and produces the same result.
- Teach both paths about any custom status explicitly, so neither one bails when it sees a state it was not written to expect.

Most of the time goes into reproduction and verification, not the patch itself. Writing down exactly what broke and why matters as much as the code: it stops the same class of bug from coming back the next time someone adds a status.

## The takeaway

Silent WooCommerce order loss is almost never a "WooCommerce bug." It is an interaction between a custom status, a plugin, a gateway, and concurrency, one that only shows up under real traffic. To find it:

1. **Reconcile** gateway charges against recorded orders. Measure the gap.
2. **Cluster** the failures to find the fingerprint (often: timing).
3. **Map** every path that writes the order state.
4. **Reproduce** in staging before touching the fix.
5. Make transitions **atomic and idempotent**.

If your store has a gap between payments taken and orders recorded, it is costing you money right now, quietly. That is exactly the kind of problem I trace and fix.
