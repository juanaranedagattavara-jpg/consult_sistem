# ConsultSystem

## What This Is

Sistema SaaS enterprise de agendamiento automatico para clinicas medicas y consultorios en Chile. Automatiza confirmaciones de citas via WhatsApp, gestiona lista de espera inteligente, y sincroniza con Google Calendar. Target: clinicas dentales, psicologos, nutricionistas, kinesiologos.

## Core Value

**Los pacientes confirman sus citas automaticamente via WhatsApp y las horas canceladas se recuperan mediante lista de espera inteligente, reduciendo no-shows de 30% a <10% y recuperando el 70% de cancelaciones.**

## Requirements

### Validated

(None yet - ship to validate)

### Active

**Fase 1: Foundation + Auth + Onboarding**
- [ ] Auth email/password con Convex Auth
- [ ] Session management con roles (Admin/Staff)
- [ ] Onboarding wizard 5 pasos
- [ ] Dashboard base con stats real-time
- [ ] Settings de clinica (bot, timing, campos custom)
- [ ] White label (logo, colores)

**Fase 2: Profesionales + Servicios + Google Calendar**
- [ ] CRUD profesionales con horarios configurables
- [ ] Google Calendar OAuth 2.0 integration
- [ ] Availability API (slots reales desde calendar)
- [ ] CRUD servicios con duracion/precio/instrucciones
- [ ] Excepciones (vacaciones, feriados)

**Fase 3: Pacientes + Citas + Agenda Visual**
- [ ] CRUD pacientes con campos custom
- [ ] Import CSV masivo
- [ ] Wizard agendamiento 4 pasos
- [ ] Sync bidireccional Google Calendar
- [ ] Vista agenda FullCalendar
- [ ] Estados de cita (scheduled, confirmed, cancelled, completed, no_show)

**Fase 4: Integracion n8n + Convex HTTP API**
- [ ] HTTP API endpoints para n8n
- [ ] Autenticacion API keys
- [ ] Adaptar workflow n8n existente (Airtable -> Convex)

### Out of Scope

- BullMQ workers (confirmaciones/recordatorios) - Post-MVP
- Waitlist inteligente automatica - Post-MVP
- Analytics dashboard avanzado - Post-MVP
- Multi-tenant - v2
- App movil nativa - Web responsive suficiente
- Pagos/facturacion - Complejidad alta

## Context

**Stack elegido:**
- Frontend: Next.js 15 (App Router) + shadcn/ui + Tailwind + TypeScript strict
- Backend: Convex (serverless + real-time DB + Auth + File Storage)
- Automatizaciones: BullMQ + Redis (post-MVP), n8n (solo chatbot WhatsApp)
- Integraciones: Google Calendar API (OAuth 2.0), OpenAI GPT-4 (via n8n), Chatwoot + WhatsApp
- Deploy: VPS Ubuntu 24 (PM2 + Nginx), Convex Cloud

**Arquitectura:**
- Single-tenant inicial (1 instalacion por clinica)
- Next.js: UI + business logic
- Convex: Database + real-time + mutations + HTTP API
- n8n: SOLO chatbot WhatsApp (workflow existente, no tocar)

**Flujo existente:**
- Workflow n8n funcional para WhatsApp/Chatwoot
- Usa Redis para buffer de mensajes
- Usa Airtable (a reemplazar por Convex HTTP API)

**Usuario objetivo:**
- Clinicas dentales: 2-8 profesionales, 200-400 citas/mes
- Psicologos: 1-3 profesionales, 80-150 citas/mes
- Nutricionistas/Kinesiologos: 1-5 profesionales

**Pain points:**
- Secretaria pierde 2-3 hrs/dia confirmando por telefono
- 30% de no-shows por falta de recordatorios
- Horas canceladas quedan vacias (no hay lista de espera)

## Constraints

- **Tiempo**: 9 dias de desarrollo (4 fases)
- **Stack**: Next.js 15 + Convex + shadcn/ui (no negociable)
- **TypeScript**: Strict mode, no any permitido
- **UI**: Profesional desde dia 1, mobile-responsive
- **Idioma**: Espanol chileno en toda la UI
- **n8n**: NO modificar workflow existente, solo conectar via HTTP API

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Convex sobre Supabase | Tiempo real nativo, API automatica, TypeScript first | - Pending |
| Single-tenant inicial | Menos complejidad, mas facil mantener | - Pending |
| shadcn/ui sobre Retool | Full control, escalable, profesional | - Pending |
| n8n solo para chatbot | Workflow existente funciona, no reinventar | - Pending |
| BullMQ post-MVP | Enfocarse en core value primero | - Pending |

---
*Last updated: 2026-02-04 after initialization*
