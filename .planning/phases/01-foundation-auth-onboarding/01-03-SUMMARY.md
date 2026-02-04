---
phase: 01-foundation-auth-onboarding
plan: 03
subsystem: database
tags: [convex, schema, database, clinics, users]
dependency_graph:
  requires: ["01-02"]
  provides: ["convex-schema", "clinics-table", "users-table"]
  affects: ["01-05", "01-08", "01-09", "01-10", "01-29"]
tech_stack:
  added: []
  patterns: ["convex-schema-definition", "typed-validators"]
key_files:
  created:
    - convex/schema.ts
  modified:
    - convex/_generated/dataModel.d.ts
decisions:
  - id: schema-structure
    choice: "Nested objects for complex configs (botConfig, timing, waitlist)"
    rationale: "Groups related fields logically, easier to manage in mutations"
metrics:
  duration: 101s
  completed: 2026-02-04
---

# Phase 01 Plan 03: Create Convex Schema Summary

Convex schema with clinics and users tables, deployed to handsome-trout-426.convex.cloud

## What Was Built

### Clinics Table

Complete clinic configuration table with:

| Field Group | Fields |
|-------------|--------|
| Basic Info | name, slug, taxId, address, phone, email, timezone |
| Branding | logo (storage ref), colors (primary/secondary) |
| Schedule | hours (open/close/lunch), workDays, defaultSlotDuration |
| Bot Config | tone, customPrompts, faqs, welcomeMessage, afterHoursMessage |
| Timing | confirmationHours, reminderHours, retries, waitlistTimeout |
| Waitlist | priorityWeights, notificationMethod, broadcastLimit, timeouts, onReject |
| Custom Fields | customPatientFields array for intake forms |
| Status | onboardingCompleted, active, createdAt, updatedAt |

**Indexes:** `by_slug`, `by_email`

### Users Table

Multi-tenant user table with:

| Field | Type |
|-------|------|
| email | string |
| passwordHash | string |
| name | string |
| role | "admin" or "staff" |
| clinicId | reference to clinics |
| avatar | optional storage ref |
| active | boolean |
| lastLogin | optional timestamp |
| createdAt | timestamp |

**Indexes:** `by_email`, `by_clinic`

## Commits

| Hash | Type | Description |
|------|------|-------------|
| e7ea186 | feat | Create Convex schema with clinics and users tables |

## Verification Results

- [x] convex/schema.ts exists
- [x] Schema has clinics table with all fields
- [x] Schema has users table with all fields
- [x] Indexes created (by_slug, by_email for clinics; by_email, by_clinic for users)
- [x] Schema deployed to Convex (handsome-trout-426.convex.cloud)

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### Schema Design Decisions

1. **Typed Unions for Enums**: Used `v.union(v.literal(...))` for role and config options to enforce valid values at runtime
2. **Storage References**: Used `v.id("_storage")` for logo and avatar to properly reference Convex file storage
3. **Nested Objects**: Grouped related config into objects (botConfig, timing, waitlistConfig) for cleaner mutations
4. **Optional Fields**: Properly typed optional fields like lunch hours, FAQs, and customPrompts

### Index Strategy

- `by_slug`: Fast clinic lookup by URL slug
- `by_email`: Fast lookup for both clinics and users during auth
- `by_clinic`: Query all users belonging to a clinic

## Next Phase Readiness

**Unblocked Plans:**
- 01-05: Configure Convex Auth (needs schema)
- 01-08: Create file mutations (needs storage refs from schema)
- 01-09: Create settings mutations (needs schema)

**No blockers identified.**
