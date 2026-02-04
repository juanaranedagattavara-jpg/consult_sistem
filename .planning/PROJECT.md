# ConsultSystem

## What This Is

Sistema SaaS de automatizacion para clinicas dentales y consultorios medicos (psicologos, nutricionistas, kinesiologos). Automatiza la comunicacion con pacientes via WhatsApp y la gestion completa de citas, reduciendo el trabajo manual de secretarias y mejorando la tasa de asistencia.

## Core Value

**Los pacientes confirman sus citas automaticamente y las horas canceladas se recuperan via lista de espera inteligente.**

Si todo lo demas falla, esto debe funcionar: el bot confirma citas y llena horas vacias.

## Requirements

### Validated

(None yet - ship to validate)

### Active

**Chatbot WhatsApp**
- [ ] Responder FAQs 24/7 (configurable por clinica)
- [ ] Detectar 6 intenciones: agendar, consultar info, queja, urgencia, cancelar/modificar, estado de cita
- [ ] Escalar a humano: paciente frustrado, solicitud explicita, paciente especial
- [ ] Tono configurable por clinica (formal/casual/custom)

**Reserva de Horas**
- [ ] Leer disponibilidad de Google Calendar
- [ ] Soportar multiples profesionales (MVP: 2 calendarios)
- [ ] Agendar citas via WhatsApp
- [ ] Agregar a lista de espera si no hay disponibilidad

**Confirmaciones y Recordatorios**
- [ ] Enviar confirmacion X horas antes (configurable)
- [ ] Enviar recordatorio Y horas antes (configurable)
- [ ] Reintentos configurables si no responde
- [ ] Activar lista de espera si no confirma

**Lista de Espera Inteligente**
- [ ] Notificar automaticamente cuando se libera hora
- [ ] Priorizar por orden de llegada
- [ ] Timeout configurable para respuesta
- [ ] Asignar automaticamente al que confirma primero

**Dashboard**
- [ ] Autenticacion con 2 roles (Admin + Staff)
- [ ] CRUD de profesionales con OAuth Google Calendar
- [ ] CRUD de servicios/tipos de cita
- [ ] CRUD de pacientes con campos configurables
- [ ] Vista de agenda por profesional
- [ ] Vista de lista de espera
- [ ] Configuracion de clinica (tono bot, tiempos, etc)
- [ ] Metricas: no-show, confirmacion, horas recuperadas

### Out of Scope

- Seguimiento post-consulta - Fase 2 (no es core para MVP)
- Reactivacion de pacientes inactivos - Fase 2
- Solicitud de resenas Google - Fase 2
- Pagos/facturacion - Complejidad alta, no core
- App movil nativa - Web responsive es suficiente
- Multiples idiomas - Solo espanol chileno para MVP
- WhatsApp API oficial - Chatwoot para MVP, migrar despues

## Context

**Stack elegido:**
- Frontend: Next.js 15 + shadcn/ui + Tailwind
- Backend/DB: Convex (tiempo real, multi-tenant)
- Workflows: n8n (1 instancia Docker por cliente)
- WhatsApp: Chatwoot
- Calendario: Google Calendar API + OAuth
- IA: OpenAI GPT-4
- Hosting: VPS propio

**Arquitectura hibrida:**
- Dashboard: Multi-tenant (una app, todas las clinicas)
- n8n: Una instancia Docker por cliente (credenciales separadas)
- Justificacion: n8n no es multi-tenant nativo, cada clinica tiene su WhatsApp/Calendar

**Flujo existente:**
- Ya existe un workflow de n8n funcional para WhatsApp/Chatwoot
- Usa Redis para buffer de mensajes
- Usa Airtable (a reemplazar por Convex)
- Prompt de IA para peluqueria (adaptar a clinicas)

**Usuario objetivo:**
- Clinicas dentales y consultorios en Chile
- Secretarias que pierden horas confirmando citas
- Duenos que quieren visibilidad de su operacion

## Constraints

- **Tiempo**: Desarrollador es estudiante con tiempo limitado
- **Mantenimiento**: Sistema debe ser autonomo, minima intervencion post-instalacion
- **Costo VPS**: Multiples n8n en un VPS (Docker), no un servidor por cliente
- **Soporte**: Evitar llamadas telefonicas, preferir soporte asincrono

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Convex sobre Supabase/Airtable | Tiempo real nativo, API automatica, TypeScript | - Pending |
| Arquitectura hibrida | n8n no es multi-tenant, credenciales por instancia | - Pending |
| shadcn/ui sobre Retool | Full control, escalable, profesional | - Pending |
| Chatwoot para MVP | Ya funciona, migrar a API oficial si escala | - Pending |
| 2 roles simples | Admin + Staff suficiente para MVP | - Pending |

---
*Last updated: 2026-02-03 after initialization*
