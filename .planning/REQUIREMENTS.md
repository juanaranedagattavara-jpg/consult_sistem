# Requirements: ConsultSystem

**Defined:** 2026-02-04
**Core Value:** Los pacientes confirman sus citas automaticamente via WhatsApp y las horas canceladas se recuperan mediante lista de espera inteligente.

## v1 Requirements

### Authentication (AUTH)

- [ ] **AUTH-01**: Usuario puede registrarse con email y password
- [ ] **AUTH-02**: Usuario puede iniciar sesion
- [ ] **AUTH-03**: Usuario puede cerrar sesion
- [ ] **AUTH-04**: Sesion persiste entre recargas (30 dias con "recordar")
- [ ] **AUTH-05**: Sistema soporta 2 roles: Admin y Staff
- [ ] **AUTH-06**: Magic link login opcional

### Onboarding (ONBO)

- [ ] **ONBO-01**: Wizard paso 1 - Registro inicial (email, password, nombre)
- [ ] **ONBO-02**: Wizard paso 2 - Datos clinica (nombre, RUT, direccion, telefono, timezone)
- [ ] **ONBO-03**: Wizard paso 3 - White label (logo, colores primario/secundario)
- [ ] **ONBO-04**: Wizard paso 4 - Config operacional (horarios, dias, duracion slot)
- [ ] **ONBO-05**: Wizard paso 5 - Setup rapido (primer profesional, primer servicio)
- [ ] **ONBO-06**: Progress bar visible en todos los pasos
- [ ] **ONBO-07**: Permitir saltar onboarding y completar despues

### Clinic Configuration (CLIN)

- [ ] **CLIN-01**: Admin puede editar datos de la clinica
- [ ] **CLIN-02**: Config bot: tono (formal/casual/amigable), prompts, FAQs, mensajes
- [ ] **CLIN-03**: Config timing: confirmacion, recordatorio, reintentos, timeout waitlist
- [ ] **CLIN-04**: Campos personalizados pacientes (JSON schema builder)

### Dashboard (DASH)

- [ ] **DASH-01**: Layout con sidebar colapsable
- [ ] **DASH-02**: Header con logo clinica + user dropdown
- [ ] **DASH-03**: Stats cards: citas hoy, citas semana, tasa confirmacion, horas recuperadas
- [ ] **DASH-04**: Quick actions: nueva cita, ver agenda, ver lista espera
- [ ] **DASH-05**: Proximas citas (lista de 5)
- [ ] **DASH-06**: Real-time updates via Convex subscriptions

### Professionals (PROF)

- [ ] **PROF-01**: CRUD completo de profesionales
- [ ] **PROF-02**: Campos: nombre, especialidad, email, telefono, RUT, bio, avatar
- [ ] **PROF-03**: Google Calendar OAuth 2.0 (connect/disconnect)
- [ ] **PROF-04**: Refresh token encrypted en Convex
- [ ] **PROF-05**: Horarios de atencion por dia (start/end/lunch)
- [ ] **PROF-06**: Excepciones (vacaciones, feriados, enfermedad)
- [ ] **PROF-07**: Estado active/inactive

### Services (SERV)

- [ ] **SERV-01**: CRUD completo de servicios
- [ ] **SERV-02**: Campos: nombre, descripcion, duracion, precio, categoria, color
- [ ] **SERV-03**: Instrucciones pre-cita opcionales
- [ ] **SERV-04**: Multi-select profesionales que pueden realizar
- [ ] **SERV-05**: Estado active/inactive

### Availability (AVAI)

- [ ] **AVAI-01**: API retorna slots disponibles reales
- [ ] **AVAI-02**: Considera horarios de atencion del profesional
- [ ] **AVAI-03**: Considera eventos existentes en Google Calendar
- [ ] **AVAI-04**: Considera excepciones (vacaciones/feriados)
- [ ] **AVAI-05**: Considera duracion del servicio

### Patients (PATI)

- [ ] **PATI-01**: CRUD completo de pacientes
- [ ] **PATI-02**: Campos base: nombre, email, telefono (+56 9 XXXX XXXX), RUT, fecha nac, genero
- [ ] **PATI-03**: Campos personalizados dinamicos segun config clinica
- [ ] **PATI-04**: Notas privadas con historial de cambios
- [ ] **PATI-05**: Historial de visitas
- [ ] **PATI-06**: Estados: active, inactive, blocked
- [ ] **PATI-07**: Metricas: total visitas, no-shows

### Patient Import (IMPO)

- [ ] **IMPO-01**: Upload CSV con drag & drop
- [ ] **IMPO-02**: Template CSV descargable
- [ ] **IMPO-03**: Mapeo de columnas visual
- [ ] **IMPO-04**: Deteccion de duplicados (email/telefono)
- [ ] **IMPO-05**: Preview antes de importar
- [ ] **IMPO-06**: Import en background con notificacion

### Appointments (APPT)

- [ ] **APPT-01**: Wizard 4 pasos: paciente, servicio, profesional+fecha, horario
- [ ] **APPT-02**: Crear paciente inline si no existe
- [ ] **APPT-03**: Estados: scheduled, confirmed, cancelled, completed, no_show
- [ ] **APPT-04**: Crear evento en Google Calendar al agendar
- [ ] **APPT-05**: Actualizar evento en Google Calendar al modificar
- [ ] **APPT-06**: Eliminar evento en Google Calendar al cancelar
- [ ] **APPT-07**: Notas opcionales en cita
- [ ] **APPT-08**: Source tracking: dashboard, whatsapp, waitlist

### Appointment Actions (ACTN)

- [ ] **ACTN-01**: Modificar cita (fecha/hora/profesional/servicio)
- [ ] **ACTN-02**: Cancelar cita con razon
- [ ] **ACTN-03**: Marcar completada (solo citas pasadas)
- [ ] **ACTN-04**: Marcar no-show (solo citas pasadas)

### Visual Agenda (AGEN)

- [ ] **AGEN-01**: FullCalendar con vistas: dia, semana, mes, lista
- [ ] **AGEN-02**: Filtros: por profesional, por estado, por servicio
- [ ] **AGEN-03**: Eventos coloreados por servicio
- [ ] **AGEN-04**: Click evento abre drawer con detalles
- [ ] **AGEN-05**: Business hours y lunch visible
- [ ] **AGEN-06**: Real-time updates

### HTTP API (HTTP)

- [ ] **HTTP-01**: GET /api/professionals
- [ ] **HTTP-02**: GET /api/services
- [ ] **HTTP-03**: GET /api/availability
- [ ] **HTTP-04**: POST /api/appointments
- [ ] **HTTP-05**: PATCH /api/appointments/:id/status
- [ ] **HTTP-06**: GET /api/patients/search
- [ ] **HTTP-07**: POST /api/patients
- [ ] **HTTP-08**: Autenticacion via API key en header

## v2 Requirements

### Background Workers (WORK)

- **WORK-01**: BullMQ worker para confirmaciones
- **WORK-02**: BullMQ worker para recordatorios
- **WORK-03**: Reintentos configurables

### Waitlist (WAIT)

- **WAIT-01**: Paciente puede agregarse a lista de espera
- **WAIT-02**: Sistema detecta cuando se libera hora
- **WAIT-03**: Notifica por orden de prioridad
- **WAIT-04**: Timeout configurable para respuesta
- **WAIT-05**: Asignacion automatica

### Analytics (ANAL)

- **ANAL-01**: Tasa de no-show
- **ANAL-02**: Tasa de confirmacion
- **ANAL-03**: Horas recuperadas via waitlist
- **ANAL-04**: Ratio bot/humano

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-tenant | Complejidad inicial, v2 |
| Pagos/facturacion | Alta complejidad, no core |
| App movil nativa | Web responsive suficiente |
| Video consultas | Fuera del scope |
| Multi-idioma | Solo espanol chileno MVP |
| Drag & drop en agenda | v2, complejidad UI |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01..06 | Phase 1 | Pending |
| ONBO-01..07 | Phase 1 | Pending |
| CLIN-01..04 | Phase 1 | Pending |
| DASH-01..06 | Phase 1 | Pending |
| PROF-01..07 | Phase 2 | Pending |
| SERV-01..05 | Phase 2 | Pending |
| AVAI-01..05 | Phase 2 | Pending |
| PATI-01..07 | Phase 3 | Pending |
| IMPO-01..06 | Phase 3 | Pending |
| APPT-01..08 | Phase 3 | Pending |
| ACTN-01..04 | Phase 3 | Pending |
| AGEN-01..06 | Phase 3 | Pending |
| HTTP-01..08 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 after initialization*
