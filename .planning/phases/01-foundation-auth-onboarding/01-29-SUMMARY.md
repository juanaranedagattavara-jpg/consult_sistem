---
phase: 01-foundation-auth-onboarding
plan: 29
subsystem: dashboard
tags: [convex, query, hook, dashboard, stats]
dependency-graph:
  requires:
    - 01-22 (onboarding complete mutation, user/clinic data pattern)
  provides:
    - getStats query for dashboard statistics
    - useCurrentClinic hook for clinic context
  affects:
    - 01-30 (header component needs clinic data)
    - 01-31 (nav component needs user/clinic)
    - 01-32 (stats card uses getStats)
    - 01-35 (dashboard page uses all)
tech-stack:
  added: []
  patterns:
    - Placeholder stats pattern (return 0s, implement in Phase 3)
    - Hook wrapper pattern for Convex queries
key-files:
  created:
    - convex/dashboard.ts
    - src/hooks/use-current-clinic.ts
  modified: []
decisions:
  - id: placeholder-stats
    choice: Return zeros for all stats in Phase 1
    reason: Real appointment data comes in Phase 3
metrics:
  duration: ~2min
  completed: 2026-02-04
---

# Phase 01 Plan 29: Dashboard Queries and useCurrentClinic Hook Summary

**One-liner:** Convex getStats query (placeholder 0s) and useCurrentClinic hook wrapping getCurrentUser

## What Was Built

### convex/dashboard.ts
- `getStats` query that returns dashboard statistics
- Auth-protected: requires user identity
- Looks up user by email index
- Returns placeholder stats object:
  - `appointmentsToday: 0`
  - `appointmentsWeek: 0`
  - `confirmationRate: 0`
  - `hoursRecovered: 0`

### src/hooks/use-current-clinic.ts
- `useCurrentClinic()` hook
- Wraps `api.users.getCurrentUser` query
- Returns: `{ clinic, isLoading, user }`
- Handles undefined state as loading

## Key Patterns

### Placeholder Stats Pattern
```typescript
// For Phase 1, return placeholder stats
// These will be calculated from real data in Phase 3
return {
  appointmentsToday: 0,
  appointmentsWeek: 0,
  confirmationRate: 0,
  hoursRecovered: 0,
};
```

### Hook Wrapper Pattern
```typescript
export function useCurrentClinic() {
  const user = useQuery(api.users.getCurrentUser);
  return {
    clinic: user?.clinic || null,
    isLoading: user === undefined,
    user: user || null,
  };
}
```

## Files Created

| File | Purpose |
|------|---------|
| `convex/dashboard.ts` | Dashboard statistics query |
| `src/hooks/use-current-clinic.ts` | Clinic context hook |

## Verification

- [x] getStats returns object with stats (Convex deployed successfully)
- [x] useCurrentClinic returns clinic data

## Commits

| Hash | Message |
|------|---------|
| 6eb38bd | feat(01-29): create dashboard queries and useCurrentClinic hook |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Ready for Wave 15 dashboard components:
- 01-30: Header component can use useCurrentClinic for clinic name/logo
- 01-31: Nav component can use useCurrentClinic for user info
- 01-32: Stats card can use getStats for dashboard metrics
