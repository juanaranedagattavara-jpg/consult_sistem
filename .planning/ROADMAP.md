# Roadmap: ConsultSystem

**Created:** 2026-02-04
**Phases:** 4
**Requirements:** 53 mapped

## Phase Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Foundation | Auth + Onboarding + Dashboard base | AUTH, ONBO, CLIN, DASH (23 reqs) | Complete |
| 2 | Team & Calendar | Profesionales + Servicios + Google Calendar | PROF, SERV, AVAI (17 reqs) | Planned |
| 3 | Patients & Appointments | CRUD pacientes + Citas + Agenda visual | PATI, IMPO, APPT, ACTN, AGEN (27 reqs) | Pending |
| 4 | n8n Integration | HTTP API para conectar workflow n8n | HTTP (8 reqs) | Pending |

---

## Phase 1: Foundation

**Goal:** Sistema base con autenticacion profesional, onboarding wizard, y dashboard operativo.

**Requirements:**
- AUTH-01..06: Autenticacion completa
- ONBO-01..07: Onboarding wizard 5 pasos
- CLIN-01..04: Configuracion de clinica
- DASH-01..06: Dashboard con stats real-time

**Success Criteria:**
1. Usuario puede registrarse, login, logout
2. Sesion persiste 30 dias con "recordar sesion"
3. Admin vs Staff tienen permisos diferenciados
4. Onboarding wizard completo con progress bar
5. Dashboard muestra stats en tiempo real
6. White label operativo (logo + colores se aplican)
7. Settings multi-tab funcional

**Technical Notes:**
- Convex Auth para session management
- Convex File Storage para logos
- shadcn/ui para toda la UI
- Zod validation en todos los forms
- TypeScript strict, no any

**Dependencies:** None (first phase)

**Plans:** 36 plans (Complete)

---

## Phase 2: Team & Calendar

**Goal:** Gestion de equipo medico con integracion Google Calendar (modelo OAuth centralizado via n8n).

**Requirements:**
- PROF-01..07: CRUD profesionales + Calendar ID
- SERV-01..05: CRUD servicios con categorias
- AVAI-01..05: Availability API

**Success Criteria:**
1. Admin puede crear profesional con datos completos
2. Profesional tiene calendar ID seleccionable (n8n tiene OAuth)
3. Sistema muestra disponibilidad real del calendario
4. Horarios de almuerzo bloquean slots
5. Excepciones (vacaciones) bloquean dias completos
6. Servicios con duracion afectan slots disponibles
7. Tabla profesionales con status de calendar

**Technical Notes:**
- Modelo OAuth centralizado: n8n tiene OAuth, sistema guarda calendar IDs
- Hono + convex-helpers para HTTP API
- @dnd-kit para drag-drop servicios
- Time pickers con shadcn/ui

**Dependencies:** Phase 1 (auth, clinic context)

**Plans:** 25 plans

Plans:
- [ ] 02-01-PLAN.md — Install dependencies + shadcn components
- [ ] 02-02-PLAN.md — Schema: serviceCategories + services tables
- [ ] 02-03-PLAN.md — Schema: professionals + exceptions tables
- [ ] 02-04-PLAN.md — Service categories mutations + queries
- [ ] 02-05-PLAN.md — Services mutations + queries
- [ ] 02-06-PLAN.md — Professionals mutations + queries
- [ ] 02-07-PLAN.md — Professional exceptions mutations + queries
- [ ] 02-08-PLAN.md — Multi-select component
- [ ] 02-09-PLAN.md — Time picker component
- [ ] 02-10-PLAN.md — Color picker component
- [ ] 02-11-PLAN.md — Availability algorithm helpers
- [ ] 02-12-PLAN.md — Hono HTTP router + API key middleware
- [ ] 02-13-PLAN.md — HTTP endpoints (professionals, services, categories)
- [ ] 02-14-PLAN.md — Category form + list components
- [ ] 02-15-PLAN.md — Service form component
- [ ] 02-16-PLAN.md — Professional form component
- [ ] 02-17-PLAN.md — Schedule editor component
- [ ] 02-18-PLAN.md — Calendar selector component
- [ ] 02-19-PLAN.md — Services page with accordion + drag-drop
- [ ] 02-20-PLAN.md — Professionals table component
- [ ] 02-21-PLAN.md — Professionals cards component
- [ ] 02-22-PLAN.md — Professionals pages (list, new, edit)
- [ ] 02-23-PLAN.md — Availability action
- [ ] 02-24-PLAN.md — HTTP availability endpoint
- [ ] 02-25-PLAN.md — Human verification checkpoint

---

## Phase 3: Patients & Appointments

**Goal:** Sistema completo de gestion de pacientes y citas con sync Google Calendar.

**Requirements:**
- PATI-01..07: CRUD pacientes
- IMPO-01..06: Import CSV
- APPT-01..08: Sistema de citas
- ACTN-01..04: Acciones sobre citas
- AGEN-01..06: Agenda visual

**Success Criteria:**
1. Usuario puede crear paciente con campos custom
2. Import CSV detecta duplicados, valida formato
3. Wizard agendamiento 4 pasos funcional
4. Cita creada aparece en Google Calendar
5. Modificar cita actualiza Google Calendar
6. Cancelar cita elimina de Google Calendar
7. FullCalendar muestra citas con filtros
8. Estados de cita con transiciones correctas

**Technical Notes:**
- FullCalendar React
- Convex subscriptions para real-time
- Google Calendar API create/update/delete
- Background import con progress

**Dependencies:** Phase 2 (professionals, services, calendar)

---

## Phase 4: n8n Integration

**Goal:** HTTP API completa para conectar workflow n8n existente.

**Requirements:**
- HTTP-01..08: Endpoints HTTP

**Success Criteria:**
1. GET /api/professionals retorna lista
2. GET /api/services retorna lista activos
3. GET /api/availability retorna slots reales
4. POST /api/appointments crea cita desde WhatsApp
5. PATCH /api/appointments/:id/status actualiza estado
6. GET /api/patients/search busca por telefono
7. POST /api/patients crea desde WhatsApp
8. API key authentication funciona

**Technical Notes:**
- Convex HTTP router
- API keys por clinica
- Documentacion de endpoints
- NO modificar workflow n8n, solo conectar

**Dependencies:** Phase 3 (patients, appointments, availability)

---

## Technical Notes

**Stack por fase:**
- Phase 1-3: Next.js 15 + Convex + shadcn/ui
- Phase 4: Convex HTTP API

**Convex Schema Tables:**
- clinics
- users
- professionals
- services
- patients
- appointments

**n8n Integration:**
- Workflow existente usa Airtable
- Reemplazar con Convex HTTP API
- Variables: CONVEX_API_URL, CONVEX_API_KEY, CLINIC_ID

---
*Roadmap created: 2026-02-04*
*Last updated: 2026-02-04*
