"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const timingSchema = z.object({
  confirmationHours: z
    .number()
    .min(1, "Minimo 1 hora")
    .max(72, "Maximo 72 horas"),
  reminderHours: z
    .number()
    .min(1, "Minimo 1 hora")
    .max(24, "Maximo 24 horas"),
  retries: z
    .number()
    .min(1, "Minimo 1 reintento")
    .max(5, "Maximo 5 reintentos"),
  waitlistTimeout: z
    .number()
    .min(5, "Minimo 5 minutos")
    .max(120, "Maximo 120 minutos"),
});

type TimingFormData = z.infer<typeof timingSchema>;

export function TimingForm() {
  const user = useQuery(api.users.getCurrentUser);
  const updateTiming = useMutation(api.clinics.updateClinicTiming);

  const form = useForm<TimingFormData>({
    resolver: zodResolver(timingSchema),
    defaultValues: {
      confirmationHours: 24,
      reminderHours: 2,
      retries: 3,
      waitlistTimeout: 30,
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user?.clinic?.timing) {
      form.reset({
        confirmationHours: user.clinic.timing.confirmationHours || 24,
        reminderHours: user.clinic.timing.reminderHours || 2,
        retries: user.clinic.timing.retries || 3,
        waitlistTimeout: user.clinic.timing.waitlistTimeout || 30,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: TimingFormData) => {
    try {
      await updateTiming({
        clinicId: user!.clinicId,
        timing: data,
      });
      toast.success("Configuracion de tiempos actualizada");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al guardar";
      toast.error(message);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiempos y notificaciones</CardTitle>
        <CardDescription>
          Configura los tiempos de confirmacion, recordatorios y lista de espera
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="confirmationHours">
              Confirmacion (horas antes de la cita)
            </Label>
            <Input
              {...form.register("confirmationHours", { valueAsNumber: true })}
              id="confirmationHours"
              type="number"
              min={1}
              max={72}
            />
            <p className="text-sm text-muted-foreground">
              Cuantas horas antes de la cita se envia el mensaje de confirmacion
              al paciente (1-72 horas)
            </p>
            {form.formState.errors.confirmationHours && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmationHours.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderHours">
              Recordatorio (horas antes de la cita)
            </Label>
            <Input
              {...form.register("reminderHours", { valueAsNumber: true })}
              id="reminderHours"
              type="number"
              min={1}
              max={24}
            />
            <p className="text-sm text-muted-foreground">
              Cuantas horas antes se envia el recordatorio final al paciente
              (1-24 horas)
            </p>
            {form.formState.errors.reminderHours && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reminderHours.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="retries">Reintentos de contacto</Label>
            <Input
              {...form.register("retries", { valueAsNumber: true })}
              id="retries"
              type="number"
              min={1}
              max={5}
            />
            <p className="text-sm text-muted-foreground">
              Numero de intentos de contacto por WhatsApp si no hay respuesta
              (1-5 reintentos)
            </p>
            {form.formState.errors.retries && (
              <p className="text-sm text-destructive">
                {form.formState.errors.retries.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="waitlistTimeout">
              Timeout de lista de espera (minutos)
            </Label>
            <Input
              {...form.register("waitlistTimeout", { valueAsNumber: true })}
              id="waitlistTimeout"
              type="number"
              min={5}
              max={120}
            />
            <p className="text-sm text-muted-foreground">
              Tiempo que tiene un paciente para responder antes de pasar al
              siguiente en la lista de espera (5-120 minutos)
            </p>
            {form.formState.errors.waitlistTimeout && (
              <p className="text-sm text-destructive">
                {form.formState.errors.waitlistTimeout.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
