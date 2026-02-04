"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { FileUpload } from "@/components/ui/file-upload";
import { useFileUrl } from "@/hooks/use-file-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AppearanceData {
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export function AppearanceForm() {
  const user = useQuery(api.users.getCurrentUser);
  const updateAppearance = useMutation(api.clinics.updateClinicAppearance);
  const logoUrl = useFileUrl(user?.clinic?.logo);

  const form = useForm<AppearanceData>({
    defaultValues: {
      logo: null,
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
    },
  });

  // Reset form values when user data loads
  useEffect(() => {
    if (user?.clinic) {
      form.reset({
        logo: user.clinic.logo ? String(user.clinic.logo) : null,
        primaryColor: user.clinic.colors?.primary || "#2563eb",
        secondaryColor: user.clinic.colors?.secondary || "#64748b",
      });
    }
  }, [user, form]);

  const primaryColor = form.watch("primaryColor");
  const secondaryColor = form.watch("secondaryColor");

  const onSubmit = async (data: AppearanceData) => {
    if (!user?.clinicId) return;

    try {
      await updateAppearance({
        clinicId: user.clinicId,
        logo: data.logo ? (data.logo as Id<"_storage">) : undefined,
        colors: {
          primary: data.primaryColor,
          secondary: data.secondaryColor,
        },
      });
      toast.success("Apariencia actualizada");

      // Update CSS variables for immediate visual feedback
      document.documentElement.style.setProperty("--primary", data.primaryColor);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message);
    }
  };

  const handleLogoUpload = (storageId: string) => {
    form.setValue("logo", storageId);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Logo de la clinica</Label>
            <FileUpload
              onUpload={handleLogoUpload}
              currentImage={logoUrl || undefined}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Color primario</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  {...form.register("primaryColor")}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  {...form.register("primaryColor")}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Color secundario</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  {...form.register("secondaryColor")}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  {...form.register("secondaryColor")}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">Vista previa</p>
            <div className="flex items-center gap-4">
              <div
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Boton primario
              </div>
              <div
                className="px-4 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                Boton secundario
              </div>
            </div>
            <div
              className="mt-3 h-2 rounded"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            />
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
