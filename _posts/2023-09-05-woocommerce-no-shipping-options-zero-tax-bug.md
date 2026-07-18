---
title: "Why WooCommerce Shows 'No Shipping Options' (and $0 Tax on Every Order)"
description: "A WooCommerce store charged $0 tax on every order and showed no shipping options at all. Three conflicting plugins and a dead API key, found and fixed."
read_time: "8 min read"
excerpt_text: "A store was charging $0 tax on every single order and couldn't ship internationally at all. Neither problem was a WooCommerce bug. Here's the actual checklist that found both."
tags: [woocommerce, shipping, tax, debugging]
---

Two symptoms, one store: every order was being taxed at exactly $0, and international customers hit a checkout page with no shipping method available at all, just an empty space where rates should be. Neither one looked related to the other. Both were.

If your WooCommerce store has either of these symptoms, the cause is almost never "WooCommerce is broken." It's a small set of specific, checkable things. Here's the order to check them in, taken from a real store audit that found three separate root causes stacked on top of each other.

## Symptom 1: every order shows $0 tax

Zero tax on every order looks like a settings problem, and sometimes it is, but check this first: **is a third-party tax plugin installed with no API key configured?**

That was the actual cause here. A tax-automation plugin (the kind that calculates tax by address using an external service) was active, which meant it was silently overriding WooCommerce's own built-in tax calculation. But its API key field was empty. So every request to calculate tax failed silently, and the plugin's failure mode was to return $0 rather than throw a visible error. WooCommerce's native tax settings were sitting there, correctly configured, completely ignored, because the third-party plugin had taken over the calculation and was failing quietly.

**How to check this yourself:**

1. Go to WooCommerce → Settings → Tax. If the rates you expect are configured here but every order still shows $0, something is intercepting the calculation before your rates apply.
2. Check your active plugins for anything tax-automation related (TaxJar, Avalara, and similar services are common). If one is active, open its settings and confirm the API key field is actually filled in and valid, not just present.
3. If the plugin doesn't have a valid key, either configure it properly or deactivate it. Don't delete it yet, deactivating first lets you confirm that's really the cause before you commit to removing it.

The fix here was to deactivate the tax-automation plugin (no valid key existed for it, and no service to send valid data to was in place) and configure a flat regional tax rate directly in WooCommerce's own tax settings instead. Simpler, correct, no external dependency to fail silently again.

## Symptom 2: no shipping options at checkout

This one had two separate causes stacked together, which is what made it confusing.

### Cause A: conflicting shipping plugins

The store had **three separate shipping-carrier plugins installed and active at the same time**, all trying to calculate live rates for the same carrier. When multiple plugins register shipping methods for the same zone, WooCommerce doesn't necessarily error out, it can just end up with a tangle of conflicting or duplicate methods that fail to resolve into anything the checkout can display. The result looks identical to "no shipping options," which is exactly what makes it easy to misdiagnose as a single missing configuration rather than a conflict.

**Check:** Plugins → look for more than one plugin handling the same carrier's live rates. If you find duplicates, deactivate all but one before doing anything else. Test again before moving to the next step, since this alone may resolve the symptom.

### Cause B: missing product weight data

Live carrier rate APIs (UPS, FedEx, and similar) need a package weight to return a rate. If your products have no weight set, the rate request goes out with incomplete data and the carrier API has nothing to quote against. No rate comes back, so nothing displays at checkout. This is invisible in the WooCommerce admin because nothing errors, the request that should return rates simply returns none.

**Check:** Products → open a few products in the affected categories → check the Shipping tab for a Weight field. If it's blank, that's your second cause. Products, Bulk Edit, or a CSV import are all fine ways to backfill this at scale once you know it's missing.

### Cause C (the one that isn't a bug at all)

After fixing A and B, one more report came in: still no shipping options, for one specific customer. This is worth calling out because it's a trap. The instinct is to assume the fix didn't work. In this case, the actual cause was an invalid address entered at checkout, the carrier API correctly returned no valid rates for an address it couldn't resolve. Once the customer corrected the address, rates appeared immediately and correctly.

**Lesson:** after you fix a real shipping bug, don't assume every subsequent "no shipping options" report is a regression. Check the specific address first. Sometimes the system is working exactly as designed.

## The full checklist, in order

If you're facing either symptom, work through this in sequence, don't skip ahead:

1. **Zero tax:** Check WooCommerce's own Tax settings first, then check for an active tax-automation plugin with a missing or invalid API key. Deactivate it or fix the key.
2. **No shipping options:** Check for multiple plugins handling the same carrier. Deactivate duplicates, keep one, retest.
3. **Still no shipping options:** Check product weight data. Live carrier rates can't calculate without it.
4. **Still failing for one customer only, after 1 to 3 are fixed:** Check the address they entered before assuming it's a regression.
5. **International orders specifically failing:** Confirm the store's selling locations aren't restricted to a single country in WooCommerce → Settings → General.

## The takeaway

"WooCommerce is broken" almost never means WooCommerce itself has a bug. In this store, three unrelated, individually small issues (a dead tax API key, duplicate shipping plugins, and missing product weights) combined to make the checkout look completely broken. Each one was fixed independently, verified independently, and together they took the store from domestic-only with silently zero tax to fully international with accurate live shipping rates and correct tax on every order.

If your store shows either of these symptoms, work the checklist in order before you touch a single line of code. Most of this is configuration, not development, and finding that out early saves you from debugging something that was never actually broken in the first place.
