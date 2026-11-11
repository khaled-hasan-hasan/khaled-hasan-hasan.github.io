# Free hosting and domain migration

No hosting account has been created, no deployment has been published, and no DNS or CNAME has been changed. The current GitHub Pages site remains live as it was. These instructions are for an owner-approved deployment after review.

## Recommended: Cloudflare Pages, static hosting

The build produces 12 HTML pages plus local assets. There is no server, database, paid API, runtime secret or Power BI embedding license required to view this portfolio. Cloudflare Pages offers a free `pages.dev` address subject to its current Free plan terms and project-name availability; no free service can be guaranteed permanent.

A GitHub Pages user-site URL is also free, but the existing custom-domain configuration can redirect that URL to the expiring domain. Do not rely on it as a fallback until custom-domain settings are explicitly changed and tested.

### 1. Review locally

Python 3.10+ builds the site without package installation:

```sh
python3 scripts/build.py
```

Open `dist/index.html` directly, or on your own machine run:

```sh
python3 -m http.server 8000 --directory dist --bind 127.0.0.1
```

Visit `http://127.0.0.1:8000`. Stop with Ctrl+C. Browser layout and Lighthouse checks remain required before publication; see TEST-REPORT.md. Managed Codex preview must use the platform's supported browser tools when available.

### 2. Approve publication and choose the free address

The owner must explicitly authorize account access/creation and public publication before any staging or production deployment. Use an existing Cloudflare account if available; do not purchase a plan or domain. Choose an available Pages project name in Cloudflare. Its free address will be `https://<chosen-project>.pages.dev` (replace the bracketed name with the actual returned hostname).

No custom-domain attachment is needed. Existing DNS records and the repository's CNAME can remain untouched for the Cloudflare deployment.

### 3. Build for the real address

Set the exact HTTPS origin returned for the chosen Pages project. Example command, replacing `CHOSEN-PROJECT`:

```sh
python3 scripts/build.py --origin "https://CHOSEN-PROJECT.pages.dev"
python3 scripts/check.py
```

This regenerates canonical URLs, Open Graph URLs, structured data, sitemap and robots configuration. Local links remain relative. Root CNAME is not copied to dist and is not modified. Do not use `smartdatavisions.com` as the new canonical origin if it will expire.

### 4. Deploy after approval

Choose **one** approach:

- **Direct upload:** upload the contents of `dist/` as a Cloudflare Pages static project. `index.html` must be at the deployment root, not nested under a dist folder. Include `_headers`, `404.html`, `robots.txt`, `sitemap.xml` and all assets. Cloudflare's dashboard direct-upload flow may create and publish together; do this only after authorization. Direct-upload and Git-integrated projects have different workflows, so choose deliberately.
- **Git integration:** connect the repository only after approval. Framework preset: None. Build command: `python3 scripts/build.py`. Output directory: `dist`. Set the build environment variable `SITE_URL` to the actual `pages.dev` origin. No npm install is required for the build. Disable automatic preview deployments if unpublished branch work must stay private. Do not connect an auto-deploying production branch before review/merge approval; an initial deployment may publish immediately.

The generated `_headers` enables a restrictive static Content Security Policy and other headers on Cloudflare Pages. GitHub Pages does not apply this file. Confirm the CSP has no violations in a real browser, including structured data and the mailto draft flow.

### 5. Validate before sharing the new address

- Open every page and image on the new hostname; test 404 routing.
- Check 320, 390, 768, 1024 and 1440 CSS-pixel widths, 200% zoom, keyboard and reduced motion.
- Verify all six service links, mobile menu, work filters, inquiry draft and clipboard fallback.
- Send a real test email from your chosen mail client and confirm Gmail receipt. No website backend exists.
- Check LinkedIn manually and confirm the correct profile slug.
- Run Lighthouse on the deployed HTTPS site with mobile and desktop profiles; retain exported reports and record versions/settings.
- Confirm canonical, OG image, sitemap and robots all use the new hostname.
- Confirm no page needs the expiring domain for fonts, media, scripts, email or navigation. The new site assets are self-hosted.

### 6. Update public profiles

After the new site passes checks, update GitHub profile, LinkedIn, Upwork/Contra/Fiverr where permitted, email signature and outreach links to the returned `pages.dev` URL. Keep Gmail as the inquiry address. Save the deployment package and repository history locally.

Letting the old domain expire does not redirect its visitors to the new address. Any redirects from the old domain would require it to stay active and be configured, which is outside this plan. Share the new address before expiry where possible. Once you stop controlling a domain, remove it from public profiles and account recovery/contact references you manage.

## Alternative: GitHub Pages free hostname

After **separate explicit approval**, remove the repository CNAME and clear the custom-domain setting under GitHub Pages, then deploy to `https://khaled-hasan-hasan.github.io/`. Merely omitting CNAME in a Cloudflare build does not change GitHub's domain redirect. Never delete CNAME or adjust DNS as an incidental step in the redesign.

For GitHub Pages, deploy only the contents of dist using an owner-approved Pages workflow or publishing branch. The root source still includes original assets, docs and build inputs for preservation; deploying dist keeps those out of the delivered website. Add `.nojekyll` to the published output if using a branch-based deployment. GitHub Pages ignores Cloudflare `_headers`, so repeat browser/security checks there.

## Rollback

The original production branch was not changed. A Cloudflare deployment can be rolled back in its deployment history or replaced by a previously saved dist archive after owner approval. Do not reset production history. Keep the new free address stable when changing versions.

## Provider references

- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
