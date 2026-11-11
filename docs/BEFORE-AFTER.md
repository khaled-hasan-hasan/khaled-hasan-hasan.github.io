# Before and after

Baseline is Git commit `b5e6e7c`. The original page and assets remain recoverable in Git. The downloadable review package includes a baseline preview alongside the redesign. No rendered screenshots were captured because the supported shared browser tool is unavailable.

| Area | Original | Redesign |
| --- | --- | --- |
| First impression | Centered name/title on a purple gradient | Editorial service-led introduction, ivory/forest palette, original Power BI report visual |
| Positioning | Data analyst, BI developer, data engineer titles | Independent consultant helping with six concrete data/reporting problems |
| Visitor path | Large single page with tools and projects | Homepage → relevant service or case study → scoped email inquiry |
| Services | Skill tags, no scoped service explanations | Six services with problem, solution, deliverables, tools and typical scope |
| Work | Five long project blocks | Filterable five-project index and five dedicated, linkable case studies |
| Credibility | Unsupported savings/deployment claims and conflicting model metrics | Inspectable artifacts, source links and explicit evidence boundaries |
| Hotel project | Broken source link; real-time/forecasting claims | Genuine three-page visuals/recording with source availability limitation |
| Olympics | SQL Server / four-table label | PostgreSQL / five-source-table model matched to published scripts |
| About | Credentials presented without evidence links | All eight background entries retained and marked self-reported/status pending |
| Contact | Social/email cards | Visible domain-independent Gmail, per-service email links, optional local draft builder |
| Navigation | Mobile div toggle; JS scroll override | Native links, keyboard-operable button, expanded state, Escape/focus behavior and no-JS fallback |
| Motion | JS hides sections; animations lack reduced-motion handling | Visible content by default, restrained hover motion, reduced-motion support |
| Media | Original images and 23.06 MB recording | WebP image set (806,130 bytes), 680,192-byte silent recording with preload=none |
| Dependency delivery | Remote Google Fonts and FontAwesome CSS | Local WOFF2 fonts and small native/SVG marks; no client runtime libraries |
| SEO | Basic title/description | Per-page metadata, canonical/OG/PNG preview, structured data and generated crawl files |
| Hosting | Custom-domain-dependent GitHub Pages setup | Allowlisted 1.73 MB dist suitable for free Pages hosting; CNAME preserved outside dist |

## Inspect the implementation

- `content/site.json`: service copy and all case-study evidence.
- `scripts/build.py`: shared template and static generator.
- `style.css`, `script.js`: layout and progressive enhancements.
- `assets/`: optimized site media, self-hosted fonts and license notices.
- `docs/`: audit, migration, checks and owner-review items.

The offline review page can switch between original/redesign and set an iframe viewport to desktop, tablet or mobile. It is a review aid, not a claim that those layouts passed browser QA.
