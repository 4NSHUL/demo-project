# Society Complaint Demo Design

## Goal

Build a polished, mobile-first demo for a single apartment society where a resident can list complaints, create a complaint, track its status, close a resolved complaint, and reopen a closed complaint.

The product is an event demo, not a production multi-tenant system. It intentionally excludes authentication, authorization, roles, resident isolation, notifications, chat, billing, and other society-management modules.

## Product Experience

The dashboard is the application entry point. It shows status totals, search and status filters, a prominent **Raise Complaint** action, and complaint cards ordered by most recent activity. Each card communicates the issue, apartment, category, priority, current status, and update time without requiring the user to open it.

Creating a complaint requires a title, description, category, priority, and apartment number. A successful submission creates an `Open` complaint, records its first timeline event, provides success feedback, and returns the resident to the refreshed dashboard.

Opening a complaint shows full details and a chronological status timeline. Demo controls simulate the society team's work through these allowed transitions:

- `Open` to `In Progress` using **Start Work**.
- `In Progress` to `Resolved` using **Mark Resolved**, with an optional resolution note.
- `Resolved` to `Closed` using **Close Complaint**, after confirmation.
- `Closed` to `Open` using **Reopen Complaint**, with a required reason.

Invalid transitions are unavailable in the interface and rejected by the service layer. Closing records `closed_at`; reopening clears it. Every transition appends a history entry and refreshes the dashboard immediately.

## Visual Design

The interface uses a light neutral background, white surfaces, dark slate text, and a restrained teal or blue accent. Statuses combine text labels, icons, and accessible colors. Cards use subtle borders, modest shadows, rounded corners, and consistent spacing.

The layout is mobile-first and remains usable at 320px. Summary cards and complaint cards stack on small screens and expand into compact grids on larger screens. The visual hierarchy favors current status and next action. The application does not include a marketing hero, glass effects, dense desktop tables, or decorative motion.

## Architecture

The existing Vite React client remains the deployable application. Hash-based routing supports dashboard, creation, and complaint-detail routes on GitHub Pages without server rewrites.

Responsibilities are divided into focused modules:

- `pages/` composes the dashboard, create form, and detail experience.
- `components/complaints/` renders complaint cards, filters, forms, summaries, timelines, and status actions.
- `components/ui/` provides small reusable controls and feedback surfaces.
- `services/` exposes the complaint persistence contract and selects the configured adapter.
- `data/` contains realistic seed records for demo mode.
- `hooks/` coordinates loading, mutations, refreshes, and user feedback.
- `utils/` owns status metadata, allowed transitions, and date formatting.

The application uses React state and hooks rather than a global state library. UI components do not call Supabase or localStorage directly.

## Persistence

The primary adapter uses Supabase through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The database is a shared, unauthenticated demo dataset. No users, roles, ownership fields, or row-level security policies are included.

When Supabase configuration is absent, the application automatically uses a localStorage adapter with the same asynchronous interface. The fallback seeds realistic complaints on first use and makes the deployed demo immediately usable without external setup.

Both adapters implement:

- `listComplaints`
- `getComplaint`
- `createComplaint`
- `updateComplaintStatus`
- `closeComplaint`
- `reopenComplaint`
- `listComplaintHistory`

The Supabase setup defines `complaints` and `complaint_status_history` tables. Complaints contain title, description, category, priority, apartment number, status, optional resolution note, created and updated timestamps, and optional closed timestamp. History records contain the complaint ID, previous status, new status, optional note, and timestamp.

## Data Flow

On startup, the service factory checks for both Supabase environment variables. It selects the Supabase adapter only when both exist; otherwise it selects localStorage. The dashboard requests complaints, derives summary counts and filtered results in the client, and renders explicit loading, empty, and failure states.

Mutations are performed through the selected service. After a successful create or status transition, the owning page reloads the relevant complaint data and shows concise success feedback. A failed operation preserves the current view and input, shows an actionable error, and offers retry where appropriate.

## Demo Data

The local fallback begins with at least six complaints: two Open, one In Progress, one Resolved, and two Closed. Records use varied categories, priorities, apartments, timestamps, descriptions, resolution notes, and meaningful status histories. Seed data stays outside production UI components.

## Accessibility

All controls use semantic elements and visible labels. Keyboard focus remains visible, dialogs expose accessible names, and asynchronous feedback uses an appropriate live region. Status is never conveyed by color alone. Forms provide inline validation, preserve input after failure, and prevent duplicate submission while saving.

## Error Handling

The application explicitly handles initial loading, no complaints, no filter matches, missing complaint IDs, slow mutations, and persistence failures. A missing Supabase configuration is not an error because the application deliberately falls back to localStorage. Unexpected service data is normalized or reported rather than crashing the entire page.

## Testing

Vitest and React Testing Library cover the behaviors visible in the demo:

- Complaint list rendering, search, and status filtering.
- Required create-form validation and successful creation.
- Allowed status transitions and rejection of invalid transitions.
- Closing only resolved complaints.
- Reopening only closed complaints with a non-empty reason.
- Loading, empty, missing-record, and failure feedback.

Component tests mock the service contract. Service tests exercise transition rules and localStorage persistence without contacting Supabase.

## Deployment

Vite uses the repository base path and React uses `HashRouter` for GitHub Pages compatibility. The existing Pages workflow builds and publishes `dist`. Supabase values remain optional build-time variables; without them, the deployed app uses localStorage.

The README documents local commands, the demo-only security posture, optional Supabase SQL setup, environment configuration, and GitHub Pages deployment. A `.env.example` contains variable names but no credentials.

## Completion Criteria

The demo is complete when the four requested resident features work across mobile and desktop, the full status lifecycle is visible and interactive, refresh preserves data, Supabase is optional, automated tests pass, and `npm run build` succeeds. No authentication or production security work is part of this scope.
