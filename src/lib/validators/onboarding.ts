import { z } from "zod";

// Step 2: Clinic data
export const clinicSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  taxId: z.string().min(8, "RUT invalido"),
  address: z.string().min(5, "Direccion requerida"),
  phone: z.string().min(9, "Telefono invalido"),
});

// Step 3: Branding
export const brandingSchema = z.object({
  logo: z.string().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color invalido"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color invalido"),
});

// Step 4: Schedule
export const scheduleSchema = z.object({
  workDays: z.array(z.number()).min(1, "Selecciona al menos un dia"),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora invalida"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora invalida"),
  lunchStart: z.string().optional(),
  lunchEnd: z.string().optional(),
});

// Step 5: Setup
export const setupSchema = z.object({
  professionalName: z.string().min(2, "Nombre requerido"),
  serviceName: z.string().min(2, "Nombre del servicio requerido"),
  serviceDuration: z.number().min(15, "Minimo 15 minutos"),
});

export type ClinicInput = z.infer<typeof clinicSchema>;
export type BrandingInput = z.infer<typeof brandingSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type SetupInput = z.infer<typeof setupSchema>;
