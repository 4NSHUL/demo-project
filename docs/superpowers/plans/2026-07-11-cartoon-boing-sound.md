# Cartoon Boing Submission Sound Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Play one of three short cartoon-boing variations after a complaint saves successfully.

**Architecture:** A standalone audio utility owns Web Audio creation, variant selection, pitch automation, and cleanup. `ComplaintForm` invokes the utility only after its existing asynchronous create callback reports success.

**Tech Stack:** React, browser Web Audio API, Vitest, React Testing Library.

## Global Constraints

- Do not add audio files or dependencies.
- Do not change complaint data, persistence, validation, or layout.
- Never block or fail submission when Web Audio is unavailable.
- Play audio only after successful persistence.

---

### Task 1: Tested Cartoon Boing Utility

**Files:**
- Create: `src/utils/cartoonBoing.js`
- Create: `src/utils/cartoonBoing.test.js`

**Interfaces:**
- Produces: `playCartoonBoing({ AudioContextClass, random } = {})` returning `true` when playback starts and `false` when Web Audio is unavailable.

- [ ] Write failing tests that inject a fake AudioContext and assert oscillator/gain creation, random variant selection, frequency automation, gain automation, start, stop, and silent fallback.
- [ ] Run `npm test -- --run src/utils/cartoonBoing.test.js`; expected result is module-resolution failure.
- [ ] Implement three immutable variant configurations, lazy context construction, a sine oscillator, gain envelope, pitch drop, scheduled stop, and catch-all fallback.
- [ ] Run `npm test -- --run src/utils/cartoonBoing.test.js`; expected result is all utility tests passing.

---

### Task 2: Successful Submission Integration

**Files:**
- Modify: `src/components/register/ComplaintForm.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `playCartoonBoing()` from Task 1 and existing `onCreate(values): Promise<boolean>`.
- Produces: one boing call after a successful create and no call after failed creation.

- [ ] Add failing component tests that mock `playCartoonBoing`, submit valid values with successful and failed `onCreate` results, and assert the success-only call behavior.
- [ ] Run `npm test -- --run src/App.test.jsx`; expected result is a missing integration assertion failure.
- [ ] Import and call `playCartoonBoing()` inside the existing `if (saved)` branch before resetting the form.
- [ ] Run `npm test -- --run`; expected result is the complete suite passing.
- [ ] Run `npm run build` and `git diff --check`; expected result is a successful Vite build and no whitespace errors.

