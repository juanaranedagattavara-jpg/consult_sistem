# Phase 1: Foundation - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Dashboard base con autenticacion y configuracion de clinica. Incluye:
- Registro de Admin y creacion de clinica
- Login/logout con sesiones persistentes
- Invitacion de Staff por Admin
- Pagina de configuracion de clinica (bot, tiempos, campos)
- 2 roles: Admin (todo) y Staff (solo operacion)

NO incluye: gestion de profesionales, servicios, pacientes, citas (fases posteriores).

</domain>

<decisions>
## Implementation Decisions

### Registro de Admin
- Modelo mixto: Admin se registra solo, Staff solo por invitacion
- Campos de registro: email + password + nombre clinica + telefono
- Verificacion de email obligatoria antes de acceder al dashboard
- Despues de verificar, Admin accede al dashboard y puede configurar la clinica

### Login
- Checkbox "Recordarme" que extiende sesion a 30 dias
- Sin "Recordarme", sesion estandar (Claude decide duracion)
- Errores genericos por seguridad: "Credenciales invalidas" (no especificar si es email o password)

### Recovery de password
- Codigo de 6 digitos enviado al email
- Usuario ingresa codigo y nueva password

### Invitacion de Staff
- Admin ingresa email del Staff en el dashboard
- Staff recibe email con link de invitacion
- Staff crea su propia password al aceptar la invitacion
- Staff queda asociado a la clinica del Admin que lo invito

### Claude's Discretion
- Diseno visual del login/registro (simple centrado vs split screen)
- Duracion de sesion estandar (sin "Recordarme")
- Layout del dashboard (sidebar vs top nav)
- Organizacion de la pagina de settings
- Tema claro/oscuro (o solo claro para MVP)

</decisions>

<specifics>
## Specific Ideas

- Sistema multi-tenant: cada clinica es un tenant aislado
- Staff no puede ver configuracion de clinica, solo operar
- Convex maneja autenticacion y sesiones

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-03*
