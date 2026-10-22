---
title: "WooCommerce INP: How to Find and Fix Slow Interactions"
description: "WooCommerce INP and slow interactions: the 200 ms and 500 ms thresholds, how to find the slow tap in field data, and the checkout and cart scripts behind it."
read_time: "8 min read"
excerpt_text: "Interaction to Next Paint measures how long your store takes to react after a shopper taps something. Here is how to read the number, find the slow interaction, and fix it without breaking checkout."
tags: [woocommerce, performance, core-web-vitals, checkout]
cta_title: "Want the slow interactions on your store written down?"
cta_text: "The WooCommerce Store Audit checks mobile and desktop performance, checkout, plugin conflicts and more, and gives you a prioritized written report."
cta_url: /woocommerce-audit/
cta_label: "See the Store Audit"
image:
  path: /assets/imgs/blog/og-woocommerce-inp-slow-interactions.png
  width: 1200
  height: 630
  alt: "WooCommerce INP: How to Find and Fix Slow Interactions"
---

WooCommerce INP (Interaction to Next Paint) is the time between a shopper tapping, clicking or typing and the browser painting the next frame that shows a result. Google rates it at the 75th percentile of real page loads: 200 milliseconds or less is good, 200 to 500 needs improvement, and above 500 is poor. Slow interactions on a store are almost always JavaScript keeping the main thread busy when someone presses Add to cart or edits a checkout field.

This guide shows how to read your number, find the one interaction responsible, and fix the usual WooCommerce causes.

## What INP measures (and what it does not)

INP looks at every click, tap and key press during a visit and reports roughly the slowest one. For pages with many interactions it ignores one of the highest for every 50, so a single random hiccup does not define the page. Scrolling and hovering do not count.

Each interaction has three parts, and the fix depends on which part is large:

- **Input delay:** the page was busy (loading scripts, running a timer) when the shopper tapped, so the handler could not start.
- **Processing time:** your event handlers ran, and they ran for too long.
- **Presentation delay:** the handlers finished, but the browser needed a long time to lay out and paint the result, usually because the page is large or heavy to render.

One detail trips people up: INP stops at the next paint, not at the end of a network request. If a tap sends an AJAX request and the page shows a spinner straight away, the interaction can still be fast. The trouble starts when the main thread is blocked before the spinner can appear, or when the response handler does a lot of work and the shopper taps again in the meantime.

INP replaced First Input Delay as a Core Web Vital in March 2024, so older guides that talk about FID are measuring the wrong thing. If you also see a gap between desktop and phone results, the [mobile versus desktop speed guide]({{ '/blog/woocommerce-mobile-slower-than-desktop/' | relative_url }}) covers the loading side of that problem.

## Find the slow interaction in field data first

INP only exists for real users, because it needs someone to interact. Start there, not with a lab score.

1. Enter your URL in PageSpeed Insights and read the field data section at the top (this comes from the Chrome User Experience Report). It shows INP for the page and for the whole origin when there is enough traffic. Low-traffic stores often have no INP data at all, which means there is nothing to fail yet, not that the store is fine.
2. Check the product page, the cart and the checkout separately. A fast homepage tells you nothing about checkout.
3. If you want the exact interaction that was slow, you need real user monitoring. Google's `web-vitals` JavaScript library has an attribution build that reports which element and which phase of the interaction was responsible.

Then reproduce it yourself on a phone, or in Chrome DevTools with CPU throttling turned on. Open the Performance panel, record, tap the suspect button, and look for the long task (flagged in red) that overlaps the interaction. The three phases above are shown in the interaction's breakdown, which tells you whether to look at what was running before the tap, the handler itself, or rendering.

Do all of this on a staging copy if you plan to change anything afterwards. Checkout scripts are the last place to experiment on a live store.

## Where WooCommerce INP slow interactions usually come from

These are patterns in how WooCommerce and typical stores are built, not guarantees about your site. Confirm each one in the recording before changing anything.

### Checkout fields that trigger a full recalculation

In the classic (shortcode) checkout, the WooCommerce `checkout.js` file listens to field changes and fires an `update_checkout` event, which posts to the `update_order_review` endpoint and replaces the order review and payment HTML. Typing in a field queues an update after a 1 second pause, and other field events trigger updates as well. The source is public in the [WooCommerce repository](https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/client/legacy/js/frontend/checkout.js).

The core code is not the problem on its own. The problem is what hooks into those events: address autocomplete, tax and shipping plugins, analytics that re-fire on every update, and payment gateway scripts that re-initialise their fields each time the payment area is replaced. Each one adds work to the same main thread, right when the shopper is typing.

### Cart fragments and Add to cart

WooCommerce's `cart-fragments.js` posts to the `get_refreshed_fragments` endpoint and swaps the returned HTML into the page, and it handles the `added_to_cart` event. Many themes add a mini cart, a cart counter and a slide-out drawer on top of that. If the drawer renders a large block of HTML or runs animation code inside the click handler, the first frame after Add to cart is late. That is a processing time and presentation delay problem, and it shows up on exactly the button that matters most.

### Third-party scripts doing work at the wrong moment

Chat widgets, review widgets, tag managers, heatmaps and popup tools all run on the same main thread as your store. A script that is still parsing and compiling when the shopper taps causes input delay. Google's own guidance on this is to reduce script evaluation and long tasks during startup. Remove what you do not use first. Deferring or delaying the rest is a second step, and test checkout after each change because a delayed payment script can fail silently.

### Large pages and heavy page builders

A very large DOM makes every visual update slower, because the browser has more to lay out and paint. Long category pages with hundreds of products, and page builder layouts with deeply nested wrappers, are the usual offenders. Google documents `content-visibility` as one way to avoid rendering off-screen sections up front, but test it on your theme before relying on it.

## Fixes, in the order I would try them

1. **Remove before you optimise.** Deactivate scripts that serve no purpose on the interaction pages (cart, checkout, product). Fewer scripts fixes input delay and processing time at once.
2. **Fix the plugin, not the platform.** If the recording shows the long task inside one plugin's file, check its settings and update it before reaching for a performance plugin. Report the problem to its developer with the recording attached.
3. **Break up long handlers.** If you or your developer own the code, do the minimum needed to show feedback inside the handler, then hand the rest to a later task. Google's guidance is to yield to the main thread so the browser can paint, for example by running non-urgent work in a `setTimeout` inside a `requestAnimationFrame` callback.
4. **Keep the interface light after a tap.** Show the cart count and a small confirmation first. Load the full drawer content afterwards.
5. **Do not trade INP for broken checkout.** Delaying or combining scripts with an optimisation plugin can improve a score while payment fields stop loading. After any change, place a test order with each payment method you offer.

Take a backup and use a staging copy for all of this. Re-measure in field data afterwards, but expect the CrUX figure to lag, since it reflects real visits over a rolling period rather than a single test.

## What I would skip

Chasing the lab score is the main trap. A Lighthouse run does not click anything, so it cannot report INP, and a perfect lab score says nothing about the Add to cart button. Treat field data as the verdict and the DevTools recording as the diagnosis.

If you want the slow interactions on your store found and written down, the [WooCommerce Store Audit]({{ '/woocommerce-audit/' | relative_url }}) covers checkout and performance together. If updates and plugin changes keep making things slower, the [update workflow on staging]({{ '/blog/update-woocommerce-plugins-safely-staging/' | relative_url }}) helps you catch it before shoppers do. Google's [INP documentation](https://web.dev/articles/inp) has the full definition and the official thresholds.
