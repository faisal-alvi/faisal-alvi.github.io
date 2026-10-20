---
title: "How to Judge a WordPress Hack Cleanup Quote"
description: "A WordPress hack cleanup quote should name its scope, its exclusions and how the entry point gets found. Questions to ask before you pay for malware removal."
read_time: "7 min read"
excerpt_text: "Two cleanup quotes can look identical and cover very different work. Here is what a good quote names, what it leaves out, and the questions that expose the gap."
tags: [wordpress, security, hacked-site, woocommerce]
cta_title: "Want the scope written down before any cleanup?"
cta_text: "Hack Recovery starts with a $199 flat diagnostic and a written report in 24 to 48 hours. Cleanup is quoted separately, based on what is actually found. No guarantees."
cta_url: /hack-recovery/
cta_label: "See Hack Recovery"
image:
  path: /assets/imgs/blog/og-wordpress-hack-cleanup-quote.png
  width: 1200
  height: 630
  alt: "How to Judge a WordPress Hack Cleanup Quote"
---

A good WordPress hack cleanup quote tells you four things in writing: what will be searched (files, database and users), how the entry point will be found, what is excluded, and what happens if the work turns out bigger than expected. A quote that says only "full malware removal" and a price gives you none of that, and you cannot compare it with anything.

If you have not yet contained the problem, start with [what to do in the first hour after a hack]({{ '/blog/wordpress-hacked-what-to-do-first-hour/' | relative_url }}), then come back here when quotes arrive.

## A cleanup quote is a scope, not a price

Public pricing for malware removal varies a lot, and the cheap and expensive pages often describe different jobs. One service may only delete the files a scanner flags. Another may rebuild core, review the database, look for backdoors and write a report. Comparing the headline numbers tells you nothing until the scope is on the table.

So ask for the scope as a list. Anything not on the list should be assumed excluded.

## What a WordPress hack cleanup quote should say it will search

Ask which of these are in scope, and which are not:

- **WordPress core files.** The standard check is comparing installed files with the official checksums. WP-CLI documents `wp core verify-checksums`, which downloads the checksums for your WordPress version from WordPress.org and warns about every file that differs, per the [WP-CLI checksum command](https://github.com/wp-cli/checksum-command). Adding `--include-root` also checks the root folder and warns about items WordPress does not ship.
- **Plugin files.** `wp plugin verify-checksums --all` does the same for plugins, but the documentation describes verification against WordPress.org checksums. Premium plugins and anything installed from a zip are not covered by that description, so ask how they will be checked. A scan that only covers repository plugins leaves a gap exactly where hand-installed code lives.
- **The uploads folder and other writable folders.** PHP files do not belong in an uploads directory. A quote that never mentions looking there is worth a question.
- **The database.** Injected scripts in posts and options, and spam content, live here, not in files.
- **Users.** Unknown administrator accounts are a common leftover. The quote should say someone reviews them.
- **Scheduled tasks and must-use plugins.** Both run code without appearing in the normal plugins screen, so a thorough job checks them.

A checksum tool tells you a file differs, not why, so a human still has to read the differences. Be wary of a quote that describes the tool as the whole job.

## The entry point is the real deliverable

If the way in stays open, the site gets re-infected. Ask the provider directly: "How will you identify how they got in, and where will that be written?"

Honest answers sound like "we look at logs if your host keeps them, plugin and theme versions, and recently modified files, and we report what we find or say we could not tell." Dishonest answers sound like certainty without evidence. Server logs are often short-lived, so some entry points cannot be proven, and a good provider says so.

The common candidates are an outdated plugin or theme, a weak or reused administrator password, and nulled (pirated) plugins or themes. Ask what the quote does about each, in particular whether it includes updating or removing vulnerable code or only cleaning the damage it left.

## Ask what is deliberately left out

Exclusions are normal. Hidden ones are the problem. Check these lines:

| Question | Why it matters |
|---|---|
| Are plugin and theme updates included? | Often priced separately, but they close the entry point |
| Who rotates the passwords, keys and API credentials? | Cleaning without rotating leaves old stolen credentials working |
| Is blacklist or search warning review included? | Getting a flagged site reviewed is a separate step you may need to do or pay for |
| Is hosting-level work included? | Other sites on the same account can reinfect the one you cleaned |
| Is a rebuild included if the site is too far gone? | Sometimes rebuilding from clean core and a reviewed set of plugins beats cleaning |

A cleaned site usually still needs hardening. The WordPress Advanced Administration Handbook covers the basics, including restricting write permissions and the `DISALLOW_FILE_EDIT` constant, in its [hardening guide](https://github.com/WordPress/Advanced-Administration-Handbook/blob/main/security/hardening.md). It also notes that constant "will not prevent an attacker from uploading malicious files", so treat it as one layer, not a fix. Ask whether the quote includes any of this or hands you a to-do list afterward.

## Pricing shapes and how each can go wrong

- **Flat fee.** Predictable, but check what scope it covers and what triggers an extra charge. A flat fee that ends at "removed what the scanner found" can be the most expensive option once the site is hacked again.
- **Hourly.** Fair when the scope is unknown, but ask for an estimate range and a rule that the provider checks in before passing it.
- **Diagnostic first, then a cleanup quote.** The provider spends a bounded, paid amount of time finding out how far the infection goes, then quotes the cleanup against real findings. This is the shape I use for [Hack Recovery]({{ '/hack-recovery/' | relative_url }}), because quoting cleanup sight unseen means guessing whether it is one file or a spread across hundreds.

## Warranties and guarantees

Ask what happens if the site is infected again, and read the answer carefully. A time-limited warranty that is written down, with conditions, is a defined promise you can evaluate. "100% guaranteed clean" is not, because nobody can promise it. Check whether a warranty is voided by something ordinary, such as installing a new plugin, and whether the provider treats reinfection through the same entry point differently from a new one.

## Before anyone touches the live site

Take a full backup of the compromised site as it is, files and database, and store it offline. The cleanup may go wrong, and the infected copy also holds the evidence for how the attacker got in. The same handbook recommends keeping regular backups in a trusted place, and recommends snapshots taken before the compromise so you have something clean to compare against.

Where possible, ask for the work on a staging copy first, then moved to live. On a store taking payments, ask when the site will be offline, or in maintenance mode, and whether anyone checks a test checkout afterward. A cleaned site that cannot take an order is not finished. If your store may have exposed customer or card data, get advice from a lawyer about notification duties, because that is not something a cleanup quote covers.

## Red flags in a cleanup quote

- A price with no scope, only "full cleanup"
- No mention of finding the entry point
- A guarantee with no conditions
- A request for your hosting or admin passwords by email or chat
- Pressure to pay immediately, with no written terms
- No report promised at the end

A provider who is comfortable writing down what they will do and what they will not is usually easier to trust than the cheapest one. If you want that written scope before committing to a cleanup, the [Hack Recovery]({{ '/hack-recovery/' | relative_url }}) diagnostic is built for it, and the [first-hour checklist]({{ '/blog/wordpress-hacked-what-to-do-first-hour/' | relative_url }}) covers what to do while you wait.
