# Modern Civic UI Design

## Goal

Modernize the existing Complaint Register without changing complaint creation, persistence, filtering, inline editing, closing, reopening, deletion, or deployment behavior.

## Direction

Use a contemporary civic dashboard rather than a document-like ledger. Preserve the trustworthy navy and blue identity, but make the interface lighter, friendlier, and easier to scan.

## Visual System

- Use a soft cool-gray page background with subtle ambient blue accents.
- Render the header as a rounded navy application banner with a simplified RWA mark and clear product title.
- Use white surfaces with 16px corner radii, light borders, soft layered shadows, and more breathing room.
- Replace rigid ledger styling with modern responsive complaint cards that retain the same information and inline controls.
- Use a clean system sans-serif throughout, with stronger size and weight hierarchy instead of serif document typography.
- Render status values as compact rounded badges with accessible semantic colors.
- Use 10-12px rounded inputs with clear focus rings, comfortable height, and refined placeholder color.
- Style primary actions as filled blue rounded buttons with hover lift; secondary actions use subtle tinted surfaces; destructive actions use a clear red treatment.
- Keep summary metrics compact, airy, and visually distinct with small accent icons or marks.
- Use restrained hover elevation and 160-200ms transitions while respecting reduced-motion preferences.

## Responsive Behavior

- Keep the desktop form structured in a multi-column grid.
- Collapse controls cleanly on tablets and phones without horizontal scrolling.
- Make primary actions full-width on small screens.
- Preserve readable spacing and at least 44px touch targets.

## Boundaries

- Do not add navigation, authentication, new complaint fields, new workflows, charts, or marketing content.
- Do not change service interfaces or stored complaint data.
- Do not use glassmorphism, neon colors, excessive gradients, or decorative clutter.

## Verification

- Existing automated tests must remain green.
- The production build must succeed.
- The rendered page must be checked at desktop and mobile sizes for overflow, hierarchy, control states, and the complaint lifecycle controls.
