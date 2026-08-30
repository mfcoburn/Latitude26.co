# Latitude 26 Concierge Medical

Two separate sites live in this repo, deployed as two separate Vercel projects.

| | Repo path | Vercel project | Status |
|---|---|---|---|
| Coming-soon gate | repo root (`index.html`) | `latitude26-co` | **LIVE** on latitude26.co |
| Main site | `site/` | `latitude26-main-site` | unlaunched, behind Basic Auth |

**Do not change the coming-soon page's behaviour as the public entry point.**
It is the only publicly reachable route. `.vercelignore` excludes `site/` from
the root project so the unlaunched site is never served at `latitude26.co/site/*`.

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

## The gate

`site/middleware.js` puts the whole main site behind HTTP Basic Auth. It
**fails closed**: with credentials unset the site is unreachable rather than
accidentally public.

Env vars on the `latitude26-main-site` Vercel project:

| Variable | Purpose |
|---|---|
| `SITE_GATE_USER` | gate username |
| `SITE_GATE_PASSWORD` | gate password |
| `SITE_GATE_ENABLED` | set to exactly `false` to open the site publicly |

**To launch:** set `SITE_GATE_ENABLED=false`, relax `site/app/robots.js` to
allow indexing, drop the `X-Robots-Tag` header in `site/next.config.mjs`, then
move the `latitude26.co` domain onto `latitude26-main-site`.

---

## Waitlist form (coming-soon page)

`api/subscribe.js` validates the submitted email and sends a
"Waiting list sign up" notification to hello@latitude26.co via Resend, with
`Reply-To` set to the submitted address and an Eastern-time timestamp in the
body. Needs `RESEND_API_KEY` on the `latitude26-co` project.
