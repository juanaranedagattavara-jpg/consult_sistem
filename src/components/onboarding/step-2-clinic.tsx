"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { clinicSchema, ClinicInput } from "@/lib/validators/onboarding";
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

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Clinic({ onNext, onBack }: Step2Props) {
  const { data, setStepData } = useOnboardingStore();

  const form = useForm<ClinicInput>({
    resolver: zodResolver(clinicSchema),
    defaultValues: data.clinic || { name: "", taxId: "", address: "", phone: "" },
  });

  const onSubmit = (values: ClinicInput) => {
    setStepData("clinic", values);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la clinica</CardTitle>
        <CardDescription>Informacion basica de tu clinica</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la clinica</Label>
            <Input {...form.register("name")} id="name" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">RUT</Label>
            <Input
              {...form.register("taxId")}
              id="taxId"
              placeholder="12.345.678-9"
            />
            {form.formState.errors.taxId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.taxId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Input {...form.register("address")} id="address" />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input
              {...form.register("phone")}
              id="phone"
              placeholder="+56 9 1234 5678"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
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
