# Complaint Register

A responsive, single-page complaint ledger for a Residents' Welfare Association. Residents can submit complaints and RWA administrators can search, filter, update, close, reopen, and delete register entries.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test -- --run
npm run build
```

Without configuration, the app seeds realistic demo records and persists changes in the current browser using localStorage.

## Optional shared Supabase mode

Run [`supabase/schema.sql`](supabase/schema.sql) in a Supabase project, copy `.env.example` to `.env`, and set:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

When both variables exist, all browsers use the same Supabase-backed register. The included public access is intentionally demo-only and must not be used for a production community system.

## GitHub Pages

The existing workflow builds and deploys `main`. Without Supabase variables, the published app automatically uses browser-local demo storage.
