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

const clinicSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  taxId: z.string().min(8, "RUT invalido"),
  address: z.string().min(5, "Direccion requerida"),
  phone: z.string().min(9, "Telefono invalido"),
  email: z.string().email("Email invalido"),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export function ClinicForm() {
  const user = useQuery(api.users.getCurrentUser);
  const updateClinic = useMutation(api.clinics.updateClinicGeneral);

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: "",
      taxId: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user?.clinic) {
      form.reset({
        name: user.clinic.name || "",
        taxId: user.clinic.taxId || "",
        address: user.clinic.address || "",
        phone: user.clinic.phone || "",
        email: user.clinic.email || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ClinicFormData) => {
    try {
      await updateClinic({
        clinicId: user!.clinicId,
        ...data,
      });
      toast.success("Datos actualizados correctamente");
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
        <CardTitle>Informacion general</CardTitle>
        <CardDescription>
          Datos basicos de tu clinica
        </CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input {...form.register("email")} id="email" type="email" />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
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
