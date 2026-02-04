"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { scheduleSchema, ScheduleInput } from "@/lib/validators/onboarding";
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
import { cn } from "@/lib/utils";

const DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
];

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step4Schedule({ onNext, onBack }: Step4Props) {
  const { data, setStepData } = useOnboardingStore();

  const form = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: data.schedule || {
      workDays: [1, 2, 3, 4, 5],
      openTime: "09:00",
      closeTime: "18:00",
      lunchStart: "",
      lunchEnd: "",
    },
  });

  const workDays = form.watch("workDays");
  const lunchStart = form.watch("lunchStart");

  const toggleDay = (day: number) => {
    const current = form.getValues("workDays");
    if (current.includes(day)) {
      form.setValue("workDays", current.filter((d) => d !== day));
    } else {
      form.setValue("workDays", [...current, day].sort());
    }
  };

  const onSubmit = (values: ScheduleInput) => {
    setStepData("schedule", values);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horario de atencion</CardTitle>
        <CardDescription>
          Configura los dias y horarios de tu clinica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Dias de atencion</Label>
            <div className="flex gap-2 mt-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "w-12 h-12 rounded-lg border text-sm font-medium transition-colors",
                    workDays.includes(day.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-input"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {form.formState.errors.workDays && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.workDays.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openTime">Hora de apertura</Label>
              <Input type="time" {...form.register("openTime")} id="openTime" />
              {form.formState.errors.openTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.openTime.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime">Hora de cierre</Label>
              <Input
                type="time"
                {...form.register("closeTime")}
                id="closeTime"
              />
              {form.formState.errors.closeTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.closeTime.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!lunchStart}
                onChange={(e) => {
                  if (!e.target.checked) {
                    form.setValue("lunchStart", "");
                    form.setValue("lunchEnd", "");
                  } else {
                    form.setValue("lunchStart", "13:00");
                    form.setValue("lunchEnd", "14:00");
                  }
                }}
                className="rounded border-input"
              />
              Horario de almuerzo
            </Label>
            {lunchStart && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="lunchStart">Inicio</Label>
                  <Input
                    type="time"
                    {...form.register("lunchStart")}
                    id="lunchStart"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunchEnd">Fin</Label>
                  <Input
                    type="time"
                    {...form.register("lunchEnd")}
                    id="lunchEnd"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Atras
            </Button>
            <Button type="submit" className="flex-1">
              Continuar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
