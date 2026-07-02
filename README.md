# jiageng wang — personal site

Personal site and blog of Jiageng (Will) Wang, built with [Astro](https://astro.build).

**Live at [thewind-upbird.github.io](https://thewind-upbird.github.io)** — deployed automatically to GitHub Pages on every push to `main`.

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Writing a post

Add a `.md` file under `src/content/blog/`:

```markdown
---
title: 'Post title'
description: 'One-line summary shown in lists and SEO.'
pubDate: 2026-07-15
lang: zh          # 'en' or 'zh'
tags: [agents, eda]
draft: false      # true = unpublished
---

Body supports Markdown, KaTeX math ($...$ / $$...$$), code highlighting, and tables.
```

The filename becomes the URL slug (`my-post.md` → `/blog/my-post/`).
