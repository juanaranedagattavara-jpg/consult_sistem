# Requirements: ConsultSystem

**Defined:** 2026-02-03
**Core Value:** Los pacientes confirman sus citas automaticamente y las horas canceladas se recuperan via lista de espera inteligente.

## v1 Requirements

### Authentication (AUTH)

- [ ] **AUTH-01**: Usuario puede registrarse con email y password
- [ ] **AUTH-02**: Usuario puede iniciar sesion
- [ ] **AUTH-03**: Usuario puede cerrar sesion
- [ ] **AUTH-04**: Sesion persiste entre recargas del navegador
- [ ] **AUTH-05**: Sistema soporta 2 roles: Admin y Staff

### Clinics (CLIN)

- [ ] **CLIN-01**: Admin puede crear/editar datos de la clinica
- [ ] **CLIN-02**: Clinica tiene configuracion de bot (tono, prompts)
- [ ] **CLIN-03**: Clinica tiene configuracion de tiempos (confirmacion, recordatorio, timeout)
- [ ] **CLIN-04**: Clinica tiene campos de paciente configurables

### Professionals (PROF)

- [ ] **PROF-01**: Admin puede crear/editar/eliminar profesionales
- [ ] **PROF-02**: Profesional puede conectar su Google Calendar via OAuth
- [ ] **PROF-03**: Profesional tiene horarios de atencion configurables
- [ ] **PROF-04**: Sistema lee disponibilidad real del calendario

### Services (SERV)

- [ ] **SERV-01**: Admin puede crear/editar/eliminar servicios
- [ ] **SERV-02**: Servicio tiene nombre, descripcion, duracion, precio
- [ ] **SERV-03**: Servicio tiene instrucciones pre-cita opcionales

### Patients (PATI)

- [ ] **PATI-01**: Usuario puede crear/editar pacientes
- [ ] **PATI-02**: Paciente tiene campos basicos: nombre, telefono, email
- [ ] **PATI-03**: Paciente tiene campos personalizados (configurable por clinica)
- [ ] **PATI-04**: Sistema registra historial de visitas del paciente

### Appointments (APPT)

- [ ] **APPT-01**: Usuario puede crear cita desde dashboard
- [ ] **APPT-02**: Cita se crea en Google Calendar del profesional
- [ ] **APPT-03**: Cita tiene estados: scheduled, confirmed, cancelled, completed, no_show
- [ ] **APPT-04**: Usuario puede ver agenda diaria/semanal por profesional
- [ ] **APPT-05**: Usuario puede cancelar/modificar citas

### Chatbot (CHAT)

- [ ] **CHAT-01**: Bot responde FAQs configuradas por la clinica
- [ ] **CHAT-02**: Bot detecta intencion: agendar cita
- [ ] **CHAT-03**: Bot detecta intencion: consultar informacion
- [ ] **CHAT-04**: Bot detecta intencion: cancelar/modificar cita
- [ ] **CHAT-05**: Bot detecta intencion: consultar estado de cita
- [ ] **CHAT-06**: Bot detecta intencion: queja/urgencia y escala a humano
- [ ] **CHAT-07**: Bot escala cuando detecta paciente frustrado
- [ ] **CHAT-08**: Bot escala cuando paciente pide hablar con humano
- [ ] **CHAT-09**: Bot escala cuando paciente es especial (nino, condicion)

### Booking (BOOK)

- [ ] **BOOK-01**: Paciente puede agendar via WhatsApp
- [ ] **BOOK-02**: Bot muestra disponibilidad real del profesional
- [ ] **BOOK-03**: Bot ofrece horarios alternativos si no hay disponibilidad
- [ ] **BOOK-04**: Bot ofrece agregar a lista de espera si esta lleno
- [ ] **BOOK-05**: Cita agendada via bot aparece en dashboard

### Confirmations (CONF)

- [ ] **CONF-01**: Sistema envia confirmacion X horas antes (configurable)
- [ ] **CONF-02**: Paciente puede confirmar respondiendo al mensaje
- [ ] **CONF-03**: Paciente puede cancelar respondiendo al mensaje
- [ ] **CONF-04**: Sistema reintenta si no responde (configurable)
- [ ] **CONF-05**: Si no confirma, sistema marca como no_confirmada y activa lista espera

### Reminders (REMI)

- [ ] **REMI-01**: Sistema envia recordatorio Y horas antes (configurable)
- [ ] **REMI-02**: Recordatorio incluye hora, direccion, instrucciones pre-cita

### Waitlist (WAIT)

- [ ] **WAIT-01**: Paciente puede agregarse a lista de espera
- [ ] **WAIT-02**: Sistema detecta cuando se libera una hora
- [ ] **WAIT-03**: Sistema notifica a pacientes en lista por orden de prioridad
- [ ] **WAIT-04**: Paciente tiene timeout para responder (configurable)
- [ ] **WAIT-05**: Si paciente confirma, se asigna la hora automaticamente
- [ ] **WAIT-06**: Si no responde, pasa al siguiente en la lista
- [ ] **WAIT-07**: Dashboard muestra lista de espera activa

### Analytics (ANAL)

- [ ] **ANAL-01**: Dashboard muestra tasa de no-show
- [ ] **ANAL-02**: Dashboard muestra tasa de confirmacion
- [ ] **ANAL-03**: Dashboard muestra horas recuperadas por lista de espera
- [ ] **ANAL-04**: Dashboard muestra conversaciones bot vs escaladas
- [ ] **ANAL-05**: Dashboard muestra citas del dia/semana

## v2 Requirements

### Post-Consultation (POST)

- **POST-01**: Sistema envia mensaje post-consulta (satisfaccion)
- **POST-02**: Si experiencia positiva, solicita resena Google
- **POST-03**: Sistema envia instrucciones post-tratamiento

### Reactivation (REAC)

- **REAC-01**: Sistema detecta pacientes inactivos (X meses sin visita)
- **REAC-02**: Sistema envia mensaje de reactivacion
- **REAC-03**: Mensaje ofrece horarios disponibles

### Advanced Analytics (ADVN)

- **ADVN-01**: Graficos de tendencias mensuales
- **ADVN-02**: Exportacion de reportes
- **ADVN-03**: Comparativa antes/despues del sistema

## Out of Scope

| Feature | Reason |
|---------|--------|
| Pagos/facturacion | Alta complejidad, no core para agendamiento |
| App movil nativa | Web responsive suficiente para MVP |
| Multi-idioma | Solo espanol chileno para mercado inicial |
| WhatsApp API oficial | Chatwoot funciona, migrar si escala |
| Video consultas | Fuera del scope de agendamiento |
| Integracion con fichas clinicas | Datos sensibles, regulacion compleja |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| CLIN-01 | Phase 1 | Pending |
| CLIN-02 | Phase 1 | Pending |
| CLIN-03 | Phase 1 | Pending |
| CLIN-04 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROF-03 | Phase 2 | Pending |
| PROF-04 | Phase 2 | Pending |
| SERV-01 | Phase 2 | Pending |
| SERV-02 | Phase 2 | Pending |
| SERV-03 | Phase 2 | Pending |
| PATI-01 | Phase 3 | Pending |
| PATI-02 | Phase 3 | Pending |
| PATI-03 | Phase 3 | Pending |
| PATI-04 | Phase 3 | Pending |
| APPT-01 | Phase 3 | Pending |
| APPT-02 | Phase 3 | Pending |
| APPT-03 | Phase 3 | Pending |
| APPT-04 | Phase 3 | Pending |
| APPT-05 | Phase 3 | Pending |
| CHAT-01 | Phase 4 | Pending |
| CHAT-02 | Phase 4 | Pending |
| CHAT-03 | Phase 4 | Pending |
| CHAT-04 | Phase 4 | Pending |
| CHAT-05 | Phase 4 | Pending |
| CHAT-06 | Phase 4 | Pending |
| CHAT-07 | Phase 4 | Pending |
| CHAT-08 | Phase 4 | Pending |
| CHAT-09 | Phase 4 | Pending |
| BOOK-01 | Phase 4 | Pending |
| BOOK-02 | Phase 4 | Pending |
| BOOK-03 | Phase 4 | Pending |
| BOOK-04 | Phase 4 | Pending |
| BOOK-05 | Phase 4 | Pending |
| CONF-01 | Phase 5 | Pending |
| CONF-02 | Phase 5 | Pending |
| CONF-03 | Phase 5 | Pending |
| CONF-04 | Phase 5 | Pending |
| CONF-05 | Phase 5 | Pending |
| REMI-01 | Phase 5 | Pending |
| REMI-02 | Phase 5 | Pending |
| WAIT-01 | Phase 6 | Pending |
| WAIT-02 | Phase 6 | Pending |
| WAIT-03 | Phase 6 | Pending |
| WAIT-04 | Phase 6 | Pending |
| WAIT-05 | Phase 6 | Pending |
| WAIT-06 | Phase 6 | Pending |
| WAIT-07 | Phase 6 | Pending |
| ANAL-01 | Phase 7 | Pending |
| ANAL-02 | Phase 7 | Pending |
| ANAL-03 | Phase 7 | Pending |
| ANAL-04 | Phase 7 | Pending |
| ANAL-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
