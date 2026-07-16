---
title: "Why WooCommerce Orders Fail Silently, and How to Trace a Payment Race Condition"
description: "A WooCommerce store was silently losing ~12% of orders. Three developers missed it. Here's how I traced it to a race condition between the payment gateway and a custom order status, and how you can debug the same class of bug."
read_time: "7 min read"
excerpt_text: "A WooCommerce store was silently losing ~12% of orders. Here's how I traced it to a race condition between the payment gateway and a custom order status."
tags: [woocommerce, debugging, payments]
---

<!--
  SAMPLE POST: review and edit before publishing.
  This is written from a real problem pattern. Swap in your own specifics
  (exact gateway, exact numbers, real code) where marked, or use as-is if it fits.
  Delete this comment before going live.
-->

Some of the most expensive WooCommerce bugs never throw an error. The order just... doesn't appear. The customer's card gets charged, the payment gateway shows success, but WooCommerce has no record of the sale. No error log, no failed-order email, nothing.

This is the story of one such bug on a store that was silently losing roughly **12% of its orders**, and the debugging process that found it. If your store has a gap between payments taken and orders recorded, the same approach applies.

## The symptom: money in, no order out

The client noticed it the slow way: a customer emailed asking where their product was. The charge was on their statement. WooCommerce had no order. Then it happened again. And again.

By the time it reached me, three developers had already looked at it and moved on. The reason it's so hard: **there is nothing to see in the obvious places.** The order that fails never gets written, so it can't show up in a report, an error log, or a failed-order query.

## Step 1: Reconcile the gateway against WooCommerce

The first move is not to read code. It's to **prove the gap exists and measure it.** Pull every successful transaction from the payment gateway's dashboard for a date range, then pull every WooCommerce order for the same range, and diff them.

```
Gateway successful charges:   1,000
WooCommerce orders recorded:    880
Missing:                        120  (12%)
```

Now you have two things: proof it's real, and a set of *specific* failed transactions with timestamps you can investigate. That list is the entire key to the rest of the debugging.

## Step 2: Look for what the failures have in common

Line up the failed transactions and look for a pattern. Time of day? Product? Payment method? In this case the tell was **timing**: the failures clustered around traffic spikes, and every one of them had a gateway callback (webhook) that landed within a second or two of the customer returning to the site.

That is the fingerprint of a **race condition**, meaning two processes touching the same order at the same time, one clobbering the other.

## Step 3: Map the two racing paths

WooCommerce records an order from a gateway through (at least) two independent paths:

1. **The customer redirect.** The shopper returns from the gateway to the *thank-you* URL, which triggers order processing.
2. **The server-to-server webhook.** The gateway calls your site directly to confirm payment, often within the same second.

Both paths try to move the order into a paid state. Normally WooCommerce's locking handles this. But this store had a **custom order status** injected between "pending" and "processing," added years earlier for a fulfillment workflow. That custom status changed the state machine just enough that when both paths fired together, one path saw a status it didn't expect, bailed out, and left the order half-written. Under load, that's your 12%.

## Step 4: Confirm before you fix

A theory isn't a fix. Reproduce it: fire the redirect and the webhook concurrently against a staging order in the custom status, and watch it fail on demand. Once it fails reliably in staging, you *know* you have the real cause, not just a plausible one.

```php
// Reproduce: hit the return handler and the webhook handler
// against the same order id within the same request window.
// If the order is left in the custom status with no order note
// from one of the handlers, you've reproduced the race.
```

## The fix

The durable fix is not "remove the custom status," since that would break fulfillment. It's to make the order transition **atomic and idempotent**:

- Wrap the state transition so only one path can win, using a proper lock on the order.
- Make each handler **idempotent**, so running it twice is safe and produces the same result.
- Teach both paths about the custom status explicitly, so neither one bails when it sees a state it wasn't written to expect.

Two days of work, most of it in reproduction and verification rather than the patch itself. The writeup of exactly what broke and why mattered as much as the code: it stops the same class of bug from being reintroduced the next time someone adds a status.

## The takeaway

Silent WooCommerce order loss is almost never a "WooCommerce bug." It's an interaction between a custom status, a plugin, a gateway, and concurrency, one that only shows up under real traffic. To find it:

1. **Reconcile** gateway charges against recorded orders. Measure the gap.
2. **Cluster** the failures to find the fingerprint (here: timing).
3. **Map** every path that writes the order state.
4. **Reproduce** in staging before touching the fix.
5. Make transitions **atomic and idempotent**.

If your store has a gap between payments taken and orders recorded, it is costing you money right now, quietly. That's exactly the kind of problem I trace and fix.
