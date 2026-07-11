# Complaint Register Demo Design

## Goal

Build a polished, mobile-first, single-page web app called **Complaint Register** for one Residents' Welfare Association (RWA). Residents can log complaints in an official-looking register, while the same shared interface lets RWA administrators update complaints through resolution.

The product is an event demo, not a production multi-tenant system. It intentionally excludes login, authorization, roles, resident isolation, notifications, chat, billing, and other society-management modules.

## Single-Page Experience

The complete workflow appears on one responsive page:

1. A registry-style document header identifies the RWA and the Complaint Register.
2. Summary counters show Total, Open, In Progress, and Resolved complaints.
3. A clearly labeled complaint-entry form records a new complaint.
4. Search and filter controls narrow the shared register.
5. A ledger lists all complaints, with inline Status and Estimated Resolution Date editing.

Submitting the form creates a generated, human-readable complaint ID, adds the complaint to the top of the ledger, records the initial status event, resets the form to sensible defaults, and shows success feedback. Data persists after refresh.

## Complaint Entry Form

Fields appear in this exact order:

1. **Resident Name**: free text, required.
2. **Block Number**: required dropdown with Block A through Block E.
3. **Flat Number**: required dependent dropdown. It is disabled until a block is selected, then shows only the flats configured for that block. Changing the block clears any previously selected flat.
4. **Phone Number**: optional telephone input with lightweight format validation when supplied.
5. **Complaint Category**: segmented radio control with `Individual` and `Community`; required.
6. **Complaint Type**: required dropdown populated from the selected category. Changing category clears an incompatible complaint type.
7. **Created Date**: required date input defaulting to the user's current local date.
8. **Status**: required dropdown defaulting to `Open`, with Open, In Progress, Resolved, and Closed options.
9. **Estimated Resolution Date**: optional date input that cannot precede Created Date.
10. **Comment**: optional multiline text for the complaint or administrative note.

The form keeps user input after a failed save, displays inline validation, and prevents duplicate submission while saving. Only Resident Name, Block Number, and Flat Number are explicitly mandatory from the product brief; Category, Type, Created Date, and Status are required by the selected controls so every ledger row is meaningful.

## Complaint Taxonomy

Individual complaint types are:

- Flat Maintenance
- Utility Issues
- Neighbor Complaints
- Parking
- Pets
- Billing & Payments
- Housekeeping
- Personal Requests

Community complaint types are:

- Water Supply
- Electricity
- Lift & Elevator
- Security
- Housekeeping & Cleanliness
- Common Area Maintenance
- Garden & Landscaping
- Clubhouse & Amenities
- Fire & Safety
- Pest Control
- Construction & Renovation
- Parking Area
- Waste Management
- Community Rules & Violations
- RWA & Administration
- Internet, Intercom & Communication
- Environment & Sustainability
- Events & Community Activities

Blocks, flats, categories, complaint types, and statuses live in a single configuration module. Demo blocks use a predictable catalog of flats across Blocks A-E so cascading selection is deterministic and easily changed later.

## Ledger Behavior

The register is ordered by most recent update first. Every row shows:

- Complaint ID
- Resident Name
- Block and Flat
- Phone Number
- Complaint Category
- Complaint Type
- Created Date
- Current Status
- Estimated Resolution Date
- Comment
- Last Updated
- Row actions

Status and Estimated Resolution Date can be changed directly from the ledger. A successful inline update persists immediately, records status history when status changes, refreshes summary counters, and shows concise feedback. A failed update restores the last persisted value and explains the failure.

The Status dropdown provides the requested close and reopen behavior: selecting `Closed` closes the complaint and records `closed_at`; changing a closed complaint back to `Open` reopens it and clears `closed_at`. All four statuses remain editable for the event demo so an administrator can demonstrate the entire lifecycle without a separate admin screen.

Deleting a row requires confirmation, removes its associated history, updates the summary, and provides feedback. No bulk delete is included.

On desktop, the ledger uses a structured table with a sticky identifier/status context where practical. On narrow screens, each row becomes a compact ledger card with label-value pairs and full-width edit controls; the page never relies on unusable horizontal scrolling.

## Search and Filters

A single search input matches Resident Name or Complaint Type, case-insensitively. Separate filters narrow by Block and Status. Search and filters combine using AND semantics, update locally without a network round trip, and provide a clear reset action. A dedicated empty state distinguishes an empty register from filters with no matches.

## Visual Direction

The design resembles an official civic register without looking old-fashioned or bureaucratically dense.

- Use a cool civic palette: registry navy, municipal blue, crisp white, cool gray, and restrained green/red accents for status stamps.
- Use a sturdy serif or slab-like face for the document title and a highly legible sans-serif system stack for controls and ledger content.
- Frame the header like a registry document with a thin double rule, compact RWA metadata, and a simple monogram seal built with CSS rather than an image dependency.
- Render statuses as stamp/seal-style badges with a border, uppercase label, and small status mark. Color is never the only status signal.
- Use fine ledger dividers, aligned field labels, tabular numbers for IDs and dates, modest corner radii, and minimal shadows.
- Keep forms bright, structured, and spacious rather than cream, terracotta, dark, neon, glassy, or gradient-heavy.
- Use restrained transitions only for feedback, disclosure, and newly added ledger entries.

The page should feel credible as an RWA administrative tool and immediately understandable to residents who are not technically sophisticated.

## Architecture

The existing Vite React client remains the deployable application. Hash-based routing is unnecessary for a true single-page register, so the app renders one route and avoids introducing a routing dependency.

Responsibilities are divided into focused modules:

- `components/register/` renders the registry header, summary counters, complaint form, search/filter controls, desktop ledger, mobile ledger cards, and inline actions.
- `components/ui/` provides small reusable form controls, badges, confirmation dialog, notifications, and feedback surfaces.
- `services/` exposes the complaint persistence contract and selects the configured adapter.
- `data/` contains field catalogs and realistic seed records for demo mode.
- `hooks/` coordinates loading, mutations, filters, and notifications.
- `utils/` owns ID generation, validation, date formatting, status metadata, and derived summaries.

The application uses React state and hooks rather than a global state library. UI components do not call Supabase or localStorage directly, and `App.jsx` remains focused on page composition.

## Persistence

The primary adapter uses Supabase through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. It represents one shared, unauthenticated community register. When configured, every browser using the page reads and writes the same Supabase records.

When Supabase configuration is absent, the application automatically uses a localStorage adapter with the same asynchronous interface. The fallback seeds realistic complaints on first use and keeps the event demo usable without setup, but its data is shared only within that browser. The interface identifies the active storage mode in a discreet footer note so this limitation is honest during setup.

Both adapters implement:

- `listComplaints`
- `createComplaint`
- `updateComplaint`
- `deleteComplaint`
- `listComplaintHistory`

The Supabase setup defines `complaints` and `complaint_status_history` tables. Complaints contain the generated display ID, every form value, `closed_at`, `created_at`, and `updated_at`. History records contain the complaint ID, previous status, new status, optional note, and timestamp. Deleting a complaint cascades to its history.

## Data Flow

On startup, the service factory checks for both Supabase environment variables. It selects Supabase only when both exist; otherwise it selects localStorage. The page requests complaints once, then derives search results, filters, summaries, and display ordering in the client.

Create, inline edit, and delete actions go through the selected service. Successful mutations update the page from the persisted result. Failed mutations preserve form input or restore the affected ledger row and show an actionable error. A manual retry reloads the register.

Generated IDs follow a readable demo format such as `CR-2026-0001`. The service guarantees uniqueness within the current dataset rather than relying on the visible ID as the database primary key.

## Demo Data

The local fallback starts with at least eight realistic complaints distributed across Blocks A-E, both categories, multiple complaint types, and all four statuses. Records use varied residents, flats, phone values, dates, estimates, and comments. Seed data stays outside UI components.

## Accessibility and Responsiveness

All controls use semantic elements and visible labels. Keyboard focus remains visible, the confirmation dialog exposes an accessible name, and asynchronous feedback uses an appropriate live region. Form errors are linked to their controls. Status is never conveyed by color alone.

The page is mobile-first and usable at 320px. The entry form becomes a compact multi-column grid at larger widths. Touch targets remain generous, filters wrap cleanly, and the mobile ledger preserves every field and action without horizontal overflow.

## Error Handling

The application explicitly handles initial loading, empty register, no search matches, failed saves, failed inline edits, failed deletes, invalid dates, and unexpected persistence data. Missing Supabase configuration is not an error because the app deliberately falls back to localStorage.

## Testing

Vitest and React Testing Library cover:

- Required field validation and Created Date default.
- Flat dropdown disabled before Block selection and repopulated after selection.
- Complaint Type options changing with Category.
- Complaint creation and generated ID display.
- Search by resident name and complaint type.
- Combined Block and Status filters.
- Summary counts.
- Inline Status and Estimated Resolution Date updates.
- Close and reopen behavior through the status control.
- Confirmed deletion and cancelled deletion.
- Loading, empty, no-match, and failure feedback.

Component tests mock the service contract. Service tests exercise ID generation, localStorage persistence, history creation, updates, and deletion without contacting Supabase.

## Deployment

Vite uses the GitHub repository base path. The existing Pages workflow builds and publishes `dist`. Supabase values remain optional build-time variables; without them, the deployed app uses localStorage.

The README documents local commands, the demo-only security posture, optional Supabase SQL setup, the shared-versus-browser-local persistence distinction, environment configuration, and GitHub Pages deployment. A `.env.example` contains variable names but no credentials.

## Completion Criteria

The demo is complete when the exact form and cascading controls work, a generated complaint appears in the same-page ledger, search and filters work together, summary counters stay accurate, Status and Estimated Resolution Date are editable inline, complaints can be closed, reopened, and deleted, data survives refresh, the Supabase mode provides one shared register, the fallback works without setup, automated tests pass, and `npm run build` succeeds.
