"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { brandingSchema, BrandingInput } from "@/lib/validators/onboarding";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Branding({ onNext, onBack }: Step3Props) {
  const { data, setStepData } = useOnboardingStore();

  const form = useForm<BrandingInput>({
    resolver: zodResolver(brandingSchema),
    defaultValues: data.branding || {
      logo: null,
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
    },
  });

  const primaryColor = form.watch("primaryColor");
  const secondaryColor = form.watch("secondaryColor");

  const onSubmit = (values: BrandingInput) => {
    setStepData("branding", values);
    onNext();
  };

  const handleLogoUpload = (storageId: string) => {
    form.setValue("logo", storageId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalización</CardTitle>
        <CardDescription>Logo y colores de tu clínica</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>Logo de la clínica (opcional)</Label>
            <FileUpload
              onUpload={handleLogoUpload}
              currentImage={data.branding?.logo}
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
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
              {form.formState.errors.primaryColor && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.primaryColor.message}
                </p>
              )}
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
                  placeholder="#64748b"
                  className="flex-1"
                />
              </div>
              {form.formState.errors.secondaryColor && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.secondaryColor.message}
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Vista previa</p>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-10 rounded flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Primario
              </div>
              <div
                className="w-20 h-10 rounded flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: secondaryColor }}
              >
                Secundario
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Atrás
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
