---
title: "Why Pinch-to-Zoom Stops Working in Your WordPress Gallery Lightbox"
description: "A photography site's gallery plugin was silently blocking native pinch-to-zoom on mobile, and the client's earlier attempts to fix it with a different lightbox plugin made things worse. Here's how the actual cause was found by reading the plugin's own bundled JavaScript, not by guessing."
read_time: "8 min read"
excerpt_text: "Pinch-to-zoom refused to work in a photo gallery's mobile lightbox, and swapping lightbox plugins had already made it worse once. The real cause was one function, deliberately written into the plugin itself."
tags: [wordpress, javascript, debugging, mobile]
image:
  path: /assets/imgs/blog/og-photo-gallery-plugin-disables-pinch-zoom-mobile.png
---

A photography site with several hundred nested galleries had a specific, narrow complaint: two-finger pinch-to-zoom did not work inside the lightbox on mobile. Tap a thumbnail, the full image opens, and phones simply refuse to zoom on it, even though the same gesture works everywhere else on the page.

The site owner had already tried to fix this once by installing a second lightbox plugin. It made nothing better and introduced its own leftover mess. That detail matters, because it rules out the obvious first guess and points at something more specific going on.

## The instinct to avoid: swapping the lightbox

When a lightbox misbehaves, the reflex is to replace it. A different, more modern lightbox library, the thinking goes, will just work. That is exactly what had already been tried here, and it explains why it failed: a second lightbox plugin was installed and activated, but it never actually took over the galleries. It sat there, fully loaded, with zero effect, because the gallery markup on the page did not match what the new plugin was looking for. It had nothing to attach to.

That is a common failure mode with lightbox swaps on an established gallery plugin: the new plugin binds to `<a>` tags or a data attribute pattern the old one doesn't produce, so it loads, does nothing, and now you have two lightbox libraries' worth of JavaScript running for a feature that still doesn't work. Worth checking for on any site where "we tried a plugin for this already": is the old attempt actually inactive, or is it just silently doing nothing?

## Ruling out the usual suspects first

Before touching anything, it's worth confirming what pinch-zoom actually needs to work, so you know what you're ruling in or out:

1. **The viewport meta tag** must allow it. `user-scalable=no` or `maximum-scale=1` in `<meta name="viewport">` disables native pinch-zoom outright, this is the single most common cause across WordPress sites generally.
2. **No `touch-action: none`** (or a restrictive `touch-action` value) on the image or its ancestors, since that CSS property can independently block browser-native touch gestures.
3. **No JavaScript touch handler** calling `preventDefault()` on multi-touch events, which would intercept the gesture before the browser gets to act on it.

On this site, all three were checked directly, not assumed. The viewport tag as originally served was clean. No restrictive `touch-action` existed anywhere in the lightbox's DOM chain, confirmed by reading computed styles on every ancestor element, not just the image itself. The plugin's own touch-gesture helper library was read in full, and it explicitly ignores multi-touch events in both its touch-start and touch-end handlers, and never calls `preventDefault()` anywhere in its source.

So the browser wasn't blocked by CSS, and the plugin's own gesture library wasn't fighting the browser. Which meant the viewport tag itself had to be getting changed, somewhere, after the page loaded.

## Finding it: read the plugin's own bundled JavaScript

This is the step that actually matters, and it's the one people skip because minified vendor JS looks unreadable. It isn't, you just need to search it for the right thing rather than trying to read it top to bottom.

Since the viewport tag was clean on initial page load but pinch-zoom still didn't work once the lightbox opened, the obvious question is: does anything modify that tag *after* the page loads? Fetching the plugin's bundled `scripts.min.js` directly and searching it for `viewport` turned up exactly one function:

```js
function bwg_reset_zoom(){
  var isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    .test(navigator.userAgent.toLowerCase()),
      viewportTag = document.querySelector('meta[name="viewport"]');
  isMobile && viewportTag && (viewportTag.content =
    "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0");
}
```

And confirming every place that function gets called showed it fires automatically, every time the lightbox opens, on any mobile user agent. It rewrites the page's own viewport tag in place, forcing `user-scalable=0`. That single line is the entire cause. Not a CSS conflict, not a competing plugin, not the touch library, a deliberate function the plugin ships with, presumably written to prevent the *page itself* from zooming while a full-screen lightbox is open, but with the side effect of killing pinch-zoom on the image inside that lightbox too.

## Why this diagnosis is good news, not bad news

Once you know the cause is one function rewriting one attribute, the fix stops being scary. It doesn't require replacing the lightbox (which is what already went wrong once here), and it doesn't require touching the gallery structure at all, however large or deeply nested it is. It's a small, targeted override: let the plugin's own zoom-reset behavior run for the rest of the page as it was designed to, but stop it from stripping `user-scalable` specifically while the lightbox is the thing on screen, or re-apply a permissive viewport value right after the plugin's own function runs.

That's a meaningfully different scope than "rebuild the lightbox," and it's why tracing the actual root cause before proposing a fix matters. A wrong diagnosis here (blame the touch library, blame a CSS conflict, blame the gallery plugin generally) leads to a much bigger, riskier fix than the problem actually needs.

## The general pattern, for your own site

If pinch-zoom or any other native mobile gesture stops working somewhere specific on a WordPress site, and it works fine everywhere else:

1. Check the viewport meta tag as served in the initial HTML, most browser dev tools show this instantly in the Elements panel.
2. If that's clean, the tag is likely being rewritten by JavaScript after load. Search any plugin bundles active on that specific page for the string `viewport` or `user-scalable`, most minified files are still searchable even if they're not readable line by line.
3. Rule out `touch-action` CSS on the element and its ancestors before assuming the cause is JavaScript at all, checking computed styles takes seconds and removes a whole category of guesswork.
4. Resist the instinct to solve a JavaScript problem by installing a different plugin. If the existing one is fighting you with one specific line of code, override that line, don't replace the whole system around it.

## The takeaway

A gesture that fails in one specific part of a page, and nowhere else, is a strong signal that something is deliberately intervening there, not that something is broadly broken. The fix was one function, in the plugin's own source, not a conflict between two systems. Reading the actual bundled JavaScript instead of guessing from symptoms is what turned an "I'll swap the lightbox and hope" situation into a precise, low-risk, three-line fix.
