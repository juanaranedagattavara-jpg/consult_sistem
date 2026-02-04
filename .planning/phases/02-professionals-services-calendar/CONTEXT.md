# Fase 2: Profesionales + Servicios + Google Calendar - CONTEXT

## Resumen Ejecutivo

Sistema de gestión de equipo médico con integración Google Calendar bidireccional. El modelo OAuth es centralizado: una cuenta admin conectada a n8n, profesionales comparten sus calendarios con esa cuenta.

---

## 1. Profesionales

### Datos del Profesional
- **Básicos:** Nombre, email, teléfono, especialidad
- **Sistema:** calendarId, color (para agenda), estado activo/inactivo
- **Relaciones:** userId (si tiene login), clinicId, serviceIds[]

### Autenticación y Permisos
- **Login propio:** Sí, cada profesional puede tener cuenta en el sistema
- **Nivel de acceso:** Completo (ve todo, pero gestiona solo lo suyo)
- **Roles:** admin | professional (staff se elimina o es equivalente)

### Horarios
- **Herencia:** Hereda horario base de la clínica
- **Override parcial:** Puede modificar días y horas de trabajo
- **Almuerzo:** Personalizable por día si es necesario
- **Formato:** Por día de semana con inicio/fin

### Estado y Gestión
- **Toggle activo/inactivo:** Sí, para desactivar sin eliminar
- **Asignación servicios:** Multi-select desde el formulario del profesional

### Resiliencia
- **Si OAuth/Calendar falla:** El sistema sigue funcionando, sincroniza cuando vuelva la conexión

---

## 2. Servicios

### Datos del Servicio
- **Completos:** Nombre, duración, precio, descripción, color, categoría
- **Configurables:** Precio y duración son editables por la clínica
- **Estado:** activo/inactivo toggle

### Categorías
- **Creadas por la clínica:** No hay predefinidas, cada clínica define las suyas
- **CRUD:** Crear, editar, eliminar categorías
- **Estructura:** Una categoría tiene nombre y orden

### Buffer/Preparación
- **Personalizable:** Cada clínica configura tiempo entre citas
- **Implementación:** Campo en settings de clínica o por servicio

### Chatbot
- **Acceso:** El bot puede agendar cualquier servicio activo
- **Sin restricciones:** No hay servicios "solo presencial"

---

## 3. Google Calendar

### Arquitectura OAuth (CRÍTICO)
```
┌─────────────────────────────────────────────────────────────┐
│                    MODELO CENTRALIZADO                       │
├─────────────────────────────────────────────────────────────┤
│  1. UNA cuenta admin (ej: admin@clinica.com)                │
│  2. Esta cuenta se conecta a n8n (OAuth manual, una vez)    │
│  3. Cada profesional COMPARTE su calendario con admin       │
│  4. Sistema guarda solo el Calendar ID del profesional      │
│  5. n8n accede a todos los calendarios vía cuenta admin     │
└─────────────────────────────────────────────────────────────┘
```

### Flujo para Agregar Profesional
1. Admin crea profesional en el sistema
2. Profesional comparte su Google Calendar con cuenta admin (permisos: "Make changes to events")
3. Sistema lista calendarios compartidos (autodetección)
4. Admin selecciona el calendario correcto
5. Sistema valida acceso al guardar

### Datos a Guardar
- **Calendar ID:** String del calendario del profesional
- **NO tokens:** n8n tiene su propia conexión OAuth

### Sincronización
- **Bidireccional:** Eventos del sistema → Calendar, eventos externos → bloquean disponibilidad
- **Eventos externos:** Mostrar como "No disponible" / bloqueado
- **Frecuencia:** Tiempo real cuando se consulta disponibilidad

### Formato de Eventos Creados
```
Título: "Juan Pérez - Limpieza dental"
Descripción:
  Paciente: Juan Pérez
  Teléfono: +56 9 1234 5678
  Servicio: Limpieza dental
  Duración: 30 minutos
  Precio: $25.000
  Notas: [si hay]
```

### Invitación al Paciente
- **Sí:** Enviar invitación de Google Calendar al email del paciente
- **El paciente ve la cita en su propio calendario**

---

## 4. Disponibilidad

### Cálculo de Slots
- **Basado en duración del servicio:** Si servicio dura 30min, slots cada 30min
- **Optimización:** Evitar huecos pequeños no agendables
- **Personalizable:** La clínica puede ajustar granularidad

### Verificación
- **Tiempo real:** Bot y sistema consultan disponibilidad al momento
- **Considera:** Horario profesional + eventos Google Calendar + citas existentes

### Conflictos
- **Primero en confirmar gana:** No permitir doble booking
- **Race condition:** Manejado a nivel de base de datos

### Excepciones/Ausencias
- **Rangos o días sueltos:** Ambos soportados
- **Campos:** fechaInicio, fechaFin, motivo (opcional), profesionalId
- **Sync:** Se reflejan como bloqueados en Google Calendar

---

## 5. UI/UX

### Navegación
- **Profesionales:** Sección propia en menú principal → `/profesionales`
- **Servicios:** Sección propia en menú principal → `/servicios`

### Lista de Profesionales
- **Toggle vista:** Usuario puede cambiar entre tabla y cards
- **Tabla:** Columnas - nombre, email, servicios, estado, acciones
- **Cards:** Foto/inicial, nombre, especialidad, color, estado
- **Filtros:** Por estado (activo/inactivo/todos) + por servicio
- **Búsqueda:** No necesaria (pocas clínicas tienen muchos profesionales)
- **Paginación:** 10 por página

### Lista de Servicios
- **Vista tabla:** Nombre, duración, precio, categoría, estado, acciones
- **Agrupación:** Por categoría (accordion o tabs)
- **Ordenamiento:** Drag & drop manual
- **Paginación:** 10 por página

### Formulario Profesional
1. Datos básicos (nombre, email, teléfono, especialidad)
2. Servicios que ofrece (multi-select)
3. Horario (override de clínica si es necesario)
4. Color para agenda
5. Google Calendar (autodetección + validación)

### Formulario Servicio
1. Categoría (select + opción crear nueva)
2. Nombre y descripción
3. Duración (minutos)
4. Precio
5. Color (opcional)

### Calendar ID UX
1. Botón "Conectar Google Calendar"
2. Lista de calendarios compartidos con cuenta admin
3. Usuario selecciona el correcto
4. Validación automática al guardar
5. Indicador visual de estado (conectado/error)

---

## 6. API HTTP para n8n

### Autenticación
- **Método:** API Key simple
- **Header:** `X-API-Key: {clinic_api_key}`
- **Generación:** Una key por clínica (en onboarding o settings)

### Endpoints Requeridos

```
# Profesionales
GET    /api/professionals              # Lista con calendarIds
GET    /api/professionals/:id          # Detalle de uno

# Servicios
GET    /api/services                   # Lista activos con duraciones
GET    /api/services/:id               # Detalle de uno

# Categorías
GET    /api/categories                 # Lista de categorías

# Disponibilidad
GET    /api/availability               # ?professionalId=xxx&date=YYYY-MM-DD&serviceId=xxx
       # Retorna: slots disponibles considerando Calendar + citas

# Citas (CRUD completo)
POST   /api/appointments               # Crear cita
GET    /api/appointments/:id           # Obtener cita
PATCH  /api/appointments/:id           # Modificar cita
DELETE /api/appointments/:id           # Cancelar cita
GET    /api/appointments               # ?professionalId=xxx&date=YYYY-MM-DD
```

### Respuesta Estándar
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Errores
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "message": "El horario seleccionado ya no está disponible"
  }
}
```

---

## 7. Log/Auditoría

### Nivel Básico
- **updatedAt:** Timestamp de última modificación
- **updatedBy:** userId que hizo el cambio
- **Sin historial completo:** No guardar cada cambio individual

---

## 8. Schema Convex (Preview)

```typescript
// Tabla professionals
professionals: defineTable({
  clinicId: v.id("clinics"),
  userId: v.optional(v.id("users")),     // Si tiene login
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  specialty: v.string(),
  calendarId: v.optional(v.string()),    // Google Calendar ID
  color: v.string(),                      // Para identificar en agenda
  serviceIds: v.array(v.id("services")), // Servicios que ofrece
  schedule: v.optional(v.object({        // Override de horario clínica
    // Estructura flexible por día
  })),
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

// Tabla services
services: defineTable({
  clinicId: v.id("clinics"),
  categoryId: v.id("serviceCategories"),
  name: v.string(),
  description: v.optional(v.string()),
  duration: v.number(),                   // minutos
  price: v.optional(v.number()),
  color: v.optional(v.string()),
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

// Tabla serviceCategories
serviceCategories: defineTable({
  clinicId: v.id("clinics"),
  name: v.string(),
  order: v.number(),
  createdAt: v.number(),
})

// Tabla professionalExceptions (vacaciones, ausencias)
professionalExceptions: defineTable({
  professionalId: v.id("professionals"),
  startDate: v.string(),                  // YYYY-MM-DD
  endDate: v.string(),                    // YYYY-MM-DD
  reason: v.optional(v.string()),
  createdAt: v.number(),
})
```

---

## 9. Dependencias Técnicas

### Google Calendar API
- **Scopes necesarios:** `https://www.googleapis.com/auth/calendar`
- **Operaciones:** List events, Create event, Update event, Delete event
- **La conexión OAuth está en n8n**, el sistema solo usa Calendar IDs

### Nuevas Dependencias Frontend
- Ninguna adicional requerida (shadcn ya tiene todo)

---

## 10. Scope Fijo - NO Expandir

### Incluido en Fase 2
- ✅ CRUD profesionales con Calendar ID
- ✅ CRUD servicios con categorías
- ✅ CRUD categorías de servicios
- ✅ API de disponibilidad
- ✅ Validación de Calendar ID
- ✅ Excepciones/ausencias de profesionales
- ✅ API HTTP para n8n (endpoints listados)
- ✅ UI toggle tabla/cards

### NO Incluido (Fases Futuras)
- ❌ App móvil para profesionales
- ❌ Múltiples calendarios por profesional
- ❌ Precios diferenciados por profesional
- ❌ Reportes de ocupación
- ❌ Integración con otros calendarios (Outlook, etc.)

---

## 11. Validaciones y Acciones

### Validaciones
- **Email profesional:** Único global en todo el sistema
- **Calendar ID:** Validar acceso al guardar

### Eliminación
- **Profesional con citas:** Sí se puede, mostrar advertencia de citas pendientes
- **Servicio asignado:** Personalizable (warning + opción de desasignar)

### Empty States
- **Sin profesionales/servicios:** Mensaje explicativo + botón CTA "Crear primero"

### Acciones en Lote
- **Básicas:** Activar/desactivar varios a la vez
- **Selección:** Checkbox en cada fila

### Confirmaciones
- **Eliminar:** Modal simple "¿Seguro que quieres eliminar X?"

### Duplicar
- **Solo servicios:** Botón para duplicar servicio como plantilla

### Feedback
- **Toast notifications:** Mensaje temporal para acciones exitosas

---

## Ideas Capturadas para Futuro

*(Ninguna nueva en esta discusión)*
