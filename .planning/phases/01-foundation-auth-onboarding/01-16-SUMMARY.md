---
phase: 01-foundation-auth-onboarding
plan: 16
subsystem: validation
tags: [zod, onboarding, forms, typescript]
dependency-graph:
  requires: [01-04]
  provides: [onboarding-validators]
  affects: [01-17, 01-18, 01-19, 01-20, 01-22]
tech-stack:
  added: []
  patterns: [zod-schema-validation, type-inference]
key-files:
  created: [src/lib/validators/onboarding.ts]
  modified: []
decisions:
  - key: spanish-validation-messages
    choice: All error messages in Spanish
    reason: Consistency with auth validators and target user base
metrics:
  duration: ~2min
  completed: 2026-02-04
---

# Phase 01 Plan 16: Onboarding Validators Summary

Zod schemas for multi-step onboarding wizard with inferred TypeScript types.

## What Was Built

Created `src/lib/validators/onboarding.ts` with four validation schemas:

### clinicSchema (Step 2)
- `name`: string, min 2 chars
- `taxId`: string, min 8 chars (Chilean RUT)
- `address`: string, min 5 chars
- `phone`: string, min 9 chars

### brandingSchema (Step 3)
- `logo`: nullable string (storage ID or null)
- `primaryColor`: hex color validated via regex `/^#[0-9A-Fa-f]{6}$/`
- `secondaryColor`: hex color validated via regex

### scheduleSchema (Step 4)
- `workDays`: array of numbers, min 1 item
- `openTime`: string matching `HH:MM` format
- `closeTime`: string matching `HH:MM` format
- `lunchStart`: optional string
- `lunchEnd`: optional string

### setupSchema (Step 5)
- `professionalName`: string, min 2 chars
- `serviceName`: string, min 2 chars
- `serviceDuration`: number, min 15 (minutes)

### Exported Types
- `ClinicInput`
- `BrandingInput`
- `ScheduleInput`
- `SetupInput`

## Technical Details

- Follows same pattern as `auth.ts` validators
- All error messages in Spanish for consistency
- Regex validation for hex colors and time formats
- Types inferred via `z.infer<typeof schema>` for DRY code

## Commits

| Hash | Message |
|------|---------|
| d6bb5db | feat(01-16): create onboarding validators |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Ready for:
- 01-17: Onboarding steps 1-2 (clinic data)
- 01-18: Onboarding step 3 (branding with file upload)
- 01-19: Onboarding step 4 (schedule configuration)
- 01-20: Onboarding step 5 (professional setup)

All validators are exported and ready for form integration with react-hook-form and zodResolver.
