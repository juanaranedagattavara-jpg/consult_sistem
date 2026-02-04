# Roadmap: ConsultSystem

**Created:** 2026-02-03
**Phases:** 7
**Requirements:** 47 mapped

## Phase Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Foundation | Dashboard base con auth y config de clinica | AUTH-01..05, CLIN-01..04 | Pending |
| 2 | Team & Services | Gestion de profesionales y servicios | PROF-01..04, SERV-01..03 | Pending |
| 3 | Patients & Appointments | CRUD pacientes y citas con calendario | PATI-01..04, APPT-01..05 | Pending |
| 4 | Chatbot & Booking | Bot WhatsApp con reserva de horas | CHAT-01..09, BOOK-01..05 | Pending |
| 5 | Confirmations & Reminders | Automatizacion de mensajes pre-cita | CONF-01..05, REMI-01..02 | Pending |
| 6 | Waitlist | Lista de espera inteligente | WAIT-01..07 | Pending |
| 7 | Analytics | Dashboard de metricas | ANAL-01..05 | Pending |

---

## Phase 1: Foundation

**Goal:** Dashboard base con autenticacion y configuracion de clinica

**Requirements:**
- AUTH-01: Usuario puede registrarse con email y password
- AUTH-02: Usuario puede iniciar sesion
- AUTH-03: Usuario puede cerrar sesion
- AUTH-04: Sesion persiste entre recargas
- AUTH-05: Sistema soporta 2 roles: Admin y Staff
- CLIN-01: Admin puede crear/editar datos de la clinica
- CLIN-02: Clinica tiene configuracion de bot
- CLIN-03: Clinica tiene configuracion de tiempos
- CLIN-04: Clinica tiene campos de paciente configurables

**Success Criteria:**
1. Usuario puede registrarse, login, logout
2. Sesion persiste al recargar pagina
3. Admin puede editar configuracion de clinica
4. Staff no puede acceder a configuracion
5. Convex DB tiene tablas: users, clinics

**Dependencies:** None (first phase)

---

## Phase 2: Team & Services

**Goal:** Gestion de profesionales y servicios de la clinica

**Requirements:**
- PROF-01: Admin puede crear/editar/eliminar profesionales
- PROF-02: Profesional puede conectar Google Calendar via OAuth
- PROF-03: Profesional tiene horarios de atencion configurables
- PROF-04: Sistema lee disponibilidad real del calendario
- SERV-01: Admin puede crear/editar/eliminar servicios
- SERV-02: Servicio tiene nombre, descripcion, duracion, precio
- SERV-03: Servicio tiene instrucciones pre-cita opcionales

**Success Criteria:**
1. Admin puede crear profesional con nombre y especialidad
2. Profesional puede conectar su Google Calendar (OAuth flow)
3. Sistema muestra disponibilidad real del calendario
4. Admin puede crear servicio con duracion
5. Horarios de atencion se respetan al mostrar disponibilidad

**Dependencies:** Phase 1 (auth, clinic context)

---

## Phase 3: Patients & Appointments

**Goal:** CRUD completo de pacientes y citas con sincronizacion de calendario

**Requirements:**
- PATI-01: Usuario puede crear/editar pacientes
- PATI-02: Paciente tiene campos basicos
- PATI-03: Paciente tiene campos personalizados
- PATI-04: Sistema registra historial de visitas
- APPT-01: Usuario puede crear cita desde dashboard
- APPT-02: Cita se crea en Google Calendar
- APPT-03: Cita tiene estados
- APPT-04: Usuario puede ver agenda diaria/semanal
- APPT-05: Usuario puede cancelar/modificar citas

**Success Criteria:**
1. Usuario puede crear paciente con campos configurados
2. Usuario puede crear cita seleccionando paciente, profesional, servicio, horario
3. Cita aparece en Google Calendar del profesional
4. Vista de agenda muestra citas por dia/semana
5. Cancelar cita actualiza estado y libera calendario

**Dependencies:** Phase 2 (professionals, services, calendar)

---

## Phase 4: Chatbot & Booking

**Goal:** Bot de WhatsApp funcional con reserva de horas

**Requirements:**
- CHAT-01..09: Deteccion de intenciones y escalacion
- BOOK-01..05: Flujo de reserva via WhatsApp

**Success Criteria:**
1. Bot responde a mensaje de WhatsApp via Chatwoot
2. Bot detecta "quiero agendar" y ofrece profesionales
3. Bot muestra horarios disponibles reales
4. Paciente puede elegir horario y confirmar
5. Cita aparece en dashboard y Google Calendar
6. Bot escala a humano cuando corresponde
7. Workflow n8n conectado a Convex

**Dependencies:** Phase 3 (patients, appointments, calendar)

---

## Phase 5: Confirmations & Reminders

**Goal:** Automatizacion de mensajes de confirmacion y recordatorio

**Requirements:**
- CONF-01..05: Flujo de confirmacion
- REMI-01..02: Recordatorios pre-cita

**Success Criteria:**
1. Sistema envia mensaje de confirmacion X horas antes
2. Paciente responde "si" y cita se marca confirmada
3. Paciente responde "no" y cita se cancela
4. Si no responde, sistema reintenta
5. Despues de reintentos, marca no_confirmada
6. Recordatorio se envia Y horas antes con detalles

**Dependencies:** Phase 4 (chatbot infrastructure, appointments)

---

## Phase 6: Waitlist

**Goal:** Sistema de lista de espera inteligente

**Requirements:**
- WAIT-01..07: Flujo completo de lista de espera

**Success Criteria:**
1. Paciente puede agregarse a lista de espera via bot
2. Cuando cita se cancela, sistema detecta hora libre
3. Sistema notifica al primer paciente en lista
4. Paciente tiene X minutos para responder
5. Si confirma, cita se asigna automaticamente
6. Si no responde, pasa al siguiente
7. Dashboard muestra lista de espera activa

**Dependencies:** Phase 5 (confirmations trigger waitlist)

---

## Phase 7: Analytics

**Goal:** Dashboard de metricas completo

**Requirements:**
- ANAL-01..05: Metricas del sistema

**Success Criteria:**
1. Dashboard muestra tasa de no-show del periodo
2. Dashboard muestra tasa de confirmacion
3. Dashboard muestra horas recuperadas via waitlist
4. Dashboard muestra ratio bot/humano
5. Vista de citas del dia/semana con estados

**Dependencies:** Phase 6 (all data flows complete)

---

## Technical Notes

**Stack por fase:**
- Phase 1-3: Next.js + Convex + shadcn/ui
- Phase 4-6: n8n workflows + Convex HTTP API
- Phase 7: Convex queries + charts

**Multi-tenant:**
- Todas las queries filtran por clinicId
- Context de clinica desde auth

**n8n Integration:**
- Cada clinica tiene su instancia Docker
- Workflow template se clona para nuevos clientes
- Convex HTTP API para leer/escribir datos

---
*Roadmap created: 2026-02-03*
*Last updated: 2026-02-03*
