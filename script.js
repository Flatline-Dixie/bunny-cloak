// ==UserScript==
// @name         Project Bunnycloak (Stable Reader)
// @namespace    https://github.com/flatline/bunny-cloak
// @version      3.0.0
// @description  Conservative, local-only redaction for readable page content.
// @author       Flatline
// @match        http://*/*
// @match        https://*/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(() => {
    'use strict';

    /*
     * Stability rules:
     * - Run once. Do not observe or compete with a site's DOM updates.
     * - Touch text nodes only; never replace elements or use innerHTML.
     * - Ignore controls, editors, navigation, code, and hidden content.
     * - Stop after a bounded amount of work on very large pages.
     *
     * Security rules:
     * - No network access, storage, page-script injection, or elevated grants.
     * - Redaction is display protection only. It cannot hide browser/network data
     *   from the site itself; use browser permissions or a VPN for that job.
     */

    const TOKEN = '[REDACTED]';
    const MAX_TEXT_NODES = 12_000;

    // Keep this list high-signal. Short abbreviations and generic phrases create
    // false positives and make pages harder to read.
    const TERMS = [
        'illinois',
        'california',
        'texas',
        'new york',
        'japan',
        'kyoto',
        'tokyo',
        'zip code',
        'zipcode',
        'postal code',
        'postcode',
        'geoip',
        'geolocation',
        'gps coordinates',
        'latitude',
        'longitude',
        'time zone',
        'timezone'
    ];

    const SKIP_SELECTOR = [
        'script',
        'style',
        'noscript',
        'template',
        'svg',
        'math',
        'canvas',
        'iframe',
        'input',
        'textarea',
        'select',
        'option',
        'button',
        'label',
        'form',
        'code',
        'pre',
        'kbd',
        'samp',
        'nav',
        'menu',
        '[contenteditable]',
        '[role="textbox"]',
        '[role="button"]',
        '[role="menu"]',
        '[role="navigation"]',
        '[aria-hidden="true"]',
        '[hidden]'
    ].join(',');

    const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalizedTerms = TERMS
        .map(term => String(term).trim().toLowerCase())
        .filter(Boolean);

    if (!normalizedTerms.length) {
        return;
    }

    const pattern = normalizedTerms
        .sort((a, b) => b.length - a.length)
        .map(term => `\\b${escapeRegExp(term)}\\b`)
        .join('|');
    const termsRe = new RegExp(pattern, 'gi');

    function shouldSkip(node) {
        const parent = node.parentElement || node.parentNode;
        if (!parent || typeof parent.closest !== 'function') return false;
        if (parent.closest(SKIP_SELECTOR)) return true;

        // Text inside links may be used as an accessible name or by site logic.
        if (parent.closest('a[href]')) return true;

        return false;
    }

    function redactReadableText() {
        const root = document.querySelector('article, main, [role="main"]') || document.body;
        if (!root) return;

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let visited = 0;
        let node;

        while (visited < MAX_TEXT_NODES && (node = walker.nextNode())) {
            visited += 1;
            if (shouldSkip(node)) continue;

            const text = node.nodeValue;
            if (!text || !text.trim()) continue;

            termsRe.lastIndex = 0;
            if (!termsRe.test(text)) continue;

            termsRe.lastIndex = 0;
            node.nodeValue = text.replace(termsRe, TOKEN);
        }
    }

    try {
        redactReadableText();
    } catch {
        // A display helper should fail safely and quietly, never break the page.
    }
})();
