"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { setupSchema, SetupInput } from "@/lib/validators/onboarding";
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

const DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

interface Step5Props {
  onBack: () => void;
}

export function Step5Setup({ onBack }: Step5Props) {
  const router = useRouter();
  const { data, setStepData, reset } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const completeOnboarding = useMutation(api.clinics.completeOnboarding);

  const form = useForm<SetupInput>({
    resolver: zodResolver(setupSchema),
    defaultValues: data.setup || {
      professionalName: "",
      serviceName: "",
      serviceDuration: 30,
    },
  });

  const selectedDuration = form.watch("serviceDuration");

  const onSubmit = async (values: SetupInput) => {
    setLoading(true);
    setStepData("setup", values);

    try {
      // Validate that all required data is present
      if (!data.clinic || !data.branding || !data.schedule) {
        throw new Error("Faltan datos de pasos anteriores");
      }

      // Call completeOnboarding mutation with all collected data
      await completeOnboarding({
        clinic: {
          name: data.clinic.name,
          taxId: data.clinic.taxId,
          address: data.clinic.address,
          phone: data.clinic.phone,
        },
        branding: {
          logo: data.branding.logo
            ? (data.branding.logo as Id<"_storage">)
            : undefined,
          primaryColor: data.branding.primaryColor,
          secondaryColor: data.branding.secondaryColor,
        },
        schedule: {
          workDays: data.schedule.workDays,
          openTime: data.schedule.openTime,
          closeTime: data.schedule.closeTime,
          lunchStart: data.schedule.lunchStart,
          lunchEnd: data.schedule.lunchEnd,
        },
        setup: {
          professionalName: values.professionalName,
          serviceName: values.serviceName,
          serviceDuration: values.serviceDuration,
        },
      });

      toast.success("¡Configuracion completada!");
      reset();
      router.push("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al completar";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración inicial</CardTitle>
        <CardDescription>
          Crea tu primer profesional y servicio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="professionalName">Nombre del profesional</Label>
            <Input
              {...form.register("professionalName")}
              id="professionalName"
              placeholder="Dr. Juan Pérez"
            />
            {form.formState.errors.professionalName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.professionalName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceName">Nombre del servicio</Label>
            <Input
              {...form.register("serviceName")}
              id="serviceName"
              placeholder="Consulta general"
            />
            {form.formState.errors.serviceName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.serviceName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Duración del servicio</Label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.value}
                  type="button"
                  onClick={() => form.setValue("serviceDuration", duration.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedDuration === duration.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Atrás
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Completando..." : "Completar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
