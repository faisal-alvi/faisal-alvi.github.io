---
title: "WordPress Critical Error After an Update: How to Recover Step by Step"
description: "Seeing 'There has been a critical error on this website' after an update? Use the recovery email, find the failing plugin or theme, and fix it safely."
read_time: "8 min read"
excerpt_text: "A plugin or theme update ended in 'There has been a critical error on this website'. Here is the order I would work in, from the recovery email to renaming folders, and the one case where the email never arrives."
tags: [wordpress, debugging, maintenance, security]
cta_title: "Want updates tested before they reach your live site?"
cta_text: "The Care Plan runs weekly updates on staging first, does a full regression pass, and sends a written note each cycle, so a bad update is caught before customers see it."
cta_url: /care-plan/
cta_label: "See the Care Plan"
image:
  path: /assets/imgs/blog/og-wordpress-critical-error-after-update.png
  width: 1200
  height: 630
  alt: "WordPress Critical Error After an Update: How to Recover Step by Step"
---

If your site now says "There has been a critical error on this website" right after an update, WordPress hit a PHP fatal error, almost always inside a plugin or theme that just changed. The fastest fix is usually to find the recovery mode email WordPress sent to the admin address, use its link to log in, and deactivate the plugin or theme it names. If no email arrived, you can still get there by renaming a folder over FTP or your host's file manager.

Do not start by restoring a backup. You may need it later, but the error message already tells WordPress (and soon you) which extension broke, and a restore throws away any orders or content created since the backup was taken.

## Step 0: Stop and take stock

Before touching anything, write down what you updated and when. If several plugins updated at once, the order does not matter much yet, but the list does. Check whether the front of the site is down, the dashboard, or both. Each case behaves differently, and the next section explains why.

If this is a store, remember that checkouts that fail while the site is half broken are lost orders. Treat it as urgent, but do not click around randomly. Every change you make blind is one you have to undo later.

## How the built-in protection works (and when it does not)

Since WordPress 5.2, core has a fatal error handler. When a fatal error happens, WordPress works out which plugin or theme caused it, pauses that extension, and emails the site admin a special login link. That link opens recovery mode, where the dashboard loads with the broken extension switched off.

Things that surprise people:

- **The email goes to the site admin email address**, unless `RECOVERY_MODE_EMAIL` is defined in `wp-config.php`. On many sites that address is an old agency inbox or a mailbox nobody reads. Check Settings > General from another admin account if you still have access, and check spam.
- **Only some pages are protected.** Core treats `wp-login.php` and the admin area as protected endpoints (plus a short list of admin AJAX actions such as `update-plugin`, `activate-plugin` and `install-plugin`). If the fatal error happens only on a public page, such as a product page or a shortcode in a post, core does not treat it as a protected endpoint, and no recovery email is sent for it. This is the most common reason people wait for an email that never comes.
- **Emails are rate limited.** By default, only one recovery email is sent per day, and the link is valid for at least that long. If you triggered the error three times while testing, you will not get three emails.
- **Recovery mode is temporary.** The recovery cookie defaults to one week, and leaving recovery mode clears the paused list, so the broken plugin is live again unless you deactivated it first.

The error screen also differs depending on where you are. On a protected page, it tells you to check your admin email inbox. Elsewhere, it shows only the generic message.

## Step 1: Use the recovery email

1. Search the admin inbox (and spam) for the subject "Your Site is Experiencing a Technical Issue". The site name appears at the start of the subject line.
2. The email names the plugin or theme and includes the error type, file and line number. Copy that text somewhere safe. It is the single most useful piece of evidence you will have.
3. Click the link. It goes through `wp-login.php`, sets the recovery cookie, and sends you to the login screen. Log in as an administrator.
4. In recovery mode, go to Plugins (or Appearance > Themes). The offending extension is shown as paused.
5. Deactivate it, or roll it back if you have a previous copy, and then choose "Exit Recovery Mode" from the admin bar.

If the front of the site now loads, the immediate emergency is over. The underlying problem is not: the update you wanted is not installed, and the thing it was meant to fix is still there.

## Step 2: No email? Disable the extension by hand

Recovery mode is a convenience, not a requirement. You can always do the same thing at file level.

With FTP, SFTP or your host's file manager, open `wp-content/plugins/` and rename the folder of the plugin you suspect, for example `some-plugin` to `some-plugin-off`. WordPress treats a plugin whose folder is missing as deactivated. Reload the site.

If you do not know which plugin it is, rename the whole `plugins` folder to `plugins-off`. Everything is deactivated at once. If the site loads, rename the folder back to `plugins`, then rename plugin folders one at a time to find the culprit. Note that renaming back brings plugins back as inactive, so expect to reactivate the ones you need from the dashboard, one at a time, reloading after each. Do that for a store only when you can afford a brief interruption, and write down any plugin settings you are unsure about first.

If you suspect the theme, rename the active theme's folder inside `wp-content/themes/`. WordPress will fall back to a default theme if one is installed. If none is installed, the site stays broken, so upload a default theme first.

If your host gives you WP-CLI, deactivating by command is faster and leaves a clear record, but check your host's documentation for the exact syntax and the right user to run it as.

## Step 3: Read the actual error

Renaming folders gets the site back. Reading the error tells you why it broke. The recovery email already gives you the message, file and line, but if you need more, turn on logging, not on-screen display. These are standard `wp-config.php` constants, and they go above the line that says to stop editing:

```php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
```

With `WP_DEBUG_LOG` set to `true`, WordPress writes to `wp-content/debug.log`. Setting `WP_DEBUG_DISPLAY` to `false` keeps errors from printing on public pages, where visitors (and search engines) would see file paths. Remove or switch these off when you are done, and delete the log, because the log can contain file paths and other details you do not want sitting in a public folder.

The usual causes behind a fatal error after an update:

- **A PHP version mismatch.** The new plugin version needs a newer PHP than your host runs, or an old plugin breaks on a newer PHP. The error message usually says so in plain text, and so does the plugin's changelog.
- **Two plugins that both define the same function or class.** The message says "Cannot redeclare" and names the second file.
- **A required parent plugin is missing or outdated.** Add-ons for WooCommerce break this way if WooCommerce itself updated first, or failed to update.
- **Memory exhausted.** The message says "Allowed memory size exhausted". Raising `WP_MEMORY_LIMIT` can be a legitimate fix, but only after you have looked at what is consuming the memory. Raising it to hide a runaway plugin just delays the next outage.
- **A half-finished update.** If the update was interrupted, files can be mixed between old and new versions. Reinstalling the plugin from a fresh download over FTP usually settles this.

A caution that applies to every fix above: do not edit plugin files directly on the live site to "just comment out the line". It works, it gets overwritten by the next update, and nobody remembers it was done.

## Step 4: Fix it so it stays fixed

Once the site is up:

1. **Reproduce on staging.** Copy the live site to a staging environment, apply the same update there, and confirm you get the same error. If you cannot reproduce it, the cause may be something specific to production, such as a different PHP version or a caching layer.
2. **Pick the least bad option.** Roll the plugin back one version, wait for a patch, replace the plugin, or upgrade PHP in line with the plugin's requirements. Rolling back is a stopgap, not a plan: running outdated plugins is a known way sites get compromised, so set a date to move forward again.
3. **Update in a better order next time.** Back up first, update one plugin at a time, and check the key pages (home, a product, cart, checkout, login) after each. Updating everything at once makes the next failure impossible to pin on one change.
4. **Test the checkout, not just the home page.** A store can look fine and still fail to take payment, because the fatal error only fires on a code path the home page never touches.

## When to stop and get help

Get help if recovery mode will not start, the error appears in `wp-config.php` or in a core file you did not touch, you see files you do not recognise, or the site shows odd redirects or spam content along with the error. That pattern can point to a compromise, not a bad update. If it does, follow the checklist in [what to do in the first hour of a hacked WordPress site]({{ '/blog/wordpress-hacked-what-to-do-first-hour/' | relative_url }}) before you restore anything.

Most critical errors after an update are routine, and most of the work is in catching them before customers do. If you would rather not do updates on a live store at all, the [Care Plan]({{ '/care-plan/' | relative_url }}) tests each update on staging first and includes a regression pass and a written note each cycle.
