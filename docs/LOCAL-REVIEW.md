# Launch and inspect the finished website

## From the downloadable review package

1. Download **SmartDataVisions-review-package.zip** from this task or the draft PR's linked Actions artifact. GitHub artifact downloads require you to be signed in and expire after the configured retention period (30 days); keep a local copy.
2. Extract the complete archive into a normal folder. Keep `review.html`, `site/`, `source/`, `before/` and any `browser-qa/` folder together.
3. Open a terminal in that extracted folder. With Python 3.10 or newer installed, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows, if the `python3` command is unavailable, use:

```powershell
py -3 -m http.server 8000 --bind 127.0.0.1
```

4. Visit **http://127.0.0.1:8000/review.html**. This serves your local files only; it does not publish the site.
5. Choose **Redesign** or **Original**, then choose **Fit window**, desktop 1440/1024, tablet 768, or mobile 390/320. **Open full page** opens the selected version outside the iframe.
6. Stop the server with **Ctrl+C** when finished. If port 8000 is in use, substitute 8001 in both the command and URL.

The original preview preserves the old claims and external font/icon requests for historical comparison. The redesign is under `site/`; do not deploy the full review archive.

## From the feature branch

```sh
git clone --branch feature/premium-analytics-portfolio https://github.com/khaled-hasan-hasan/khaled-hasan-hasan.github.io.git
cd khaled-hasan-hasan.github.io
python3 scripts/build.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Visit **http://127.0.0.1:8000/**. On Windows, substitute `py -3` for `python3` in the last two commands. There is no npm install, account, API key, Power BI license or backend needed to build/view the website.

## What to navigate

- **Home:** business positioning, real Hotel dashboard hero, selected work, six services and work process.
- **Work:** use All / Business intelligence / SQL / Python & ML filters. Open all five case studies and inspect their original visuals/source links and evidence limitations.
- **Services:** six jump links and detailed service scopes. Each **Discuss this service** link prepares a scoped email in your mail app.
- **About:** background and self-reported credentials with verification status.
- **Contact:** visible Gmail, copy fallback, professional links and optional inquiry composer. Preparing a draft does not send or save it. Choosing **Open email draft** hands it to your own email app.
- **Accessibility:** Tab through controls, use Enter/Space on buttons, Escape on the mobile menu, and test reduced motion, 200% zoom and JavaScript disabled.

## Checks and real browser artifacts

The initial local source/DOM results are in `source/docs/TEST-REPORT.md`. If CI browser review completed, the actual newer result is in `browser-qa/README.md` and `browser-qa/summary.json`. Genuine PNG screenshots are in `browser-qa/screenshots/`; open mobile/desktop Lighthouse `.report.html` files under `browser-qa/lighthouse/` and inspect their raw JSON as needed.

For development-only tests from source (Node 22+):

```sh
npm ci --ignore-scripts
npm run check
```

For the same real-browser pass on your own machine, after those development dependencies are installed:

```sh
npx playwright install chromium
npm run browser:review
```

On Linux, Playwright may also require its documented OS packages. This browser command runs a temporary server bound to `127.0.0.1:4173`, captures the rendered site and executes Lighthouse; it does not deploy anything. It writes results to `review-artifacts/browser-qa/` and stops its server afterward.
