# Complaint Register Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished single-page RWA Complaint Register with dependent form fields, a searchable and editable ledger, persistent demo data, and optional shared Supabase persistence.

**Architecture:** React renders one registry page composed from focused form, summary, toolbar, ledger, and feedback components. A `useComplaintRegister` hook owns page state and calls an adapter selected by `complaintService`; the adapter uses Supabase REST when environment values exist and an asynchronous localStorage implementation otherwise.

**Tech Stack:** React, Vite, Tailwind CSS, browser `fetch`, localStorage, Supabase PostgREST, Vitest, React Testing Library, GitHub Pages.

## Global Constraints

- Keep the product a demo with no login, roles, authorization, or production security controls.
- Keep the complete workflow on one responsive page; do not introduce routing.
- Preserve the exact field order and the Individual/Community complaint type catalogs from the approved design.
- Require Resident Name, Block Number, Flat Number, Complaint Category, Complaint Type, Created Date, and Status.
- Default Created Date to the user's current local date and Status to `Open`.
- Make Status and Estimated Resolution Date editable from the ledger and confirm deletion.
- Use Supabase only when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist; otherwise use localStorage.
- Keep data shared across browsers only in configured Supabase mode and state the active mode honestly in the UI.
- Use a civic navy, municipal blue, crisp white, and cool-gray visual system with seal-style status badges.
- Ensure `npm test -- --run` and `npm run build` pass before completion.

---

## File Map

- `src/data/registerConfig.js`: blocks, flats, complaint types, statuses, and initial-form defaults.
- `src/data/seedComplaints.js`: realistic local demo complaints and their history.
- `src/utils/register.js`: date helpers, validation, filtering, summaries, display-ID generation, and record normalization.
- `src/services/localComplaintService.js`: asynchronous localStorage CRUD and history persistence.
- `src/services/supabaseComplaintService.js`: shared Supabase REST CRUD implementation.
- `src/services/complaintService.js`: environment-based adapter factory and storage-mode metadata.
- `src/hooks/useComplaintRegister.js`: list loading, create/update/delete mutations, filters, and feedback state.
- `src/components/register/RegistryHeader.jsx`: document-style title, seal, RWA metadata, and storage-mode label.
- `src/components/register/SummaryStrip.jsx`: Total/Open/In Progress/Resolved summary tiles.
- `src/components/register/ComplaintForm.jsx`: exact-order entry form with cascading dropdowns and validation.
- `src/components/register/RegisterToolbar.jsx`: search, Block filter, Status filter, and reset.
- `src/components/register/ComplaintLedger.jsx`: desktop ledger table, mobile ledger cards, inline edits, and delete confirmation trigger.
- `src/components/ui/StatusStamp.jsx`: accessible stamp-style status badge.
- `src/components/ui/ConfirmDialog.jsx`: accessible delete confirmation dialog.
- `src/components/ui/Toast.jsx`: live success/error feedback.
- `src/App.jsx`: single-page composition and top-level states.
- `src/index.css`: complete civic visual system and responsive behavior.
- `src/test/setup.js`: Testing Library matchers and test cleanup.
- `src/utils/register.test.js`: domain helper tests.
- `src/services/localComplaintService.test.js`: persistence and history tests.
- `src/App.test.jsx`: user-flow and accessibility-oriented component tests.
- `supabase/schema.sql`: demo tables, indexes, timestamp trigger, and seed-compatible schema.
- `.env.example`: optional Supabase variable names.
- `README.md`: local, demo, Supabase, testing, and Pages instructions.
- `package.json`: test scripts and test-only dependencies.

---

### Task 1: Domain Catalog, Validation, and Test Harness

**Files:**
- Create: `src/data/registerConfig.js`
- Create: `src/utils/register.js`
- Create: `src/utils/register.test.js`
- Create: `src/test/setup.js`
- Modify: `package.json`
- Modify: `vite.config.js`

**Interfaces:**
- Produces: `BLOCK_FLATS`, `COMPLAINT_TYPES`, `STATUSES`, `createInitialForm()`, `validateComplaint(values)`, `filterComplaints(records, filters)`, `getSummary(records)`, `createDisplayId(records, year)`, and `toLocalDateInput(date)`.
- Produces: `npm test` running Vitest with jsdom and `src/test/setup.js`.

- [ ] **Step 1: Add the test harness dependencies and scripts**

Run:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add these scripts to `package.json`:

```json
"test": "vitest",
"test:run": "vitest run"
```

Add this test configuration to `vite.config.js`:

```js
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.js',
  css: true,
}
```

- [ ] **Step 2: Write failing domain tests**

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest'
```

Create `src/utils/register.test.js` with tests that assert:

```js
expect(BLOCK_FLATS['Block A']).toContain('A-101')
expect(COMPLAINT_TYPES.Individual).toContain('Flat Maintenance')
expect(COMPLAINT_TYPES.Community).toContain('Water Supply')
expect(createInitialForm(new Date('2026-07-11T08:00:00'))).toMatchObject({
  blockNumber: '',
  flatNumber: '',
  complaintCategory: 'Individual',
  complaintType: '',
  createdDate: '2026-07-11',
  status: 'Open',
})
expect(validateComplaint({})).toMatchObject({
  residentName: expect.any(String),
  blockNumber: expect.any(String),
  flatNumber: expect.any(String),
})
expect(filterComplaints(records, { search: 'water', block: '', status: '' })).toHaveLength(1)
expect(getSummary(records)).toEqual({ total: 4, open: 1, inProgress: 1, resolved: 1 })
expect(createDisplayId([{ displayId: 'CR-2026-0009' }], 2026)).toBe('CR-2026-0010')
```

- [ ] **Step 3: Run the tests to verify failure**

Run: `npm test -- --run src/utils/register.test.js`

Expected: FAIL because the catalog and helper modules do not exist.

- [ ] **Step 4: Implement catalogs and helpers**

Define Blocks A-E with `A-101` through `A-404` style values, preserving the selected block prefix. Define every complaint type verbatim from the design. Implement `validateComplaint` with required-field, optional phone, and estimated-date rules. Implement filtering as case-insensitive Resident Name/Complaint Type matching combined with exact Block and Status matches. Exclude Closed from the four requested summary values while still counting it in Total.

The `createDisplayId` implementation must scan matching `CR-YYYY-NNNN` values and increment the highest sequence; it must not use the array length.

- [ ] **Step 5: Run the tests and commit**

Run: `npm test -- --run src/utils/register.test.js`

Expected: all domain tests PASS.

```bash
git add package.json package-lock.json vite.config.js src/data/registerConfig.js src/utils/register.js src/utils/register.test.js src/test/setup.js
git commit -m "test: define complaint register domain"
```

---

### Task 2: Persistent Complaint Services

**Files:**
- Create: `src/data/seedComplaints.js`
- Create: `src/services/localComplaintService.js`
- Create: `src/services/supabaseComplaintService.js`
- Create: `src/services/complaintService.js`
- Create: `src/services/localComplaintService.test.js`
- Create: `supabase/schema.sql`
- Create: `.env.example`

**Interfaces:**
- Consumes: `createDisplayId(records, year)` from Task 1 and the normalized complaint property names from `createInitialForm()`.
- Produces: service methods `listComplaints()`, `createComplaint(values)`, `updateComplaint(id, patch)`, `deleteComplaint(id)`, and `listComplaintHistory(complaintId)` returning Promises.
- Produces: `complaintService` and `storageMode` (`'supabase'` or `'local'`) from `src/services/complaintService.js`.

- [ ] **Step 1: Write failing local service tests**

Cover these concrete behaviors in `src/services/localComplaintService.test.js`:

```js
const service = createLocalComplaintService(memoryStorage)
const initial = await service.listComplaints()
expect(initial).toHaveLength(8)

const created = await service.createComplaint(validValues)
expect(created.displayId).toMatch(/^CR-\d{4}-\d{4}$/)
expect(created.status).toBe('Open')

const updated = await service.updateComplaint(created.id, { status: 'Closed' })
expect(updated.closedAt).toEqual(expect.any(String))
expect(await service.listComplaintHistory(created.id)).toEqual(
  expect.arrayContaining([expect.objectContaining({ toStatus: 'Closed' })]),
)

const reopened = await service.updateComplaint(created.id, { status: 'Open' })
expect(reopened.closedAt).toBeNull()

await service.deleteComplaint(created.id)
expect((await service.listComplaints()).some((item) => item.id === created.id)).toBe(false)
expect(await service.listComplaintHistory(created.id)).toEqual([])
```

- [ ] **Step 2: Run service tests to verify failure**

Run: `npm test -- --run src/services/localComplaintService.test.js`

Expected: FAIL because the service module does not exist.

- [ ] **Step 3: Implement seed data and local adapter**

Use storage keys `rwa-complaint-register:v1:complaints` and `rwa-complaint-register:v1:history`. Clone seed values before storing them. All public methods remain asynchronous. Create records with UUID primary keys, readable display IDs, ISO timestamps, and an initial history record. Update `closedAt` when status enters/leaves Closed. Throw `Complaint not found` for stale IDs.

- [ ] **Step 4: Implement Supabase REST adapter and factory**

Use browser `fetch` against `${url}/rest/v1/complaints` and `${url}/rest/v1/complaint_status_history` with `apikey`, `Authorization: Bearer <anon key>`, and JSON headers. Use `Prefer: return=representation` for mutations. Map snake_case database fields to the camelCase UI contract at the adapter boundary. A status-changing update writes its history entry after the complaint update; a failed response throws a concise error containing the response status.

Select this adapter only when both environment values are non-empty:

```js
const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const storageMode = hasSupabase ? 'supabase' : 'local'
export const complaintService = hasSupabase
  ? createSupabaseComplaintService({
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    })
  : createLocalComplaintService(window.localStorage)
```

- [ ] **Step 5: Add schema and environment example**

Create `supabase/schema.sql` with UUID primary keys, the complete complaint columns, a unique `display_id`, constrained Category and Status values, timestamps, history with `on delete cascade`, and an `updated_at` trigger. Because this is explicitly a public demo, grant anonymous CRUD access and label that choice in SQL comments as demo-only.

Create `.env.example`:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- --run src/services/localComplaintService.test.js`

Expected: all service tests PASS.

```bash
git add src/data/seedComplaints.js src/services src/services/localComplaintService.test.js supabase/schema.sql .env.example
git commit -m "feat: add persistent complaint services"
```

---

### Task 3: Form, Register State, and Summary Experience

**Files:**
- Create: `src/hooks/useComplaintRegister.js`
- Create: `src/components/register/RegistryHeader.jsx`
- Create: `src/components/register/SummaryStrip.jsx`
- Create: `src/components/register/ComplaintForm.jsx`
- Create: `src/components/ui/Toast.jsx`
- Create: `src/App.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `complaintService`, `storageMode`, Task 1 catalogs/helpers, and Task 2 service contract.
- Produces: `useComplaintRegister()` returning `{ complaints, visibleComplaints, summary, filters, setFilters, loading, error, feedback, createComplaint, updateComplaint, deleteComplaint, retry }`.
- Produces: a rendered registry header, counters, and complaint form connected to persistent state.

- [ ] **Step 1: Write failing form and summary tests**

Mock `src/services/complaintService.js` and assert:

```js
expect(await screen.findByRole('heading', { name: /complaint register/i })).toBeVisible()
expect(screen.getByText('8', { selector: '[data-summary="total"]' })).toBeVisible()
expect(screen.getByLabelText(/flat number/i)).toBeDisabled()

await user.selectOptions(screen.getByLabelText(/block number/i), 'Block A')
expect(screen.getByLabelText(/flat number/i)).toBeEnabled()
expect(screen.getByRole('option', { name: 'A-101' })).toBeVisible()

await user.click(screen.getByLabelText('Community'))
expect(screen.getByRole('option', { name: 'Water Supply' })).toBeVisible()
expect(screen.queryByRole('option', { name: 'Flat Maintenance' })).not.toBeInTheDocument()

await user.click(screen.getByRole('button', { name: /add to register/i }))
expect(await screen.findByText(/resident name is required/i)).toBeVisible()
```

Add a successful creation test that fills the required controls, submits, expects `createComplaint` to receive normalized values, and expects a success live-region message.

- [ ] **Step 2: Run component tests to verify failure**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because the new application components do not exist.

- [ ] **Step 3: Implement the register hook**

Load once on mount with an active-request guard. Derive `visibleComplaints` and `summary` with `useMemo`. Wrap create/update/delete operations in a mutation helper that clears stale feedback, calls the service, reloads the persisted list, and exposes `{ type: 'success' | 'error', message }`. Keep a callable `retry` for initial-load failures.

- [ ] **Step 4: Implement registry header, summary, form, and toast**

The form must use one controlled object from `createInitialForm()`. When Block changes, set `flatNumber: ''`. When Category changes, set `complaintType: ''`. Render inputs in the approved exact order and use `aria-describedby` for inline errors. On success, reset to fresh defaults; on failure, preserve input. The submit label is `Add to register`.

The registry header includes the CSS-built `RWA` seal, `Complaint Register` title, `Residents' Welfare Association`, and a mode label of `Shared community register` or `Browser demo register`.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- --run src/App.test.jsx`

Expected: form, dependency, summary, validation, and creation tests PASS.

```bash
git add src/hooks/useComplaintRegister.js src/components/register/RegistryHeader.jsx src/components/register/SummaryStrip.jsx src/components/register/ComplaintForm.jsx src/components/ui/Toast.jsx src/App.jsx src/App.test.jsx
git commit -m "feat: add complaint entry workflow"
```

---

### Task 4: Searchable and Editable Ledger

**Files:**
- Create: `src/components/register/RegisterToolbar.jsx`
- Create: `src/components/register/ComplaintLedger.jsx`
- Create: `src/components/ui/StatusStamp.jsx`
- Create: `src/components/ui/ConfirmDialog.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- Consumes: `visibleComplaints`, `filters`, `setFilters`, `updateComplaint`, and `deleteComplaint` from the register hook.
- Produces: search and combined filters, desktop/mobile ledger rendering, inline Status/Estimated Resolution Date updates, close/reopen semantics, and confirmed deletion.

- [ ] **Step 1: Add failing ledger tests**

Assert the following concrete behavior:

```js
await user.type(screen.getByRole('searchbox', { name: /search register/i }), 'water')
expect(screen.getByText('Water Supply')).toBeVisible()
expect(screen.queryByText('Flat Maintenance')).not.toBeInTheDocument()

await user.selectOptions(screen.getByLabelText(/filter by block/i), 'Block B')
await user.selectOptions(screen.getByLabelText(/filter by status/i), 'Resolved')
expect(screen.getAllByTestId('complaint-record')).toHaveLength(1)

await user.selectOptions(screen.getByLabelText(/status for CR-2026-0004/i), 'Closed')
expect(mockUpdateComplaint).toHaveBeenCalledWith(expect.any(String), { status: 'Closed' })

await user.click(screen.getByRole('button', { name: /delete CR-2026-0004/i }))
expect(screen.getByRole('dialog', { name: /delete complaint/i })).toBeVisible()
await user.click(screen.getByRole('button', { name: /^delete$/i }))
expect(mockDeleteComplaint).toHaveBeenCalled()
```

Also test Estimated Resolution Date edits, reset filters, cancellation of delete, and the no-match state.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because toolbar and ledger controls do not exist.

- [ ] **Step 3: Implement toolbar and status stamp**

The toolbar uses a search input plus Block and Status selects. Reset clears all three values. `StatusStamp` renders both a dot/check mark and uppercase status text with a normalized status class.

- [ ] **Step 4: Implement responsive ledger and confirmation dialog**

Render a semantic table inside `.ledger-desktop` and equivalent labeled cards inside `.ledger-mobile`; CSS determines which is visible, and duplicate controls use distinct accessible labels containing the display ID. Inline selects and dates call `updateComplaint(id, patch)`. The date input has `min={complaint.createdDate}`. Delete opens one controlled native-style dialog component and only calls the service after confirmation.

Desktop columns prioritize Complaint ID, Resident, Location, Category/Type, Created, Status, Estimated, Comment, and Actions. Phone and Last Updated appear in accessible secondary text so every field remains represented without producing an unusably wide table.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- --run src/App.test.jsx`

Expected: all search, filter, edit, close/reopen, and delete tests PASS.

```bash
git add src/components/register/RegisterToolbar.jsx src/components/register/ComplaintLedger.jsx src/components/ui/StatusStamp.jsx src/components/ui/ConfirmDialog.jsx src/App.jsx src/App.test.jsx
git commit -m "feat: add editable complaint ledger"
```

---

### Task 5: Civic Visual System and Responsive Polish

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.jsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: stable semantic class names and component hierarchy from Tasks 3-4.
- Produces: the final 320px-to-desktop civic registry visual experience.

- [ ] **Step 1: Establish visual tokens**

Define CSS custom properties for registry navy `#102a43`, municipal blue `#1f5f8b`, pale blue `#eaf3f8`, cool paper `#f4f7f9`, ink `#172b3a`, rule `#c7d5df`, success `#1f6b4f`, warning `#9a6700`, and danger `#9f2d2d`. Set a Georgia-style serif stack for the register title and a system sans stack for UI text. Change `color-scheme` to `light`.

- [ ] **Step 2: Style the document and form**

Implement a double-rule registry header, CSS circular RWA seal, four compact summary tiles, structured form fieldsets, clear labels, accessible focus rings, and a primary municipal-blue submit action. Use modest radii and minimal shadows.

- [ ] **Step 3: Style the ledger and states**

Use fine horizontal ledger rules, tabular IDs/dates, sticky desktop table header, stamp-style status borders, compact filters, and clear empty/error surfaces. Animate only toast entrance and newly added records, while respecting `prefers-reduced-motion`.

- [ ] **Step 4: Implement responsive breakpoints and verify**

At widths below 760px hide `.ledger-desktop` and show `.ledger-mobile`; reverse that rule at 760px and above. Use single-column form fields below 640px, two columns above it, and ensure the Comment field spans the available width.

Run: `npm test -- --run && npm run build`

Expected: all tests PASS and Vite exits 0 with files emitted to `dist/`.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/App.jsx index.html
git commit -m "style: polish civic complaint register"
```

---

### Task 6: Documentation, Deployment Inputs, and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Consumes: build and environment contract from Tasks 1-5.
- Produces: repeatable local setup, optional shared Supabase setup, and GitHub Pages deployment instructions.

- [ ] **Step 1: Document the working application**

Replace the blank-starter README with:

- Product overview and implemented features.
- `npm install`, `npm run dev`, `npm test -- --run`, and `npm run build` commands.
- Explicit statement that localStorage mode is browser-local and Supabase mode is shared.
- Optional `supabase/schema.sql` execution and `.env` setup.
- Demo-only warning that the unauthenticated Supabase policy is not production security.
- GitHub Pages variable setup for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

- [ ] **Step 2: Pass optional Supabase variables into the Pages build**

Set job-level build environment values without making them required:

```yaml
env:
  VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

- [ ] **Step 3: Run complete verification**

Run:

```bash
npm test -- --run
npm run build
git diff --check
git status --short
```

Expected: all tests PASS, build exits 0, `git diff --check` is silent, and only intended implementation files are modified.

- [ ] **Step 4: Commit the completed application**

```bash
git add README.md .github/workflows/deploy-pages.yml
git commit -m "docs: add complaint register setup"
```

