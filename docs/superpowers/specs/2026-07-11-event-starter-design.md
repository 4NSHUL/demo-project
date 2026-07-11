# Event Starter Design

## Goal

Provide a verified blank React starter that can be adapted to an event prompt in minutes.

## Chosen approach

Use a Vite React application with Tailwind CSS and no application features, services, credentials, or deployment-specific product logic. A small `SPRINT.md` is the only event guidance artifact.

## Scope

- React + Vite starter that starts locally and produces a production build.
- Tailwind CSS configured and imported.
- A minimal blank page identifying the starter.
- Local Git repository with a first commit.
- GitHub remote, push, and GitHub Pages deployment, created through the user's signed-in Chrome session.

## Explicit exclusions

Authentication, backend APIs, databases, Docker, analytics, payments, and live AI calls are excluded. The event team can add the smallest required surface once the prompt is known.

## Verification

`npm run build` must exit successfully. The deployed Pages URL must render the starter after GitHub publishes it.
