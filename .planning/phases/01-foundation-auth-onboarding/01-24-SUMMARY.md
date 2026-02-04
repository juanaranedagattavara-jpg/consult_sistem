---
phase: 01
plan: 24
subsystem: settings
tags: [bot, whatsapp, configuration, react-hook-form, useFieldArray]
depends_on:
  requires: [01-09]
  provides: [bot-config-form]
  affects: [01-28]
tech-stack:
  added: []
  patterns: [useFieldArray-dynamic-lists, tone-selector-buttons]
key-files:
  created:
    - src/components/settings/bot-config-form.tsx
    - src/components/ui/textarea.tsx
  modified: []
decisions: []
metrics:
  duration: ~3min
  completed: 2026-02-04
---

# Phase 01 Plan 24: Bot Config Form Summary

Bot configuration form with tone selector, message textareas, custom prompts, and dynamic FAQ management using useFieldArray.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create bot config form | d1299bf | bot-config-form.tsx, textarea.tsx |

## Implementation Details

### Bot Config Form Component

Created `src/components/settings/bot-config-form.tsx` with:

1. **Tone Selector** - Three button options (formal/casual/amigable) with theme-aware styling using `bg-primary text-primary-foreground` for selected and `bg-background hover:bg-muted` for unselected

2. **Message Textareas** - welcomeMessage and afterHoursMessage with placeholder examples and helper text

3. **Custom Prompts** - Single textarea that converts to array on save (split by newlines, filter empty)

4. **Dynamic FAQs** - useFieldArray for add/remove functionality with empty state UI and numbered FAQ cards

### Key Patterns

- **useEffect for form reset** - Matches existing settings forms pattern (ProfileForm)
- **Theme-aware colors** - Uses semantic tokens (muted-foreground, destructive, primary-foreground)
- **Array conversion** - customPrompts stored as string in form, converted to string[] for API
- **Loading state** - Card with centered "Cargando..." text while user data loads

### API Integration

Uses `api.clinics.updateClinicBot` mutation with:
- `tone: string` (formal/casual/amigable)
- `customPrompts: string[] | undefined`
- `faqs: { question: string; answer: string }[] | undefined`
- `welcomeMessage: string`
- `afterHoursMessage: string`

## Verification

- [x] Tone selection works (form.setValue + form.watch)
- [x] FAQ list is dynamic (useFieldArray append/remove)
- [x] Submit updates database (updateClinicBot mutation)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

- Bot config form ready for settings page (01-28)
- Works with existing getCurrentUser query that includes clinic data
