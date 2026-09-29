---
title: "Your WordPress Site Was Hacked: What to Do in the First Hour"
description: "A calm, ordered checklist for the first hour after you discover a hacked WordPress or WooCommerce site: what to do, what not to do, and how to avoid getting hacked again."
read_time: "8 min read"
excerpt_text: "Spam pages, strange redirects, a Google warning, a suspended site. The first hour matters, and so does what you avoid doing. Here is an ordered checklist."
tags: [wordpress, security, hacked-site, recovery]
cta_title: "Want the entry point found, in writing?"
cta_text: "A bounded diagnostic finds how they got in and how far it spread, in 24 to 48 hours. Cleanup is quoted separately, based on what is actually found."
cta_url: /hack-recovery/
cta_label: "See Hack Recovery"
image:
  path: /assets/imgs/blog/og-wordpress-hacked-what-to-do-first-hour.png
  width: 1200
  height: 630
  alt: "Your WordPress Site Was Hacked: What to Do in the First Hour"
---

You open your site and something is wrong. Pages you never made, visitors redirected to somewhere strange, a browser or Google warning, an email from your host saying the site is suspended. The instinct is to start deleting things. Do not. The first hour is about limiting damage and keeping evidence, and the order matters.

This is a general checklist. Every hack is different, so treat it as a starting point, not a guarantee.

## Signs you have been hacked

- Spam content, pages, or links you did not create, often for pharmacy, gambling, or counterfeit goods
- Visitors redirected to other sites, sometimes only on mobile or only from Google
- A "This site may be hacked" note in search results, or a browser warning page
- Your host suspended the site or sent a malware notice
- New admin users, changed passwords, or files you did not edit
- Your site sending spam email
- On a store: customers reporting card fraud after buying from you

## The first hour, in order

### 1. Do not panic-delete, and do not restore blindly
Deleting the visible malware feels productive, but hackers usually leave a backdoor that lets them straight back in. Restoring an old backup can bring back the same weakness, and can also erase the evidence of how they got in.

### 2. Take a full backup of the site as it is now
Files and database, exactly as they are. Store it somewhere safe and offline. If anything goes wrong later, or you need to work out the entry point, you will want this.

### 3. Limit the damage
- If customers can be hurt (a store taking cards, a login form collecting passwords), put the site in maintenance mode or take it offline for now. A few hours of downtime is cheaper than more stolen data.
- Ask your host whether they can isolate the site.

### 4. Lock the doors
Change the passwords and keys for everything that touches the site, from a device you trust:

- Every WordPress administrator, and remove any admin you do not recognize
- Hosting account, database, FTP and SSH
- Payment gateway and other API keys
- Your email account, if the site email is the recovery address

Then invalidate existing sessions, for example by changing the security keys in `wp-config.php`, so anyone already logged in is signed out.

### 5. Tell the people who need to know
- **Your host.** They may have logs and can tell you what they see.
- **Your payment processor**, if a store or checkout may be affected. They often have their own rules and can watch for fraud.
- **Google Search Console**, where the Security Issues report may already explain what Google found.

### 6. Work out how far it spread
Scan the site's files and database for malware, and look at recently modified files. Check other sites on the same hosting account, because a hack on one often reaches its neighbors.

### 7. Find the way in before you clean
Common entry points are an outdated or abandoned plugin or theme, a weak or reused admin password, a stolen login from another breach, and a vulnerable extension. If you clean without closing the entry point, you are usually re-cleaning within days.

## What to avoid

- Deleting things before you have a backup
- Cleaning only the symptoms, such as the spam pages, without finding the cause
- Reusing the old passwords, or sharing new ones over email or chat
- Assuming a security plugin's "all clear" is the end of it
- Paying anyone who promises a 100% guarantee. Honest recovery work cannot promise that, because no one can

## After the cleanup

Once the entry point is closed and the site is clean:

1. Update WordPress, themes, and plugins, and delete the ones you do not use.
2. Turn on two-factor authentication for administrators.
3. Set up regular backups that you have actually tested restoring.
4. Add sensible [security headers]({{ '/blog/woocommerce-missing-security-headers/' | relative_url }}), and consider file integrity monitoring.
5. Ask Google to review the site if it was flagged, through Search Console.
6. Keep watching for a few weeks. If it comes back, the entry point was not the only one.

## If customer data may be involved

If a store may have leaked customer or card data, you may have legal duties to notify people or authorities, with deadlines that depend on where your customers live. That is a question for a lawyer, not a developer, so get advice early.

## Getting help

Hack cleanup is not something I will quote blind, and I would be wary of anyone who does, because until someone is inside the site, nobody knows if it is one infected file or a backdoor across hundreds. I start with a bounded, written diagnostic that finds the entry point and maps the scope, then quote cleanup based on what is actually found. There are no guarantees, and the goal is to close the way in. See [WordPress Hack Recovery]({{ '/hack-recovery/' | relative_url }}).

If your site is fine and you want to keep it that way, the [Care Plan]({{ '/care-plan/' | relative_url }}) and the [Store Audit]({{ '/woocommerce-audit/' | relative_url }}) are the better starting points.
