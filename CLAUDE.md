# Latitude 26 Concierge Medical

Two separate sites live in this repo, deployed as two separate Vercel projects
(in the `latitude26` Vercel team).

| | Repo path | Vercel project | Status |
|---|---|---|---|
| Main site | `site/` | `latitude26-co` | **live on latitude26.co** |
| Coming-soon page | repo root (`index.html`) | `latitude26-co-old` | retired, still builds on every push |

The site has launched. Both projects rebuild on every push to `main`; the
GitHub commit statuses `Vercel – latitude26-co` and `Vercel – latitude26-co-old`
report each one. (Commits before mid-September 2026 show the main site under its
earlier project name, `latitude26-main-site`.)

---

## Publishing a journal post — the common task

Colleen writes articles and emails them to Michael. Michael pastes the text
here and asks for it to be published. To do that:

1. Create `site/content/posts/<slug>.md` — slug is lowercase, hyphenated,
   derived from the title. The filename becomes the URL (`/blog/<slug>`), so
   **never rename an existing file** once published.
2. Use exactly this frontmatter:

```markdown
---
title: The Article Title
date: 2026-08-18
author: Colleen <surname>
excerpt: One or two sentences shown on the journal index and in link previews.
cover: ""
draft: false
---

Body in Markdown. `##` for subheadings.
```

3. `draft: true` keeps a post in the repo but off the site entirely. Use it when
   the text needs review; flip to `false` to publish.
4. Commit and push to `main`. Vercel rebuilds automatically — the post is live
   in about a minute. No CMS, no admin UI, no other steps.

Posts are sorted newest-first by `date`. Nothing else needs updating — the
index and nav pick the post up automatically.

---

## Content model

All copy lives in `site/content` and renders through `site/lib/content.js`.
Nothing is hardcoded in JSX — edit the content files, not the components.

```
site/content/
├── settings/site.yml   tagline, locations, contact, primary CTA, exclusivity note
├── pages/              home, model, services, membership, about, service-area,
│                       contact, blog  (one file each, distinct field shapes)
├── posts/              one file per post
├── services/           one file per service, ordered by `order`
├── providers/          one file per physician, ordered by `order`
└── legal/              five notices, all `status: pending-legal-review`
```

Adding a service or physician is adding a file — the pages map over the folder
and the layouts already handle one or many.

---

## Hard constraints

- **No pricing anywhere on the site**, for membership or add-ons. Tier is
  signalled by `settings.exclusivity_note` ("limited to 100 families") and all
  money questions route to the consultation.
- **Do not write legal copy.** The five files in `content/legal/` are
  deliberately placeholders pending counsel's review.
- Body copy still marked `PLACEHOLDER —` is awaiting Michael's real copy.

---

## Hosting and indexing

There is **no app-level auth gate**. An earlier `site/middleware.js` Basic Auth
gate (and its `SITE_GATE_USER` / `SITE_GATE_PASSWORD` / `SITE_GATE_ENABLED` env
vars) was removed; nothing in the code reads those vars anymore.

Indexing is enabled: `site/app/robots.js` allows `/`, `site/app/layout.jsx` sets
`robots: { index: true, follow: true }`, and there is no `X-Robots-Tag` noindex
header in `site/next.config.mjs`.

---

## Forms

**Inquiry form (main site).** `components/InquiryForm.jsx` posts to
`site/app/api/inquiry/route.js`, which sends a notification to the practice and
an acknowledgment to the submitter via Resend. Needs `RESEND_API_KEY` on the
`latitude26-co` project; `RESEND_FROM` and `RESEND_INQUIRY_TO` / `RESEND_TO` are
optional.

**Waitlist form (retired coming-soon page).** `api/subscribe.js` validates the
submitted email and sends a "Waiting list sign up" notification to
info@latitude26.co via Resend, with `Reply-To` set to the submitted address and
an Eastern-time timestamp in the body. Runs on `latitude26-co-old`.
