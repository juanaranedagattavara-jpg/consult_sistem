---
phase: 01-foundation-auth-onboarding
plan: 09
subsystem: backend
tags: [convex, mutations, settings, clinic]
dependency-graph:
  requires: [01-03]
  provides: [clinic-mutations, settings-api]
  affects: [01-22, 01-23, 01-24, 01-25, 01-26, 01-27]
tech-stack:
  added: []
  patterns: [convex-mutations, partial-updates]
key-files:
  created:
    - convex/clinics.ts
  modified:
    - convex/_generated/api.d.ts
decisions: []
metrics:
  duration: 45s
  completed: 2026-02-04
---

# Phase 01 Plan 09: Create Settings Mutations Summary

Convex mutations for clinic settings CRUD operations with schema-aligned validators.

## What Was Built

### convex/clinics.ts

Created comprehensive settings mutations for clinic management:

**Queries:**
- `getClinic` - Fetch clinic by ID

**Mutations:**
- `updateClinicGeneral` - Update basic info (name, taxId, address, phone, email)
- `updateClinicBot` - Update bot configuration (tone, prompts, FAQs, messages)
- `updateClinicTiming` - Update timing settings (confirmation, reminder, retries, waitlist timeout)
- `updateClinicAppearance` - Update branding (logo storage ref, primary/secondary colors)
- `createClinicDraft` - Create new clinic with sensible defaults

### Key Implementation Details

1. **Schema Alignment**: All validators match the schema exactly (e.g., `botConfig.customPrompts` is `v.optional(v.array(v.string()))` not a single string)

2. **Partial Updates**: Each update mutation targets a specific config section, enabling granular settings changes

3. **Automatic Timestamps**: All mutations update `updatedAt` field automatically

4. **Default Values in createClinicDraft**:
   - Timezone: America/Santiago
   - Work days: Monday-Friday (1-5)
   - Slot duration: 30 minutes
   - Bot tone: "amigable"
   - Waitlist method: "sequential"

## Commits

| Hash | Message |
|------|---------|
| 5a6203b | feat(01-09): create settings mutations |

## Files Changed

```
convex/clinics.ts (new)       - 117 lines - All clinic mutations
convex/_generated/api.d.ts    - Updated with new exports
```

## Deviations from Plan

**[Rule 1 - Schema Alignment]** Adjusted botConfig and waitlistConfig validators to match actual schema:
- `botConfig.tone`: Changed from literal union to `v.string()` (schema uses string)
- `botConfig.customPrompts`: Changed from single string to `v.optional(v.array(v.string()))`
- `botConfig.faqs`: Wrapped in `v.optional()`
- `waitlistConfig.priorityWeights.history`: Used correct field name from schema (not "patientHistory")
- `waitlistConfig.onReject`: Used "next" as default (not "keep" which isn't in schema)

These changes ensure mutations work correctly with the schema defined in 01-03.

## Verification

- [x] convex/clinics.ts exists
- [x] All update mutations exported (updateClinicGeneral, updateClinicBot, updateClinicTiming, updateClinicAppearance)
- [x] createClinicDraft exported
- [x] `npx convex dev --once` deployed successfully

## Next Phase Readiness

Ready for:
- 01-22: Onboarding page (uses createClinicDraft)
- 01-23-27: Settings forms (use update mutations)

No blockers identified.
