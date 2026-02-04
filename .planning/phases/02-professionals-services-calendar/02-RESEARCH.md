# Phase 02: Professionals + Services + Google Calendar - Research

**Researched:** 2026-02-04
**Domain:** Team management with Google Calendar integration (centralized OAuth model)
**Confidence:** HIGH

## Summary

This phase implements CRUD for professionals and services, with Google Calendar integration using a centralized OAuth model. The key architectural decision is that n8n owns the OAuth connection to an admin Google account, and professionals share their calendars with that admin account. The system only stores calendar IDs, not OAuth tokens.

Research confirms this approach is viable using Google Calendar's `calendarList.list` endpoint to discover shared calendars and `events.list` to check availability. The availability algorithm must consider: professional schedules, Google Calendar events, exceptions (vacations), and service duration.

**Primary recommendation:** Use Convex HTTP actions with Hono for the n8n API, implement availability calculation as a Convex action that fetches Google Calendar events in real-time, and use shadcn community components for multi-select and time pickers.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Convex | 1.31.7 | Backend, schema, actions | Already in use |
| shadcn/ui | Latest | UI components | Already in use |
| React Hook Form | 7.71.1 | Form management | Already in use |
| Zod | 4.3.6 | Validation | Already in use |

### New Dependencies Required
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| hono | ^4.x | HTTP API routing | n8n API endpoints with better routing |
| convex-helpers | ^0.1.x | Hono integration for Convex | Required for HonoWithConvex |
| @dnd-kit/core | ^6.x | Drag and drop | Service category ordering |
| @dnd-kit/sortable | ^8.x | Sortable lists | Service ordering within categories |
| cmdk | ^1.x | Command menu | Multi-select combobox (if not installed) |

### shadcn/ui Components Needed
| Component | Purpose | Installation |
|-----------|---------|--------------|
| select | Dropdowns | `npx shadcn@latest add select` |
| popover | Multi-select, color picker | `npx shadcn@latest add popover` |
| command | Searchable multi-select | `npx shadcn@latest add command` |
| badge | Selected items display | `npx shadcn@latest add badge` |
| separator | UI dividers | `npx shadcn@latest add separator` |
| switch | Toggle active/inactive | `npx shadcn@latest add switch` |
| checkbox | Multi-select rows | `npx shadcn@latest add checkbox` |
| table | Data tables | `npx shadcn@latest add table` |
| dialog | Modals | `npx shadcn@latest add dialog` |
| accordion | Grouped services view | `npx shadcn@latest add accordion` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit | react-beautiful-dnd | react-beautiful-dnd is deprecated, @dnd-kit is modern and maintained |
| Hono | Raw HTTP actions | Hono provides better middleware, validation, CORS handling |
| Custom multi-select | react-select | Keep shadcn ecosystem consistency |

**Installation:**
```bash
npm install hono convex-helpers @dnd-kit/core @dnd-kit/sortable
npx shadcn@latest add select popover command badge separator switch checkbox table dialog accordion
```

## Architecture Patterns

### Recommended Project Structure
```
convex/
  schema.ts           # Add professionals, services, categories, exceptions tables
  professionals.ts    # CRUD mutations and queries
  services.ts         # CRUD mutations and queries
  serviceCategories.ts # CRUD mutations and queries
  availability.ts     # Availability calculation action
  calendar.ts         # Google Calendar API calls (action)
  http.ts             # n8n API endpoints with Hono
  lib/
    validators.ts     # Shared validators for reuse
    googleCalendar.ts # Google Calendar API helpers
    availability.ts   # Availability algorithm helpers

src/
  app/
    (dashboard)/
      profesionales/
        page.tsx            # List with table/cards toggle
        [id]/page.tsx       # Edit professional
        new/page.tsx        # Create professional
      servicios/
        page.tsx            # List grouped by category
        [id]/page.tsx       # Edit service
        new/page.tsx        # Create service
  components/
    professionals/
      professional-form.tsx
      professional-table.tsx
      professional-cards.tsx
      calendar-selector.tsx   # Google Calendar autodetection
      schedule-editor.tsx     # Override clinic hours
    services/
      service-form.tsx
      service-table.tsx
      category-accordion.tsx
      sortable-service-list.tsx
    ui/
      multi-select.tsx        # Copy from shadcn-multi-select-component
      time-picker.tsx         # Copy from OpenStatus time-picker
      color-picker.tsx        # Simple preset color selector
```

### Pattern 1: Convex Schema with Reusable Validators
**What:** Export field validators from schema for reuse in functions
**When to use:** Always, for DRY validation

```typescript
// convex/lib/validators.ts
import { v } from "convex/values";

export const scheduleValidator = v.object({
  monday: v.optional(v.object({
    enabled: v.boolean(),
    start: v.string(), // "09:00"
    end: v.string(),   // "18:00"
    lunch: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  })),
  tuesday: v.optional(v.object({ /* same */ })),
  // ... repeat for all days
});

export const professionalFields = {
  clinicId: v.id("clinics"),
  userId: v.optional(v.id("users")),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  specialty: v.string(),
  calendarId: v.optional(v.string()),
  color: v.string(),
  serviceIds: v.array(v.id("services")),
  schedule: v.optional(scheduleValidator),
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
};
```

### Pattern 2: HTTP API with Hono for n8n
**What:** Use Hono router for structured HTTP endpoints
**When to use:** Building the n8n API

```typescript
// convex/http.ts
import { Hono } from "hono";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { cors } from "hono/cors";
import { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";

const app: HonoWithConvex<ActionCtx> = new Hono();

// CORS for all API routes
app.use("/api/*", cors());

// API Key middleware
app.use("/api/*", async (c, next) => {
  const apiKey = c.req.header("X-API-Key");
  if (!apiKey) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "API Key required" } }, 401);
  }
  // Validate API key against clinic
  const clinic = await c.env.runQuery(internal.clinics.getByApiKey, { apiKey });
  if (!clinic) {
    return c.json({ success: false, error: { code: "INVALID_API_KEY", message: "Invalid API Key" } }, 401);
  }
  c.set("clinic", clinic);
  await next();
});

// Professionals endpoint
app.get("/api/professionals", async (c) => {
  const clinic = c.get("clinic");
  const professionals = await c.env.runQuery(internal.professionals.listByClinic, {
    clinicId: clinic._id
  });
  return c.json({ success: true, data: professionals, error: null });
});

// Availability endpoint
app.get("/api/availability", async (c) => {
  const clinic = c.get("clinic");
  const { professionalId, date, serviceId } = c.req.query();

  const slots = await c.env.runAction(internal.availability.getSlots, {
    clinicId: clinic._id,
    professionalId,
    date,
    serviceId,
  });

  return c.json({ success: true, data: slots, error: null });
});

export default new HttpRouterWithHono(app);
```

### Pattern 3: Google Calendar Integration via Actions
**What:** Use Convex actions to call Google Calendar API
**When to use:** Listing shared calendars, validating access, checking events

```typescript
// convex/calendar.ts
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";

// Note: This calls n8n webhook which has the OAuth token
export const listSharedCalendars = internalAction({
  args: { clinicId: v.id("clinics") },
  handler: async (ctx, args) => {
    // Get clinic's n8n webhook URL
    const clinic = await ctx.runQuery(internal.clinics.get, { clinicId: args.clinicId });

    // Call n8n webhook to list calendars (n8n has OAuth)
    const response = await fetch(`${clinic.n8nWebhookUrl}/list-calendars`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const calendars = await response.json();
    return calendars;
  },
});

export const getCalendarEvents = internalAction({
  args: {
    calendarId: v.string(),
    timeMin: v.string(), // ISO datetime
    timeMax: v.string(), // ISO datetime
    clinicId: v.id("clinics"),
  },
  handler: async (ctx, args) => {
    const clinic = await ctx.runQuery(internal.clinics.get, { clinicId: args.clinicId });

    const response = await fetch(`${clinic.n8nWebhookUrl}/calendar-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calendarId: args.calendarId,
        timeMin: args.timeMin,
        timeMax: args.timeMax,
      }),
    });

    return await response.json();
  },
});
```

### Pattern 4: Availability Algorithm
**What:** Calculate available time slots considering all constraints
**When to use:** When user requests availability for a date/professional/service

```typescript
// convex/lib/availability.ts
interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "09:30"
}

interface CalendarEvent {
  start: { dateTime: string };
  end: { dateTime: string };
}

export function calculateAvailableSlots(
  date: string, // YYYY-MM-DD
  serviceDuration: number, // minutes
  professionalSchedule: DaySchedule | null,
  clinicSchedule: ClinicSchedule,
  exceptions: Exception[],
  calendarEvents: CalendarEvent[],
  existingAppointments: Appointment[],
  intervalMinutes: number = 30 // slot interval
): TimeSlot[] {
  // 1. Check if date falls on an exception (vacation, holiday)
  const exception = exceptions.find(e =>
    date >= e.startDate && date <= e.endDate
  );
  if (exception) return [];

  // 2. Get working hours (professional override or clinic default)
  const dayOfWeek = new Date(date).getDay(); // 0-6
  const schedule = professionalSchedule?.[dayName(dayOfWeek)] ?? clinicSchedule;
  if (!schedule?.enabled) return [];

  // 3. Generate all possible slots based on interval
  const allSlots = generateSlots(schedule.start, schedule.end, intervalMinutes);

  // 4. Remove lunch break slots
  const slotsWithoutLunch = schedule.lunch
    ? allSlots.filter(s => !overlaps(s, schedule.lunch))
    : allSlots;

  // 5. Remove slots that overlap with calendar events
  const slotsWithoutCalendar = slotsWithoutLunch.filter(slot =>
    !calendarEvents.some(event => slotsOverlap(slot, serviceDuration, event, date))
  );

  // 6. Remove slots that overlap with existing appointments
  const availableSlots = slotsWithoutCalendar.filter(slot =>
    !existingAppointments.some(apt => slotsOverlap(slot, serviceDuration, apt, date))
  );

  // 7. Filter slots where service duration fits before end of day
  return availableSlots.filter(slot => {
    const slotEnd = addMinutes(slot.start, serviceDuration);
    return slotEnd <= schedule.end;
  });
}
```

### Anti-Patterns to Avoid
- **Storing OAuth tokens in Convex:** n8n owns the OAuth, we only store calendar IDs
- **Calling Google Calendar API directly from frontend:** Always go through Convex actions
- **Multiple runQuery/runMutation calls in sequence:** Batch into single internal functions
- **Not validating calendarId before saving:** Always verify access first

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-select with search | Custom select with state | shadcn-multi-select-component | Handles keyboard nav, badges, search, accessibility |
| Time input | Text input with regex | OpenStatus TimePicker | Handles validation, keyboard increment, AM/PM |
| Drag and drop sorting | Custom mouse events | @dnd-kit/sortable | Touch support, keyboard accessibility, animations |
| HTTP API routing | Raw httpAction switch | Hono + convex-helpers | Middleware, CORS, validation, cleaner code |
| Color picker | Full spectrum picker | Preset color selector | Simpler UX, consistent with design system |
| Date manipulation | Manual string parsing | date-fns | Timezone handling, formatting, comparison |

**Key insight:** UI interactions that seem simple (drag to reorder, pick a time, select multiple items) have complex accessibility and edge case requirements that community components handle correctly.

## Common Pitfalls

### Pitfall 1: Race Conditions in Slot Booking
**What goes wrong:** Two users book the same slot simultaneously
**Why it happens:** Availability checked, but slot taken between check and book
**How to avoid:** Use Convex mutations with optimistic check - query existing appointments within the mutation transaction
**Warning signs:** Duplicate appointments for same time slot

### Pitfall 2: Timezone Mismatches
**What goes wrong:** Slots appear at wrong times
**Why it happens:** Mixing local time, UTC, and Google Calendar timezones
**How to avoid:**
- Store all times in clinic's timezone
- Convert to UTC only when calling Google Calendar API
- Use date-fns-tz for conversions
**Warning signs:** Slots off by N hours

### Pitfall 3: Google Calendar API Rate Limits
**What goes wrong:** API calls fail with 429 errors
**Why it happens:** Too many calendar queries in short time
**How to avoid:**
- Cache calendar events for short period (1-5 minutes)
- Batch availability queries when possible
- Implement exponential backoff
**Warning signs:** Intermittent availability check failures

### Pitfall 4: Orphaned Service Assignments
**What goes wrong:** Professional references deleted service
**Why it happens:** Service deleted without updating professionals
**How to avoid:**
- On service deletion, remove from all professionals' serviceIds
- Or: soft-delete services (mark inactive) instead of hard delete
**Warning signs:** UI errors when loading professional details

### Pitfall 5: Schedule Override Complexity
**What goes wrong:** Confusing UX for schedule inheritance
**Why it happens:** Unclear whether professional uses clinic default or custom schedule
**How to avoid:**
- Clear visual indicator: "Using clinic schedule" vs "Custom schedule"
- Simple toggle to enable override per day
- Show inherited values as placeholders
**Warning signs:** Users confused about when override applies

## Code Examples

Verified patterns from official sources:

### Multi-Select Component Usage
```typescript
// Source: https://github.com/sersavan/shadcn-multi-select-component
import { MultiSelect } from "@/components/ui/multi-select";

const services = [
  { value: "svc_123", label: "Limpieza dental" },
  { value: "svc_456", label: "Blanqueamiento" },
];

<MultiSelect
  options={services}
  onValueChange={(values) => form.setValue("serviceIds", values)}
  defaultValue={form.watch("serviceIds")}
  placeholder="Seleccionar servicios..."
  variant="inverted"
  maxCount={3}
/>
```

### OpenStatus Time Picker
```typescript
// Source: https://time.openstatus.dev/
import { TimePicker } from "@/components/ui/time-picker";

const [date, setDate] = useState<Date | undefined>(new Date());

<TimePicker
  date={date}
  setDate={setDate}
  granularity="minute" // hour | minute | second
/>
```

### dnd-kit Sortable List
```typescript
// Source: https://docs.dndkit.com/presets/sortable
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function SortableServices({ services, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = services.findIndex(s => s._id === active.id);
      const newIndex = services.findIndex(s => s._id === over.id);
      onReorder(arrayMove(services, oldIndex, newIndex));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={services.map(s => s._id)} strategy={verticalListSortingStrategy}>
        {services.map(service => (
          <SortableServiceItem key={service._id} service={service} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Convex HTTP Action with Hono
```typescript
// Source: https://stack.convex.dev/hono-with-convex
import { Hono } from "hono";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app: HonoWithConvex<ActionCtx> = new Hono();

app.use("/api/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PATCH", "DELETE"],
  allowHeaders: ["Content-Type", "X-API-Key"],
}));

const appointmentSchema = z.object({
  professionalId: z.string(),
  serviceId: z.string(),
  patientName: z.string(),
  patientPhone: z.string(),
  date: z.string(),
  time: z.string(),
});

app.post("/api/appointments", zValidator("json", appointmentSchema), async (c) => {
  const data = c.req.valid("json");
  const clinic = c.get("clinic");

  const result = await c.env.runMutation(internal.appointments.create, {
    clinicId: clinic._id,
    ...data,
  });

  return c.json({ success: true, data: result, error: null });
});

export default new HttpRouterWithHono(app);
```

### Google Calendar API - List Calendars
```typescript
// Google Calendar API calendarList.list
// Source: https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list

// Required scopes:
// - https://www.googleapis.com/auth/calendar.readonly
// - https://www.googleapis.com/auth/calendar

// Request:
GET https://www.googleapis.com/calendar/v3/users/me/calendarList
  ?minAccessRole=writer  // Only calendars we can write to
  &showHidden=false

// Response includes shared calendars:
{
  "items": [
    {
      "id": "email@example.com",  // This is the calendarId to store
      "summary": "Dr. Juan's Calendar",
      "accessRole": "writer",
      "primary": false
    }
  ]
}
```

### Google Calendar API - List Events
```typescript
// Google Calendar API events.list
// Source: https://developers.google.com/workspace/calendar/api/v3/reference/events/list

// Required scopes:
// - https://www.googleapis.com/auth/calendar.readonly
// - https://www.googleapis.com/auth/calendar.events.readonly

// Request:
GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
  ?timeMin=2026-02-04T00:00:00-03:00  // RFC3339 with timezone
  &timeMax=2026-02-04T23:59:59-03:00
  &singleEvents=true  // Expand recurring events
  &orderBy=startTime

// Response:
{
  "items": [
    {
      "id": "event123",
      "summary": "Meeting",
      "start": { "dateTime": "2026-02-04T10:00:00-03:00" },
      "end": { "dateTime": "2026-02-04T11:00:00-03:00" }
    }
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit | 2023 | react-beautiful-dnd deprecated, use @dnd-kit |
| Manual HTTP routing | Hono integration | 2024 | convex-helpers provides HonoWithConvex |
| Individual OAuth per user | Centralized admin OAuth | Decision | Simpler architecture, n8n handles OAuth |

**Deprecated/outdated:**
- react-beautiful-dnd: Atlassian deprecated it, migrate to @dnd-kit or react-dnd
- Direct Google API calls from frontend: Security risk, always proxy through backend

## Google Calendar API Reference

### Scopes Required for n8n Connection
| Scope | Permission | Use Case |
|-------|------------|----------|
| `calendar` | Full access | Create/update events, list calendars |
| `calendar.readonly` | Read only | List events for availability |
| `calendar.events` | Events only | Create/read/update events |

For n8n with centralized OAuth, use the full `calendar` scope since it needs to:
1. List all calendars shared with admin account
2. Read events from professional calendars
3. Create/update appointment events

### Key Endpoints for This Phase
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users/me/calendarList` | GET | List shared calendars (autodetection) |
| `/calendarList/{calendarId}` | GET | Validate specific calendar access |
| `/calendars/{calendarId}/events` | GET | Get events for availability check |
| `/calendars/{calendarId}/events` | POST | Create appointment event |

### CalendarList Response Fields
```typescript
interface CalendarListEntry {
  id: string;           // Calendar ID to store
  summary: string;      // Display name
  accessRole: "reader" | "writer" | "owner";
  primary: boolean;     // Is this the user's primary calendar
  backgroundColor?: string;
  foregroundColor?: string;
}
```

## Convex Schema Design

### Recommended Schema
```typescript
// convex/schema.ts additions

// Service Categories
serviceCategories: defineTable({
  clinicId: v.id("clinics"),
  name: v.string(),
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_clinic", ["clinicId"])
  .index("by_clinic_order", ["clinicId", "order"]),

// Services
services: defineTable({
  clinicId: v.id("clinics"),
  categoryId: v.id("serviceCategories"),
  name: v.string(),
  description: v.optional(v.string()),
  duration: v.number(), // minutes
  price: v.optional(v.number()),
  color: v.optional(v.string()),
  order: v.number(), // within category
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_clinic", ["clinicId"])
  .index("by_category", ["categoryId"])
  .index("by_clinic_active", ["clinicId", "active"]),

// Professionals
professionals: defineTable({
  clinicId: v.id("clinics"),
  userId: v.optional(v.id("users")),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  specialty: v.string(),
  calendarId: v.optional(v.string()),
  color: v.string(),
  serviceIds: v.array(v.id("services")),
  // Schedule override - null means use clinic default
  schedule: v.optional(v.object({
    monday: v.optional(dayScheduleValidator),
    tuesday: v.optional(dayScheduleValidator),
    wednesday: v.optional(dayScheduleValidator),
    thursday: v.optional(dayScheduleValidator),
    friday: v.optional(dayScheduleValidator),
    saturday: v.optional(dayScheduleValidator),
    sunday: v.optional(dayScheduleValidator),
  })),
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_clinic", ["clinicId"])
  .index("by_email", ["email"])
  .index("by_clinic_active", ["clinicId", "active"]),

// Professional Exceptions (vacations, sick days)
professionalExceptions: defineTable({
  professionalId: v.id("professionals"),
  startDate: v.string(), // YYYY-MM-DD
  endDate: v.string(),   // YYYY-MM-DD
  reason: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_professional", ["professionalId"])
  .index("by_professional_dates", ["professionalId", "startDate", "endDate"]),

// Day schedule validator
const dayScheduleValidator = v.object({
  enabled: v.boolean(),
  start: v.string(),  // "09:00"
  end: v.string(),    // "18:00"
  lunch: v.optional(v.object({
    start: v.string(),
    end: v.string(),
  })),
});
```

### Clinic Schema Addition
```typescript
// Add to clinics table for API key support
clinics: defineTable({
  // ... existing fields ...
  apiKey: v.optional(v.string()), // Generated API key for n8n
  n8nWebhookUrl: v.optional(v.string()), // n8n webhook base URL
})
  .index("by_api_key", ["apiKey"]),
```

## Open Questions

Things that couldn't be fully resolved:

1. **n8n Webhook Authentication**
   - What we know: n8n can receive webhook calls and has OAuth token
   - What's unclear: Exact webhook structure n8n expects
   - Recommendation: Define a clear contract, implement n8n workflow to match

2. **Google Calendar Event Format**
   - What we know: Standard event format with summary, description, attendees
   - What's unclear: Exact description template clinic wants
   - Recommendation: Use format from CONTEXT.md, make configurable later

3. **Calendar ID Validation UX**
   - What we know: Can call calendarList.get to verify access
   - What's unclear: What error message to show if access fails
   - Recommendation: "No se puede acceder al calendario. Verifica que fue compartido con permisos de edicion."

## Sources

### Primary (HIGH confidence)
- [Google Calendar API - CalendarList:list](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list) - Listing shared calendars
- [Google Calendar API - Events:list](https://developers.google.com/workspace/calendar/api/v3/reference/events/list) - Querying events
- [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions) - HTTP endpoint patterns
- [Convex Actions](https://docs.convex.dev/functions/actions) - External API calls
- [Convex Schemas](https://docs.convex.dev/database/schemas) - Schema design patterns
- [Hono with Convex](https://stack.convex.dev/hono-with-convex) - HTTP routing patterns
- [@dnd-kit Documentation](https://docs.dndkit.com/presets/sortable) - Sortable implementation

### Secondary (MEDIUM confidence)
- [shadcn-multi-select-component](https://github.com/sersavan/shadcn-multi-select-component) - Multi-select implementation
- [OpenStatus TimePicker](https://time.openstatus.dev/) - Time picker component
- [Nylas Scheduling Article](https://www.nylas.com/blog/how-to-schedule-time-slots-and-check-availability/) - Availability algorithm concepts

### Tertiary (LOW confidence)
- Various shadcn color picker implementations - Need to evaluate and pick one

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using established Convex patterns and documented shadcn components
- Architecture: HIGH - Google Calendar API well documented, Hono+Convex pattern proven
- Pitfalls: MEDIUM - Based on general experience with similar systems
- Google Calendar integration: HIGH - Official API documentation

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable domain, well-documented APIs)
