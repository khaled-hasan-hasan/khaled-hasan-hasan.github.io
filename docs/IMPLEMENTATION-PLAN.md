# Prioritized implementation plan

1. **Audit and preserve** — isolate feature branch; record all assets, claims, sources, link failures and verification needs. Commit audit before redesign.
2. **Build the visitor journey** — plain static HTML/CSS/JS; an editorial ivory/forest visual system; service-first homepage, service details, work index, five evidence-based case studies, about and contact. Keep existing source material and history.
3. **Make evidence legible** — link exact published code, distinguish source from screenshot-only evidence, retain original project visuals, separate training projects from customer outcomes. Document self-reported credentials.
4. **Implement conversion paths** — consistent project CTA, scoped inquiry links, optional local email-draft composer, visible Gmail fallback, platform-friendly direct links. No fake submission or backend.
5. **Harden delivery** — responsive layouts, accessible native elements and focus, reduced motion, local optimized assets, metadata/structured data and build-time origin configuration. Build an allowlisted dist without touching root CNAME.
6. **Validate and hand off** — static link/asset/metadata checks, JavaScript logic checks, actual external HTTP observations; browser/Lighthouse when the supported tool is available. Package source, baseline comparison, migration guide and verification checklist. No remote push, merge, hosting registration, public/staging deployment or DNS edit.

## Acceptance criteria

All five existing projects remain accessible with genuine assets and honest limitations. All six services explain problem, scope, deliverables, tools and inquiry. Core navigation/content/email links work without JS. No frontend packages, remote font/icon requests or pretend contact submission. CNAME contents match baseline. Build supports a free static host and configurable absolute metadata. Unverified and untested items are stated in reports.
