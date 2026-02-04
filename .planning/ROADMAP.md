# Roadmap: ConsultSystem

**Created:** 2026-02-04
**Phases:** 4
**Requirements:** 53 mapped

## Phase Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Foundation | Auth + Onboarding + Dashboard base | AUTH, ONBO, CLIN, DASH (23 reqs) | Pending |
| 2 | Team & Calendar | Profesionales + Servicios + Google Calendar | PROF, SERV, AVAI (17 reqs) | Pending |
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

---

## Phase 2: Team & Calendar

**Goal:** Gestion de equipo medico con integracion Google Calendar bidireccional.

**Requirements:**
- PROF-01..07: CRUD profesionales + OAuth
- SERV-01..05: CRUD servicios
- AVAI-01..05: Availability API

**Success Criteria:**
1. Admin puede crear profesional con datos completos
2. Profesional conecta Google Calendar (OAuth flow)
3. Sistema muestra disponibilidad real del calendario
4. Horarios de almuerzo bloquean slots
5. Excepciones (vacaciones) bloquean dias completos
6. Servicios con duracion afectan slots disponibles
7. Tabla profesionales con status de calendar

**Technical Notes:**
- Google Calendar API v3
- Refresh token encrypted en Convex
- Actions para llamadas externas
- Time pickers con shadcn/ui

**Dependencies:** Phase 1 (auth, clinic context)

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
