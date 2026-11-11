# Test and performance report

11 November 2026. Review branch: `feature/premium-analytics-portfolio`. Results apply to local generated artifacts, not a deployed site. No public/staging deployment was made.

## Completed checks

| Check | Actual result |
| --- | --- |
| Static build | 12 HTML pages generated using Python standard library |
| Local navigation | Every local href, fragment, src, poster and srcset target checked; no missing targets found |
| Metadata | Title/description, canonical, OG, PNG preview, valid JSON-LD and crawl files present |
| Structural/accessibility source checks | One h1 per page, unique IDs, English document language, main/skip target, labels, image alt and dimensions, secure new-tab links |
| Core color contrasts | Calculated ratios 4.76–11.37:1 for tested body/muted/CTA/footer-banner pairs; minimum tested pair exceeds WCAG AA 4.5:1 |
| JavaScript syntax | `node --check script.js` passed |
| DOM interactions | Eight Node/Happy DOM tests passed, zero failures |
| Host portability | Alternate HTTPS origin rebuilt all metadata/crawl URLs; path-bearing, HTTP, query and credential-bearing origins rejected |
| External URLs | 10 HTTP 200; LinkedIn HTTP 999 (bot/access block, manually unverified) |
| Preservation | Original root CNAME still exactly `smartdatavisions.com`; original assets remain; main and remote were not edited |
| Shipped text scan | No private-key/provider-token pattern detected in deployed HTML/CSS/JS; not an exhaustive security audit |
| Diff whitespace | `git diff --check` passed |

### DOM tests exercised

1. All generated pages can execute the enhancement script in the DOM emulator without an exception.
2. Mobile menu opens, closes with Escape, returns focus and closes after selecting a navigation link.
3. Desktop/mobile state changes clear a stale open menu and update toggle visibility.
4. BI, SQL, Python and All filters show 2, 1, 2 and 5 projects respectively, maintain selected state and announce the count.
5. Email drafting encodes ampersands, Unicode, newlines and markup as email text; edits invalidate the previous draft; no storage write occurs.
6. Invalid/whitespace-only inquiries do not generate a draft.
7. Clipboard success and permission-failure paths show honest status with an address-selection fallback.
8. Core project/navigation/email links exist in the unenhanced HTML; the optional composer is hidden until JS runs.

An initial email test exposed malformed generated service options. The generator was corrected to emit explicit, escaped option values; the full eight-test run passed afterward. These tests use authored first-party code, not arbitrary downloaded application scripts.

## Actual size measurements

Final static metrics are in `static-metrics.json`:

- Full deployable dist: **1,736,182 bytes** (about 1.74 MB decimal), including all report images and video.
- Optimized image set: **806,130 bytes** across 23 WebP files (18 visuals plus five responsive variants).
- Compressed silent walkthrough: **680,192 bytes**; original recording is **23,060,428 bytes** and preserved separately. Duration remains approximately 53 seconds. Video preload is none.
- Selected homepage-critical resources: **155,622 raw bytes**; **109,882 bytes** when individually gzip-compressed. This is a file-size calculation for HTML, CSS, JS, two fonts and full-size hero image, not observed network transfer, page load time or an LCP measurement. Below-fold lazy assets and provider response behavior are excluded.
- Runtime frontend libraries: **0**. Happy DOM is a development-only test dependency; it is excluded from deployment.
- Fonts are local WOFF2 with swap; hero image has intrinsic dimensions/high priority; below-fold images are lazy. No external font/icon stylesheet is requested by the redesign.

Comparing the original repository's approximately 25 MB of working files with the dist is an asset-package comparison, not a measured speedup. The original browser's video/media fetch behavior was not measured.

### Core contrast calculations

| Pair | Ratio |
| --- | ---: |
| Main text / ivory | 11.35:1 |
| Muted text / ivory | 5.27:1 |
| Muted text / sage | 4.76:1 |
| Ivory text / dark CTA | 11.37:1 |
| Dark text / lime CTA | 9.55:1 |
| Closing text / forest | 7.69:1 |

These checks do not establish full WCAG compliance. Rendered focus, text zoom, image readability and all contextual color combinations still need manual review.

## Browser, screenshot and Lighthouse blocker

The selected managed executor is `ccarenv_b64_Y2NhcmVudl9iNzQzYzUxMGE4Mjg4MTkxYjM2ZjhjZGRlNTZlMzFhMQ`. It reached running/connected; remote desktop was enabled with state unknown. Tool discovery before and after startup did not expose `cua_repl.js`, a browser-control tool or `open_in_codex`. Under the Sites managed-preview instructions, a substitute browser path must not be used. No preview server or substitute browser was started.

Therefore these items are **not verified**:

- Real rendered layouts, mobile overflow and 200% zoom.
- Keyboard/screen-reader behavior in an actual browser.
- Network errors, console output and CSP behavior in a browser.
- Email-client invocation, actual delivery and clipboard permissions in a browser.
- Rendered before/after screenshots or screen recordings.
- Lighthouse performance, accessibility, best-practices and SEO scores; LCP/CLS/INP.
- Deployed HTTPS, caching, custom 404 and host response headers.

No Lighthouse score, screenshot or error-free browser session is claimed. The supplied offline viewport selector is a review tool, not a test result.

## Manual acceptance pass still required

Use 320, 390, 768, 1024 and 1440 CSS-pixel widths; portrait/landscape; keyboard Tab/Enter/Space/Escape; 200% zoom; reduced motion and disabled JS. Open all service inquiries, all five case studies, project filter states, full-size media, video, copy fallback and email drafting. Check console/network errors with `_headers` applied on the actual approved host. Run/export Lighthouse on mobile and desktop, recording Chrome/Lighthouse versions, throttling and URL. Verify a real test email arrives and confirm LinkedIn identity.

## Reproduce

```sh
python3 scripts/build.py
npm ci --ignore-scripts
npm run check
# Optional network status refresh:
python3 scripts/check-links.py
```

A managed browser session remains necessary to close the browser-specific acceptance items above.
