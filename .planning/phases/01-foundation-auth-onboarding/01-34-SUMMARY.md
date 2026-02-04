---
phase: 01-foundation-auth-onboarding
plan: 34
subsystem: ui
tags: [next.js, layout, auth-guard, white-label, responsive]

# Dependency graph
requires:
  - phase: 01-30
    provides: Header component with menu toggle
  - phase: 01-31
    provides: Nav component with isOpen/onClose props
provides:
  - Dashboard layout shell with auth protection
  - White label color application via CSS variables
  - Responsive layout container for dashboard pages
affects: [01-35, 01-36, all dashboard pages]

# Tech tracking
tech-stack:
  added: []
  patterns: [auth-guard layout, white-label CSS variables, hexToHsl conversion]

key-files:
  created: [src/app/(dashboard)/layout.tsx]
  modified: []

key-decisions:
  - "Separate useEffect hooks for auth check and onboarding check for clarity"
  - "hexToHsl helper for CSS variable compatibility with shadcn/ui"
  - "Dark mode support with bg-gray-50 dark:bg-background"

patterns-established:
  - "Auth guard pattern: check user === null for unauthenticated, user === undefined for loading"
  - "White label pattern: apply colors from clinic settings to CSS variables"

# Metrics
duration: 4min
completed: 2026-02-04
---

# Phase 01 Plan 34: Dashboard Layout Summary

**Dashboard layout shell with auth/onboarding guards, white label color application, and responsive Header/Nav integration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-04T13:16:12Z
- **Completed:** 2026-02-04T13:20:00Z
- **Tasks:** 1
- **Files created:** 1

## Accomplishments
- Auth check redirects to /login if not authenticated
- Onboarding check redirects to /onboarding if not completed
- White label colors applied from clinic.colors to CSS variables
- Header component integrated with menu toggle callback
- Nav component integrated with isOpen/onClose state
- Loading spinner shown while auth state resolves
- Responsive layout with min-h-screen bg-gray-50

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dashboard layout** - `d4132a1` (feat)

## Files Created/Modified
- `src/app/(dashboard)/layout.tsx` - Dashboard layout with auth protection, white label colors, Header, Nav, and responsive container (148 lines)

## Decisions Made
- **Separate useEffect hooks:** Auth check and onboarding check in separate effects for clarity and proper dependency tracking
- **hexToHsl conversion:** Added helper function to convert hex colors to HSL format for shadcn/ui CSS variable compatibility
- **Dark mode support:** Used dark:bg-background alongside bg-gray-50 for dark mode support
- **Loading state text:** Added "Cargando..." text below spinner for better UX

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation following existing patterns from Header (01-30) and Nav (01-31) components.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Dashboard layout ready for dashboard page (01-35)
- Layout also ready for placeholder pages (01-36)
- All dashboard routes will inherit auth protection automatically

---
*Phase: 01-foundation-auth-onboarding*
*Completed: 2026-02-04*
