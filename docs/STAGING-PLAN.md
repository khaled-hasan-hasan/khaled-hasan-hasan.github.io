# Cloudflare Pages staging plan — not executed

No Cloudflare account has been created, no site has been published, and no DNS/CNAME has been changed. Draft PR: https://github.com/khaled-hasan-hasan/khaled-hasan-hasan.github.io/pull/1

## Approval required before staging publication

After local visual review, obtain explicit approval for a **separate Cloudflare Pages staging project on the Free plan**, its exact available `pages.dev` hostname, and any account connection. A staging URL is still a publication; the draft PR and GitHub artifact workflow do not authorize it. Do not attach `smartdatavisions.com`, change DNS/CNAME, purchase anything, merge the PR or use production as the staging project.

A new pages.dev staging address is public unless approved access controls are configured. A noindex directive reduces search indexing; it does not provide privacy.

## Recommended first staging: direct upload after approval

This avoids connecting an auto-deploying Git branch while the redesign is under review.

1. Owner selects an available free project name in an existing approved Cloudflare account. Do not assume `smartdatavisions-staging.pages.dev` is available.
2. Build with the actual chosen HTTPS hostname. Replace `CHOSEN-STAGING-PROJECT` below:

```sh
python3 scripts/build.py --origin "https://CHOSEN-STAGING-PROJECT.pages.dev"
python3 scripts/check.py
```

3. Before uploading staging, add `X-Robots-Tag: noindex, nofollow` under the existing `/*` section of **the staging dist/_headers only**, and set staging dist/robots.txt to disallow all crawling. Do not change the production source/canonical origin as an incidental step.
4. Upload only the contents of **dist/**, with `index.html` at the deployment root. Include all assets, `_headers`, 404 and crawl files. Do not upload the full review ZIP, source/ or before/ folders.
5. Inspect the returned hostname, headers, canonical/OG URLs, all navigation/inquiries/media, mobile widths, console/network, and real email delivery. Compare the actual staged Lighthouse reports against the localhost CI reports. Do not treat local headers or performance as proof of deployed behavior.
6. Retain staging privately/unlisted as approved, collect visual feedback and make further feature-branch commits. Production cutover remains a separate approval.

## Optional Git-integrated staging configuration

If the owner explicitly chooses a Git-integrated Pages project instead:

| Setting | Value |
| --- | --- |
| Project | A new, separate Free plan staging project |
| Repository | khaled-hasan-hasan/khaled-hasan-hasan.github.io |
| Branch to stage | feature/premium-analytics-portfolio |
| Framework preset | None |
| Build command | `python3 scripts/build.py` |
| Build output directory | `dist` |
| Root directory | Repository root |
| Environment variable | `SITE_URL=https://ACTUAL-STAGING-HOST.pages.dev` |
| Build dependency installation | Not needed for the Python static build; disable automatic package installation if the current Pages build settings support it |
| Production domain / DNS | No custom domain attachment or changes |

Creating a Git-integrated project can immediately publish a build; do it only after approval. In this **separate staging project**, the Cloudflare setting named “production branch” may point to the feature branch to create a stable staging hostname. That setting must not modify GitHub main or the existing live hosting configuration. Disable other branch previews/automatic publication unless explicitly approved. Use a staging-only build/header configuration for noindex.

## Remaining launch requirements

Confirm owner identity/contact and educational claims; recover Hotel source if available; reconcile model metrics; approve data/image permissions. CI cannot verify Gmail receipt, real client behavior, screen-reader usability or Cloudflare account/headers/DNS state. See OWNER-VERIFICATION.md and the actual browser QA summary.

Only after staged review and a separate launch approval should anyone merge, replace the live site, change canonical origin for production, alter CNAME, or change DNS. None of those actions are included in this handoff.
