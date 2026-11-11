# Repository and evidence audit

Audited 11 November 2026. Baseline: `b5e6e7c`, branch `main` in `khaled-hasan-hasan/khaled-hasan-hasan.github.io`. Development branch: `feature/premium-analytics-portfolio`. Audit completed before implementation. The remote, production branch, CNAME and DNS remain unchanged.

## Inventory and preservation

All 24 tracked files inspected: one HTML page (524 lines), CSS (972 lines), JS (105 lines), README, CNAME, 18 images and one MP4. About 25 MB of working files, of which the 53.3-second H.264/AAC 1280×720 recording is 23,060,428 bytes. All images visually inspected in a contact sheet; the recording inspected through stream metadata and an extracted frame. Originals remain in Git and at their original paths; optimized copies serve the redesign. No CV, credential verification URLs, client testimonials, live Power BI embeds or backend found.

## Prioritized findings

| Priority | Finding | Action |
| --- | --- | --- |
| P0 | Hotel-BI-Project returns GitHub 404; no equivalent hotel PBIX in public PowerBI-Dashboard-Collection | Keep genuine screenshots/recording, remove broken link, explicitly limit reproducibility |
| P0 | Examination 80% time reduction and marketing 40% spend savings have no supporting evaluation | Remove these claims from public copy; retain baseline in Git |
| P0 | Fraud page confuses recall with F1; website and README report different numbers | Describe evaluation techniques, show original chart labeled validation artifact, publish no headline metric |
| P1 | Domain-specific README email will expire with domain; README LinkedIn lacks scheme and email lacks mailto | Use Gmail from existing site and ITI author documentation; confirm deliverability with owner |
| P1 | Mobile menu is a div with no keyboard operation or expanded state; no skip link; no reduced-motion support | Use button, explicit state, Escape handling, native links, focus styles and reduced-motion CSS |
| P1 | JS hides all sections and depends on observer to reveal; custom smooth scrolling overrides native anchors | Keep content visible by default, use progressive enhancement and native navigation |
| P1 | No service explanation or focused commercial path | Six scoped service offerings, featured work, direct project inquiry |
| P1 | Education/status and certificates lack public verification; SQL certification conflicts with SQL README's “in progress” | Clearly mark self-reported credentials and ask for verification in owner checklist |
| P1 | Olympics page says SQL Server, four tables and 120 years; published SQL is PostgreSQL, five source tables; period unverified | Correct technology and model; avoid unverified period and result counts |
| P2 | Large images lack intrinsic dimensions; MP4 uses unsupported loading attribute and can preload | Optimized WebP, explicit dimensions, lazy below-fold images, video preload=none |
| P2 | FontAwesome and remote fonts add third-party render-blocking requests | Inline SVG/small local icon treatment and self-hosted typography |
| P2 | No canonical/OG/social image/structured data/sitemap; stale footer 2025 | Generate these at build time from configurable origin; use domain-independent paths |
| P2 | README names Egyptian Economic and Amazon projects absent from site | Do not invent corresponding case studies; preserve baseline documentation in history |

## Supporting repositories and evidence

GitHub REST repository listing, recursive trees and 50 text artifacts were retrieved. Site live URL returned HTTP 200 during audit. External status is a point-in-time observation.

### ITI Examination Management System

`ITI-Examination-System`: README, Flask routes/models, SQL scripts `sql/script_DB.sql` and `sql/script_DWH.sql`, architecture, ERD and ETL documentation reviewed. Role-based screens, exam/grade application code, relational/warehouse scripts and Gemini/linear-regression components are supported. Attendance SSIS is documented; no .dtsx package is published. Dashboard figures describe a project dataset, not verified deployment to 9,000 real students. The public repository has no customer adoption or before/after productivity evidence. Portfolio case study must identify this as a training/portfolio project and distinguish documented pipeline from executable artifacts.

Security-related observations in supporting app: `config.py:5` contains a development signing-key fallback, `app/__init__.py:28` sets a literal application secret, `app/routes/auth.py:33-35` uses a demo password, and `hash_passwords.py:36-44` uses email as default password. Internal machine name appears in config. No live provider-token pattern found; Gemini reads an environment variable. Do not host this app or copy configuration into the portfolio. Real production use would need separate authentication/security remediation. No sensitive values are reproduced here.

### Hotel Booking Analysis Dashboard

Genuine three-page dashboard screenshots and recording exist in the portfolio. Executive summary, guest analysis and room/meal views are visually supported. Public source link `Hotel-BI-Project` returns 404; the account repository listing has no such repo. `PowerBI-Dashboard-Collection` contains two unrelated job/HR PBIX files, not this hotel model. No PBIX, source dataset, DAX or refresh setup could be inspected for the hotel dashboard. Describe the visible report only; label model/calculation verification pending. No evidence of real-time refresh, higher margins, forecasting accuracy or client use.

### Credit Card Fraud Detection

`Credit_Card_Fraud_Detection`: training/data/evaluation utilities, Focal Loss implementation, YAML configurations, tree and README reviewed. Published tree includes split CSV files, trained model artifacts, precision/recall plots and validation comparison output. README's metric table and existing website disagree; screenshot cannot resolve dataset/split/threshold attribution. Accuracy alone is inappropriate for imbalance; no financial deployment claim is supported. No models deserialized or training scripts executed during audit.

### Marketing Campaign Analysis

Kaggle notebook URL returns HTTP 200, but anonymous HTML is only notebook shell; full notebook output was not available. Matching Python exercises in `Python-Data-Analysis-Projects` show unique-user conversion ratios, language/channel groups and A/B comparisons. No complete source dataset or standalone runnable pipeline is present there. Screenshots use ratio values while axis says percent: do not reproduce 0.70 as a verified percent. No clustering evidence found in these scripts and no causal proof of budget savings. Retain screenshot as original exploratory artifact with unit/reproducibility caveat.

### Olympic Games SQL Analytics

Actual source path: `SQL_projects/Reporting SQL/Some Analysis with Postgresql/`. Five CSVs and schema tables: athletes, countries, country_stats, summer_games, winter_games. SQL uses PostgreSQL syntax, joins, aggregations, window functions and data preparation. Some statements are exercises/drafts with syntax/ordering issues; this is not a validated turnkey production pipeline. README's proposed folder structure differs from actual tree. Published schema image retained, no unsupported forecasts or numerical findings.

## Links and currentness

GitHub source paths for ITI, fraud, Olympics and Python exercises retrieved successfully. Hotel 404 removed. Kaggle returned 200 but notebook content could not be independently reproduced. LinkedIn returned HTTP 999 to automated request: profile identity/availability requires manual owner verification. Existing GitHub profile includes two LinkedIn slugs; retain original live site's `/in/khaled-hasan-abdo` pending owner confirmation. Gmail syntax is valid, but delivery and user mail-client handling cannot be established by source checks.

## Exposure review limits

Portfolio HTML/CSS/JS/README scanned for key/token/private-key patterns with no credential match. Supporting application findings above are development credentials/settings, not proof of leaked active provider secrets. Images and one recording frame visually inspected; exhaustive OCR, audio review, Git history secret scanning and dataset privacy verification were not performed. Confirm that app screenshots and source datasets are synthetic or cleared for publication. Research downloads stay outside deployment output.

## Verification limits

Managed executor is ready; remote desktop is enabled with state unknown, but `cua_repl.js` and `open_in_codex` are not offered. Sites managed-preview instructions prohibit substituting another browser-control path. Browser QA, rendered before/after screenshots and Lighthouse measurements remain pending until that tool is available. No score or screenshot is claimed.
