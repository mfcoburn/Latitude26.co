# Latitude 26 Concierge Medical

Two separate sites live in this repo, deployed as two separate Vercel projects.

| | Repo path | Vercel project | Status |
|---|---|---|---|
| Coming-soon page | repo root (`index.html`) | `latitude26-co` | currently on latitude26.co |
| Main site | `site/` | `latitude26-main-site` | launch-ready, public at its `*.vercel.app` URL |

Launch is a **domain swap**: move `latitude26.co` (and `www`) from the
`latitude26-co` project to `latitude26-main-site` in the Vercel dashboard.
There is no app-level gate to disable — see "Launch" below. `.vercelignore`
excludes `site/` from the root project so the main site is never served at
`latitude26.co/site/*`.

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
- The contact form (`components/InquiryForm.jsx`) validates but deliberately
  does not submit anywhere yet — see `TODO(backend)`.

---

## Launch

There is **no app-level auth gate**. An earlier `site/middleware.js` Basic Auth
gate (and its `SITE_GATE_USER` / `SITE_GATE_PASSWORD` / `SITE_GATE_ENABLED` env
vars) was removed; nothing in the code reads those vars anymore. Before launch
the main site is kept off the public domain simply by not pointing
`latitude26.co` at it — the `latitude26-main-site` project is otherwise publicly
reachable at its own `*.vercel.app` URL.

Indexing is already enabled for launch: `site/app/robots.js` allows `/`,
`site/app/layout.jsx` sets `robots: { index: true, follow: true }`, and there is
no `X-Robots-Tag` noindex header in `site/next.config.mjs`.

**To launch (Vercel dashboard, domain swap):**

1. `latitude26-co` project → Settings → Domains → remove `latitude26.co` and
   `www.latitude26.co`.
2. `latitude26-main-site` project → Settings → Domains → add `latitude26.co` and
   `www.latitude26.co`.
3. Verify `https://latitude26.co` serves the main site, then submit it to Google
   Search Console to start indexing.

---

## Waitlist form (coming-soon page)

`api/subscribe.js` validates the submitted email and sends a
"Waiting list sign up" notification to info@latitude26.co via Resend, with
`Reply-To` set to the submitted address and an Eastern-time timestamp in the
body. Needs `RESEND_API_KEY` on the `latitude26-co` project.
