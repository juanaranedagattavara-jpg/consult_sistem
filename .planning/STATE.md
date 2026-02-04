# Project State

## Current Status
- **Milestone:** v1.0
- **Phase:** 01 - Foundation + Auth + Onboarding
- **Plan:** 13 of 36 complete
- **Status:** In progress
- **Last activity:** 2026-02-04 - Completed 01-13-PLAN.md

## Progress
| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 01    | In progress | 13/36 | 36% |
| 02    | ○      | 0/?   | 0% |
| 03    | ○      | 0/?   | 0% |
| 04    | ○      | 0/?   | 0% |

## Phase 01 Plans (Atomic - 1 task = 1 plan)

### Wave 1 - Project Init
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-01 | Initialize Next.js 15 | - | DONE |

### Wave 2 - Convex Setup
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-02 | Install and configure Convex | 01-01 | DONE |

### Wave 3 - Schema & UI Foundation
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-03 | Create Convex schema | 01-02 | DONE |
| 01-04 | Setup shadcn/ui | 01-01 | DONE |

### Wave 4 - Auth & Providers
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-05 | Configure Convex Auth | 01-03 | DONE |
| 01-06 | Create root layout with providers | 01-04, 01-05 | DONE |

### Wave 5 - Validators & Mutations Base
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-07 | Create auth validators (Zod) | 01-04 | DONE |
| 01-08 | Create file mutations | 01-03 | DONE |
| 01-09 | Create settings mutations | 01-03 | DONE |

### Wave 6 - Auth Mutations
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-10 | Create auth mutations | 01-05, 01-03 | DONE |

### Wave 7 - Components Base
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-11 | Create FileUpload component | 01-06, 01-08 | DONE |
| 01-12 | Create useFileUrl hook | 01-08 | DONE |
| 01-13 | Create auth forms | 01-07, 01-10 | DONE |

### Wave 8 - Auth Pages
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-14 | Create auth pages | 01-13, 01-06 | ○ |

### Wave 9 - Onboarding Foundation
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-15 | Create onboarding Zustand store | 01-04 | ○ |
| 01-16 | Create onboarding validators | 01-04 | ○ |

### Wave 10 - Onboarding Steps
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-17 | Create onboarding steps 1-2 | 01-15, 01-16 | ○ |
| 01-18 | Create onboarding step 3 (branding) | 01-15, 01-16, 01-11 | ○ |
| 01-19 | Create onboarding step 4 (schedule) | 01-15, 01-16 | ○ |
| 01-20 | Create onboarding step 5 (setup) | 01-15, 01-16 | ○ |
| 01-21 | Create progress bar component | 01-04 | ○ |

### Wave 11 - Onboarding Page
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-22 | Create onboarding page + mutation | 01-17, 01-18, 01-19, 01-20, 01-21, 01-09 | ○ |

### Wave 12 - Settings Forms
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-23 | Create clinic settings form | 01-09, 01-06 | ○ |
| 01-24 | Create bot config form | 01-09, 01-06 | ○ |
| 01-25 | Create timing settings form | 01-09, 01-06 | ○ |
| 01-26 | Create appearance form | 01-09, 01-11 | ○ |
| 01-27 | Create profile form | 01-09, 01-06 | ○ |

### Wave 13 - Settings Pages
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-28 | Create settings pages | 01-23, 01-24, 01-25, 01-26, 01-27 | ○ |

### Wave 14 - Dashboard Queries
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-29 | Create dashboard queries + useCurrentClinic | 01-03, 01-10 | ○ |

### Wave 15 - Dashboard Components
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-30 | Create header component | 01-29, 01-12 | ○ |
| 01-31 | Create nav component | 01-29 | ○ |
| 01-32 | Create stats card component | 01-29 | ○ |
| 01-33 | Create upcoming appointments | 01-29 | ○ |

### Wave 16 - Dashboard Pages
| Plan | Name | Depends On | Status |
|------|------|------------|--------|
| 01-34 | Create dashboard layout | 01-30, 01-31 | ○ |
| 01-35 | Create dashboard page | 01-32, 01-33, 01-34 | ○ |
| 01-36 | Create placeholder pages | 01-34 | ○ |

## Execution Summary
- **Total Plans:** 36
- **Total Waves:** 16
- **Max Parallelism:** Wave 10 (5 plans), Wave 12 (5 plans), Wave 15 (4 plans)
- **Estimated Execution:** Sequential waves, parallel within waves

## Decisions Made

### Architecture
- Single-tenant VPS per clinic
- Convex as backend (serverless + real-time)
- n8n for WhatsApp bot (existing workflow)

### UX/UI
- Desktop: horizontal navigation (no sidebar)
- Mobile: hamburger menu
- Form-based appointment creation (no calendar click)
- Color-coded appointment states

### Bot
- Multi-agent architecture (Main + Calendar + CRM subagents)
- Configurable tone per clinic
- Buffer de mensajes con Redis
- Fallback to email if WhatsApp fails

### Waitlist
- Multi-factor priority scoring (urgency, history, wait time, FIFO)
- Configurable weights per clinic
- Sequential or broadcast notification method
- Configurable timeouts

### Google Calendar
- Professional owns their calendar
- Bidirectional sync
- If API fails: schedule anyway, sync later

### Schema Design (01-03)
- Nested objects for complex configs (botConfig, timing, waitlistConfig)
- Typed unions for enum fields (role, notificationMethod, onReject)
- Storage references for file uploads (logo, avatar)

### UI Foundation (01-04)
- shadcn/ui with new-york style
- CSS variables for theming (dark mode ready)
- cn() utility for className merging

### Root Layout (01-06)
- Provider hierarchy: ConvexClientProvider -> ThemeProvider -> children
- ConvexAuthProvider wraps entire app for auth state
- ThemeProvider with system preference detection
- Toaster (sonner) for toast notifications

### File Storage (01-08)
- Used v.id("_storage") for type-safe storage IDs
- Storage operations: mutations for write, queries for read

### Settings Mutations (01-09)
- Partial update pattern: each mutation updates specific config section
- Schema alignment: validators match schema exactly (botConfig.tone is string, not union)
- Auto-timestamps: all mutations update updatedAt field

### Auth Mutations (01-10)
- Auto-create clinic draft on registration for seamless onboarding
- Identity-based user lookup via ctx.auth.getUserIdentity()
- Return user with embedded clinic object for single-query access

### FileUpload Component (01-11)
- useId() hook for unique input IDs (multiple instances support)
- Theme-aware colors (muted-foreground, destructive) for dark mode
- Blob URL preview with loading overlay

### Auth Forms (01-13)
- react-hook-form with zodResolver for type-safe validation
- Two-step register flow: create user/clinic then auto-sign-in
- Login redirects to /dashboard, register redirects to /onboarding

## Blockers
None

## Session Continuity
- **Last session:** 2026-02-04T07:08Z
- **Stopped at:** Completed 01-13-PLAN.md
- **Resume file:** None

## Notes
- Existing n8n workflow: "WhatsApp COMPLETO - Agenda Citas + Derivaciones.json"
- Migration needed: Airtable -> Convex HTTP API
- Atomization complete: 1 task = 1 plan for maximum granularity
