# Next increments for jojeco.github.io

- [x] ~~**Persist the project filter selection**~~ — the selected category now lives in the URL hash (`#projects?filter=ai`), falls back to localStorage when there's no hash, stays in sync with Back/Forward, and the chip group has an empty state plus Left/Right/Home/End keyboard navigation.
- **Update contact section copy** — "Seeking summer 2026 internships and part-time roles..." (index.html, contact section) is stale; update to reflect fall 2026 / early 2027 availability and the May 2027 graduation timeline.
- **Add GitHub links to more project cards** — only "LLM Playground" has a `.project-links` block. "Scheduling System" and "Full-Stack Kanban System" read as complete but have no GitHub or live-demo links; add `<div class="project-links">` wherever a repo exists.
- **Remove unused prism.css / prism.js** — neither file is referenced anywhere in index.html; safe to delete.
- **Add Open Graph meta tags** — no `og:` tags in `<head>` yet. Add `og:title`, `og:description`, and `og:image` for richer link previews when the portfolio URL is shared on LinkedIn or Discord.
