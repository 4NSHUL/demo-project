# Modern Civic UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the working Complaint Register as a modern civic dashboard without altering application behavior.

**Architecture:** Preserve the existing React component and service boundaries. Adjust only presentational markup where a modern component state needs a class or icon hook, then replace the shared CSS visual system and verify the existing workflow at desktop and mobile sizes.

**Tech Stack:** React, Vite, Tailwind CSS import, custom CSS, Vitest, React Testing Library.

## Global Constraints

- Do not change complaint fields, service interfaces, persistence, filters, or mutations.
- Preserve all accessible labels and existing test selectors.
- Use white 16px-radius surfaces, modern rounded controls, soft shadows, navy/blue accents, and semantic status colors.
- Keep touch targets at least 44px and prevent mobile horizontal overflow.
- Avoid glassmorphism, neon colors, excessive gradients, and decorative clutter.

---

### Task 1: Modern Component Presentation Hooks

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/register/ComplaintForm.jsx`
- Modify: `src/components/register/ComplaintLedger.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: all existing component props and complaint service behavior unchanged.
- Produces: stable modern header, summary, button, card, and inline-control class hooks.

- [ ] Run `npm test -- --run src/App.test.jsx` and confirm the existing workflow test passes before visual edits.
- [ ] Simplify document-era microcopy and add presentational wrappers only where needed for modern icon/label alignment; preserve every accessible form and ledger label.
- [ ] Keep `ComplaintForm` submission, dependent dropdowns, and reset behavior unchanged.
- [ ] Keep `ComplaintLedger` search, filter, update, reopen, close, and delete callbacks unchanged.
- [ ] Run `npm test -- --run src/App.test.jsx`; expected result is one passing test with no accessibility query failures.

---

### Task 2: Modern Civic Design System and Responsive Verification

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: semantic classes from the existing React components.
- Produces: the approved modern civic dashboard at desktop and mobile widths.

- [ ] Replace document-style double rules, square panels, and serif-heavy typography with a clean system sans-serif hierarchy.
- [ ] Define modern tokens for page background, surfaces, navy text, blue primary, semantic status colors, 16px panel radius, 10-12px control radius, border, focus ring, and layered shadow.
- [ ] Restyle the header, summary cards, form panel, toolbar, complaint rows, badges, buttons, toast, loading/error states, and footer from the shared tokens.
- [ ] Use `transform: translateY(-1px)` and shadow changes for hover feedback; disable motion under `prefers-reduced-motion`.
- [ ] Keep the desktop complaint ledger structured and convert it to a single-column card layout below 760px with no horizontal scrolling.
- [ ] Run `npm test -- --run`; expected result is 19 passing tests.
- [ ] Run `npm run build`; expected result is Vite exit code 0 and generated `dist/` assets.
- [ ] Inspect the rendered page at desktop and mobile widths, checking header hierarchy, rounded buttons, form spacing, filter wrapping, complaint row readability, status states, and overflow.
- [ ] Run `git diff --check`; expected result is no output.

