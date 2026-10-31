# Bunnycloak v3.0.1 – Stable Reader

Bunnycloak is a deliberately conservative userscript that masks selected location terms in readable web-page content. It prioritizes page stability: one bounded pass, no mutation observer, no injected controls, no global hotkeys, and no persistent state.

## What it does

- Redacts a small, high-signal list of location terms in the main-content area, preferring `<main>` or `role="main"` and then an article.
- Falls back to the page body when no main-content container exists.
- Skips anchors, navigation, forms, controls, editors, code, graphics, inert content, closed dialogs, and explicitly hidden content.
- Stops after 12,000 text nodes so unusually large pages cannot monopolize the tab.
- Safely exits when there are no active terms, instead of creating a broken regular expression.
- Runs locally with no network requests or userscript-manager privileges.

## What it does not do

Bunnycloak changes visible text only. It does **not** prevent a website from seeing an IP address, browser timezone, or geolocation permission already granted to that site. Use browser site permissions to deny location access and a reputable VPN or network privacy tool when IP-based location protection is needed.

## Why this version is steadier

Earlier versions continuously watched and rewrote page mutations while also injecting a settings menu, log, watermark, and keyboard shortcuts. Modern sites frequently manage the same DOM themselves, so that approach could cause rerenders, conflicts, and needless work.

Version 3 runs once at `document-idle`, edits only existing text nodes, and then gets out of the page's way. Content loaded later is intentionally left alone; that is the stability tradeoff.

This release also hardens the script against edge cases: empty or malformed term lists short-circuit safely, unusual parent nodes are ignored instead of crashing, and hidden or linked content remains untouched.

## Installation

1. Install Tampermonkey, Violentmonkey, or Greasemonkey.
2. Create a new userscript and paste in `script.js`.
3. Save and enable it.

The metadata uses `@grant none` and `@noframes`. There are no external dependencies or update URLs.

## Configuration

Edit `TERMS` near the top of `script.js`. Prefer full, uncommon phrases. Avoid short abbreviations or generic words because they create false positives and degrade normal reading.

## Security notes

- No data leaves the browser through Bunnycloak.
- No `eval`, dynamic code loading, storage, or HTML injection is used.
- The script runs on HTTP and HTTPS pages because it must see page text to redact it. Narrow the `@match` entries to trusted sites if you only need it on a few domains; least scope is always safer.
