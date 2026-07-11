# Event Starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and publish a blank, build-verified Vite + React + Tailwind starter for an AI product-building event.

**Architecture:** A static Vite React client is intentionally the full architecture. Tailwind is supplied for rapid UI construction later, while the base app has no product domain or external dependencies.

**Tech Stack:** Node.js, npm, Vite, React, Tailwind CSS, Git, GitHub Pages.

## Global Constraints

- Keep the starter blank and prompt-agnostic.
- Do not add backend services, persistence, authentication, Docker, or API keys.
- Use GitHub Pages deployment from GitHub Actions.
- Verify a production build before publishing.

---

### Task 1: Scaffold and configure the static starter

**Files:**
- Create: Vite-generated project files, `src/index.css`, `SPRINT.md`
- Modify: `package.json`, `vite.config.js`, `src/App.jsx`

**Interfaces:**
- Consumes: `npm run dev` and `npm run build`
- Produces: static build output in `dist/`

- [ ] Scaffold a React Vite application in the repository root.
- [ ] Configure Tailwind CSS and create the intentionally blank page.
- [ ] Add the event sprint guide.
- [ ] Run `npm run build`; expected result: exit code 0.

### Task 2: Version and publish the starter

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: GitHub Actions on pushes to `main`
- Produces: a GitHub Pages deployment using the Vite `dist/` artifact

- [ ] Initialize Git and commit the verified starter.
- [ ] Create the GitHub repository and push `main`.
- [ ] Enable GitHub Pages with GitHub Actions as the source.
- [ ] Confirm the published URL renders.
