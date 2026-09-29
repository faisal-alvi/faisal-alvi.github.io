---
title: "Why WooCommerce Gets Slower Over Time: Action Scheduler and Autoloaded Options"
description: "A store that was fast at launch and slow a year later usually has database bloat. How to check Action Scheduler and autoloaded options, and how to clean them up safely."
read_time: "8 min read"
excerpt_text: "If your store was fast at launch and sluggish a year later, look at the database before the theme. Two common culprits are Action Scheduler backlogs and oversized autoloaded options."
tags: [woocommerce, performance, database, action-scheduler]
cta_title: "Want the slow part found and written down?"
cta_text: "The WooCommerce Store Audit checks performance, plugin conflicts, and more, and gives you a prioritized written report instead of guesswork."
cta_url: /woocommerce-audit/
cta_label: "See the Store Audit"
image:
  path: /assets/imgs/blog/og-woocommerce-slow-checkout-action-scheduler-autoload.png
  width: 1200
  height: 630
  alt: "Why WooCommerce Gets Slower Over Time: Action Scheduler and Autoloaded Options"
---

A store launches fast. A year or two later the admin drags, the cart takes a beat too long, and pages that should be served from cache are slow to first byte. Nothing obvious changed. Very often the cause is database bloat that built up slowly, and two common places to look are **Action Scheduler** and **autoloaded options**.

This guide explains both, how to check them on your own store, and how to clean up safely. It is general guidance. Every store is different, and database changes deserve a backup first.

## Where to look first

Before touching the database, find out whether it is the database at all. Use a profiling tool such as Query Monitor on a staging copy and look at the slowest queries and the time spent in the database on a typical page. If the time is elsewhere, for example in a slow external request, cleaning tables will not help.

## Culprit 1: Action Scheduler

WooCommerce uses a library called Action Scheduler to run background work: sending emails, processing subscriptions, syncing data with other services, and cleaning up. It stores its queue in the database, in tables whose names contain `actionscheduler`.

Things go wrong when:

- **A large backlog of pending actions builds up**, because a plugin schedules far more than the server can process, or because the scheduled processing is not running reliably.
- **Failed actions pile up** and keep retrying.
- **Completed and log rows accumulate**, so the tables get very large.

By default, completed actions are kept for a limited period (30 days) and then cleaned, but a huge or busy queue can still leave the tables large, and plugins can change the retention.

### How to check
In the WordPress admin, go to **WooCommerce → Status → Scheduled Actions**. Look at the counts of Pending, Past-due, In-progress, and Failed. Signs of trouble:

- Thousands of pending or past-due actions
- The same failing action repeated many times
- One plugin's action group dominating the list

If you have database access, check the size of the Action Scheduler tables against the rest of the database.

### How to fix it
- Find out **which plugin** is scheduling so much, and whether it is intended. A misbehaving plugin is the cause, and cleaning the queue without fixing it just refills it.
- Make sure background processing actually runs. If it depends on WP-Cron and your site gets little traffic, or caching interferes, actions can stall. A real server cron calling WP-Cron on a schedule is often more reliable.
- Clear old completed, cancelled, and failed actions. Action Scheduler ships a WP-CLI command for cleaning:

```
wp action-scheduler clean
```

Run it on staging first, with a backup, and read what it will remove.

## Culprit 2: Autoloaded options

WordPress stores settings in the `wp_options` table. Options flagged to **autoload** are loaded into memory on **every single page request**, including admin, cart, and checkout, before your page does anything. If the total size of autoloaded data is large, every request pays for it.

Bloat here usually comes from plugins that store big blobs of data as autoloaded options, or from data left behind by plugins that were deactivated or deleted long ago.

### How to check
WordPress Site Health warns when autoloaded options get large, so start under **Tools → Site Health**. To see the biggest offenders, run a query on your database (adjust the table prefix if yours is not `wp_`):

```
SELECT option_name, LENGTH(option_value) AS bytes
FROM wp_options
WHERE autoload IN ('yes', 'on', 'auto', 'auto-on')
ORDER BY bytes DESC
LIMIT 20;
```

The autoload column values changed slightly in newer WordPress versions, which is why the list above includes several values. Look for entries that are hundreds of kilobytes or more.

### How to fix it
Do not delete rows you do not recognize. The names usually point to the plugin that owns them, and the safe order is:

1. **Identify the owner** of each large option from its name.
2. **If the plugin is gone for good**, the leftover option can usually be removed. Confirm first, with a backup.
3. **If the plugin is in use**, see whether its setting can be changed, and whether the data really needs to load on every page. Setting a large option to not autoload is often the safest change, but it should be tested, because a plugin that expects the value to be preloaded will run an extra query for it.
4. **Use a persistent object cache** such as Redis or Memcached if your host offers one. It reduces the cost of loading options on every request.

## Other database weights worth a look

- **Expired transients.** Temporary cached data that never got cleaned.
- **Customer sessions.** WooCommerce stores session data in the database, and old sessions can accumulate.
- **Orphaned data from removed plugins**, such as leftover tables and post meta.
- **Revisions and old drafts** on content-heavy sites.

Each is a smaller effect on its own, but together they add up on a busy store.

## What to expect

Cleaning up bloat can make the admin and uncached pages noticeably quicker, but it will not fix a slow theme, oversized images, or slow hosting. If you want a broader view, see [why WooCommerce is slower on mobile than desktop]({{ '/blog/woocommerce-mobile-slower-than-desktop/' | relative_url }}), which covers the front-end side.

## Rules for touching a live database

1. Take a full backup first, and confirm you can restore it.
2. Try changes on a staging copy.
3. Change one thing at a time, and measure before and after.
4. Never delete something just because it looks big. Identify what owns it.

If you would rather have someone find the slow part and write it down, the [WooCommerce Store Audit]({{ '/woocommerce-audit/' | relative_url }}) covers performance and plugin conflicts, along with checkout, shipping, tax, and security headers, in a prioritized written report.
