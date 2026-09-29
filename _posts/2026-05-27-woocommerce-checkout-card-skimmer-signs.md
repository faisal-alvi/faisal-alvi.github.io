---
title: "Signs Your WooCommerce Checkout Has a Card Skimmer (and How to Check)"
description: "Skimmer scripts steal card details right from your checkout page. The warning signs, a step-by-step way to inspect your own checkout, and what to do if you find one."
read_time: "8 min read"
excerpt_text: "A card skimmer is a small piece of JavaScript slipped into your checkout page that copies what customers type. Here are the warning signs and how to inspect your own store."
tags: [woocommerce, security, malware, checkout]
cta_title: "Think your checkout may be compromised?"
cta_text: "A bounded written diagnostic finds the actual entry point in 24 to 48 hours. Cleanup is quoted separately, once you know what you are dealing with."
cta_url: /hack-recovery/
cta_label: "See Hack Recovery"
image:
  path: /assets/imgs/blog/og-woocommerce-checkout-card-skimmer-signs.png
  width: 1200
  height: 630
  alt: "Signs Your WooCommerce Checkout Has a Card Skimmer (and How to Check)"
---

A card skimmer is a small piece of JavaScript that gets onto your checkout page and quietly copies what customers type, then sends it to an attacker. The customer sees a normal checkout. The order goes through. Your payment processor sees a normal transaction. Nothing looks wrong until the fraud reports start.

This is a general guide to spotting one and inspecting your own store. It is methodology, not a claim of any particular case. If you think you are already affected, treat it as urgent and read the last section.

## Why WooCommerce stores get targeted

Attackers do not usually target a store by name. They exploit whatever is weak: an outdated plugin or theme, a stolen admin password, a vulnerable extension. Once inside, injecting a script into the checkout is a well-known way to monetize the access, because checkout is where card details are typed.

## Warning signs

Any one of these is a reason to look closer:

- **Customers report card fraud** shortly after buying from you, and several report it.
- **Your payment processor or bank contacts you** about suspicious activity linked to your store.
- **Google or your host flags the site**, or a browser shows a security warning.
- **The checkout looks or behaves slightly differently**: an extra field, a pop-up, a page that reloads oddly, a form that seems to submit twice.
- **Unexpected admin users** you do not recognize, or admin activity at odd hours.
- **Files or settings changed** that no one on your team edited.
- **Checkout got slower** for no clear reason.

None of these proves a skimmer, and a skimmer can exist with none of them showing. That is why inspecting is better than waiting.

## Inspect your own checkout

Do this on a quiet moment, ideally with a fresh browser profile so extensions do not confuse the result.

### 1. Look at the scripts the checkout loads
Open your checkout page, right-click and choose "View page source" or open your browser's developer tools and go to the **Network** tab, reload, and filter by "JS". Look at every domain that scripts load from.

- Expected: your own domain, your payment provider, analytics, and tools you know you installed.
- Suspicious: a domain you do not recognize, a script with a random-looking name, or a long block of obfuscated code inside the page.

### 2. Compare against what a payment provider needs
Note which third-party domains handle your card fields. If you use a hosted payment page or a provider's embedded fields, card data is typed into the provider's frame rather than your page, which reduces the risk. It does not remove it, because an attacker on your page can try to replace the form itself.

### 3. Verify your core and plugin files
If you have WP-CLI access, WordPress can compare files against the official copies:

```
wp core verify-checksums
wp plugin verify-checksums --all
```

Modified or unexpected files show up in the output. Themes and premium plugins are not covered by these checks, so check those by comparing to a clean copy from the vendor.

### 4. Check for hidden admin users and recent changes
In the WordPress users list, look for administrators you do not recognize. Check when key theme and plugin files were last modified.

### 5. Search the database for injected scripts
Attackers often store the script in the database, for example in a theme setting, a widget, or a custom-code option, so it survives file cleanups. Search for unexpected `<script` tags and unfamiliar external domains in options and post content. Take a database backup before touching anything.

### 6. Check outside your own browser
Look at Google Search Console's Security Issues report, and ask your host whether it has flagged anything. Some skimmers only show themselves to certain visitors, so a clean-looking page in your browser is not proof.

## If you find something, or strongly suspect it

Speed matters here, and so does not destroying evidence.

1. **Do not just delete the script and move on.** If you do not find how it got in, it comes back.
2. **Take a full backup of the site as it is now**, files and database, before changing anything.
3. **Change passwords and keys** for WordPress admins, hosting, the database, FTP or SSH, and your payment gateway API keys, and log everyone out.
4. **Tell your payment processor and your host.** They may need to act, and processors often have their own obligations to be told.
5. **Find and close the entry point**, then clean, then verify.
6. **Consider your legal obligations.** Depending on where your customers are, a card-data breach can carry notification duties and deadlines. Get proper advice on that, since it is not something a developer can decide for you.

## Reduce the chance of it happening

- Keep WordPress, WooCommerce, themes, and plugins updated, and remove ones you do not use.
- Use strong, unique admin passwords and two-factor authentication.
- Use a payment method that keeps card entry on the provider's page or frame where you can.
- Add security headers such as a Content Security Policy in report-only mode first. See [the security headers guide]({{ '/blog/woocommerce-missing-security-headers/' | relative_url }}).
- Watch for unexpected changes with file integrity monitoring or regular checks.

## Getting help

I do not make guarantees about hack cleanups, and I would rather say so plainly. What I offer is a bounded, written diagnostic that looks for the actual entry point, with cleanup quoted separately once we know what is really there. See [WordPress Hack Recovery]({{ '/hack-recovery/' | relative_url }}). If you would rather prevent problems first, the [Care Plan]({{ '/care-plan/' | relative_url }}) and the [Store Audit]({{ '/woocommerce-audit/' | relative_url }}) are the better starting points.
