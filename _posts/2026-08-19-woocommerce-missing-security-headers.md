---
title: "The Security Headers Most WooCommerce Stores Are Missing (and How to Add Them Safely)"
description: "HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and CSP: what each one does, how to check your store in a minute, and how to add them without breaking checkout."
read_time: "8 min read"
excerpt_text: "In nine store reviews I checked, every one had gaps in its security headers and most were missing all four common ones. Here is what they do, and how to add them without breaking checkout."
tags: [woocommerce, security, hardening]
cta_title: "Want your store checked, not just this one thing?"
cta_text: "The WooCommerce Store Audit checks security headers along with performance, checkout, shipping, tax, and plugin conflicts, and gives you a prioritized written report."
cta_url: /woocommerce-audit/
cta_label: "See the Store Audit"
image:
  path: /assets/imgs/blog/og-woocommerce-missing-security-headers.png
  width: 1200
  height: 630
  alt: "The Security Headers Most WooCommerce Stores Are Missing (and How to Add Them Safely)"
---

When I review a store before quoting any work, one of the first checks is the security response headers. They are quick to check and easy to fix, and they are missing from a lot of stores. Across nine reviews where I recorded the result, every site had gaps, and most were missing all four of the headers people check first: HSTS, a Content Security Policy, X-Frame-Options, and X-Content-Type-Options. It is a small sample, but the pattern is consistent.

This guide explains what each header does, how to check yours in a minute, and how to add them without breaking your checkout.

## What security headers are, and what they are not

Security headers are instructions your server sends along with every page, telling the browser how strictly to behave: only use HTTPS, do not let other sites frame this page, do not guess file types. They are a defense-in-depth layer.

They are **not** a substitute for keeping WordPress, WooCommerce, and your plugins updated, and they will not stop someone who already has a working exploit. Think of them as cheap protection that closes off whole categories of trick, not as a security system by themselves.

## Check your store in a minute

- Run your homepage through a free scanner such as securityheaders.com. It grades the headers and lists what is missing.
- Or use a terminal: `curl -sI https://yourstore.com` prints the response headers. Look for the names below.
- Check a **checkout** or **my account** URL too, not only the homepage, since some setups behave differently on those pages.

## The headers, in order of how safe they are to add

### X-Content-Type-Options: nosniff
Stops the browser from guessing a file's type and running something as a script that was not meant to be one. It is safe on virtually every site.

```
X-Content-Type-Options: nosniff
```

### Referrer-Policy
Controls how much of the page address is shared with other sites when a visitor clicks a link or loads a resource. A sensible default that rarely breaks anything:

```
Referrer-Policy: strict-origin-when-cross-origin
```

### X-Frame-Options (or frame-ancestors)
Prevents other websites from loading your pages inside a frame, which is how "clickjacking" tricks a visitor into clicking something hidden. `SAMEORIGIN` allows your own site to frame itself, which most page builders and previews need.

```
X-Frame-Options: SAMEORIGIN
```

### Strict-Transport-Security (HSTS)
Tells the browser to only ever connect to your site over HTTPS. This is the one to be careful with, because it is sticky. Before enabling it, make sure your **entire site, and any subdomains you include, works over HTTPS**. Start with a short lifetime while you test, then raise it.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Be cautious with the `preload` option. It submits your domain to a list built into browsers, and undoing it is slow.

### Permissions-Policy
Lets you switch off browser features your store does not use, such as the camera, microphone, and geolocation:

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Content-Security-Policy (CSP)
The most powerful header and the hardest to get right. It lists exactly which sources a page may load scripts, styles, images, and frames from. On a WooCommerce store it is tricky because checkout loads scripts and frames from payment providers, and many themes and plugins use inline scripts.

Do not paste a strict policy from the internet onto a live store. The safe approach:

1. Start with `Content-Security-Policy-Report-Only`. It reports what would be blocked without blocking anything.
2. Browse your store and complete a test checkout with each payment method. Read the reports.
3. Build the allow-list from what your store genuinely uses, then switch to enforcing.

A modest first step that carries little risk is a policy that only upgrades insecure requests:

```
Content-Security-Policy: upgrade-insecure-requests
```

## Where to add them

Set them at the server or edge, not with a plugin that runs late in PHP, because then they can miss static files and cached pages.

- **Managed hosts:** many have a settings panel or support can add them. Ask.
- **Apache:** in `.htaccess` with `mod_headers`:

```
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

- **Nginx:** in the server block, using `add_header ... always;`.
- **Cloudflare or another CDN:** use response header rules, so you do not touch the server.

## Test before and after

After each change, clear your caches and re-run the scanner. Then check the parts that make you money:

1. Load the homepage, a product page, and the cart.
2. Complete a test order with every payment method you offer, including any 3D Secure or wallet step.
3. Log in to an account page and check the admin dashboard still works.

If something breaks, remove the last header you added. Add one at a time so you know which caused it.

## What this will and will not do

Adding these headers will close off some clickjacking, content-sniffing, and protocol-downgrade attacks, and it is the kind of hygiene that security scanners, some payment providers, and cautious customers notice. It will not clean a hacked site or patch a vulnerable plugin. If you suspect your store is already compromised, see [WordPress Hack Recovery]({{ '/hack-recovery/' | relative_url }}).

If you would rather have the whole picture than one item, the [WooCommerce Store Audit]({{ '/woocommerce-audit/' | relative_url }}) covers headers along with performance, checkout, shipping, tax, and plugin conflicts, in a prioritized written report.
