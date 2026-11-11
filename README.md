# SmartDataVisions — Khaled Hasan

A service-focused, static data analytics portfolio, redesigned on `feature/premium-analytics-portfolio`. The original production branch, history, root CNAME and DNS are unchanged. The feature branch is pushed and draft PR #1 is open: https://github.com/khaled-hasan-hasan/khaled-hasan-hasan.github.io/pull/1. No site has been published or merged.

## Build

Python 3.10+ is the only build requirement. No frontend packages or backend are needed:

```sh
python3 scripts/build.py
```

Output is `dist/`. Set the approved deployment origin before publishing:

```sh
python3 scripts/build.py --origin "https://CHOSEN-PROJECT.pages.dev"
```

Replace `CHOSEN-PROJECT` with the actual chosen project hostname. The default origin is the user's free GitHub Pages hostname; it is metadata configuration, not proof that its existing custom-domain redirect has been removed. See [migration instructions](docs/MIGRATION.md).

## Local review

Open `dist/index.html` directly, or run this on your own computer:

```sh
python3 -m http.server 8000 --directory dist --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8000`. `npm run preview` is a convenience alias. In a managed Sites environment, use the supported managed preview/browser tools instead. The shared browser control tool is absent in this session. A non-deploying GitHub Actions workflow now runs real Chromium/Lighthouse on an isolated localhost preview and uploads its actual results with the review package.

## Validate

Static checks need only Python. DOM interaction tests use Node 22+ and development-only QA dependencies, locked in package-lock.json:

```sh
npm ci --ignore-scripts
npm run check
```

`python3 scripts/check.py` runs the static checks independently. `python3 scripts/check-links.py` makes public network requests and records current external-link status. It is separate from offline tests and is not needed on every build. Happy DOM executes only the checked-in first-party script during tests; it is not used at runtime and does not render layouts.

## Edit content

- Edit `content/site.json` for services and case studies.
- Edit `scripts/build.py` for shared HTML templates, homepage, About and Contact copy.
- Edit `style.css` or `script.js` for the visual system and enhancements.
- Run the build again; generated root HTML and `case-studies/*.html` are tracked for easy static review.
- Add images in `assets/images`, with dimensions/source mapping in `content/media.json`.
- Keep font license notices in `assets/fonts`.

The build overwrites generated HTML and recreates dist. It copies only intended assets, excluding research, docs, original root media and CNAME. Original media remain at their baseline paths for preservation. The optimized video has audio removed and no preload; the original recording is untouched.

## Content and contact behavior

All five existing projects remain accessible. Metrics and customer outcomes are only stated where evidence supports them. Education/status entries are self-reported and flagged for owner confirmation. There is no contact-submission backend: direct mailto links open an email client; the optional composer creates a local draft link. Clipboard failure has a visible fallback. No inquiry is silently saved or sent.

## Review documents

- [Audit](docs/AUDIT.md) and [implementation plan](docs/IMPLEMENTATION-PLAN.md)
- [Before/after](docs/BEFORE-AFTER.md)
- [Test and performance report](docs/TEST-REPORT.md)
- [Owner verification](docs/OWNER-VERIFICATION.md)
- [Free hosting migration](docs/MIGRATION.md)
- [Draft PR description](docs/PR-DRAFT.md)

The initial local test report predates the CI browser run. See the downloadable `browser-qa/summary.json`, screenshots and Lighthouse reports for actual CI results; do not infer a pass from source alone. Complete human visual, mail-client and deployed-host verification before public launch. The site is review-ready source, not a verified live deployment.

## Accessible review handoff

See [exact local launch/navigation instructions](docs/LOCAL-REVIEW.md) and the [unexecuted Cloudflare staging plan](docs/STAGING-PLAN.md). The `Review checks and downloadable artifacts` workflow runs only for feature-branch pushes and has no deployment permission or step. It preserves the three original redesign commits and provides 30-day downloadable review/browser/website artifacts; save a local copy.
