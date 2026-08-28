# Next increments for jojeco.github.io

- **Update contact section copy** — "Seeking summer 2026 internships" is now stale (August 2026); update to reflect fall 2026 / early 2027 availability and graduation timeline (May 2027).
- **Add GitHub links to more project cards** — "Scheduling System" maps to `kumon-scheduling-system`, "Full-Stack Kanban System" may have a repo; add `<div class="project-links">` with GitHub/live-demo links where repos exist.
- **Remove unused prism.css / prism.js** — confirmed again this run: neither file is referenced anywhere in index.html; safe to delete.
- **Add Open Graph meta tags** — `og:title`, `og:description`, `og:image` for richer link previews when the portfolio URL is shared on LinkedIn/Discord.
- **Persist the project filter selection** — the new category filter (chips above the projects grid) resets to "All" on reload; consider a URL hash (`#projects?filter=ai`) or localStorage so a shared filtered link stays filtered.
