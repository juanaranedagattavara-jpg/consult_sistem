"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface BotConfigData {
  tone: "formal" | "casual" | "amigable";
  customPrompts: string;
  faqs: { question: string; answer: string }[];
  welcomeMessage: string;
  afterHoursMessage: string;
}

const TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "amigable", label: "Amigable" },
] as const;

export function BotConfigForm() {
  const user = useQuery(api.users.getCurrentUser);
  const updateBot = useMutation(api.clinics.updateClinicBot);

  const form = useForm<BotConfigData>({
    defaultValues: {
      tone: "amigable",
      customPrompts: "",
      faqs: [],
      welcomeMessage: "",
      afterHoursMessage: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user?.clinic?.botConfig) {
      const botConfig = user.clinic.botConfig;
      form.reset({
        tone: (botConfig.tone as "formal" | "casual" | "amigable") || "amigable",
        customPrompts: botConfig.customPrompts?.join("\n") || "",
        faqs: botConfig.faqs || [],
        welcomeMessage: botConfig.welcomeMessage || "",
        afterHoursMessage: botConfig.afterHoursMessage || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: BotConfigData) => {
    if (!user?.clinicId) return;

    try {
      // Convert customPrompts string to array (split by newlines, filter empty)
      const customPromptsArray = data.customPrompts
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      await updateBot({
        clinicId: user.clinicId,
        botConfig: {
          tone: data.tone,
          customPrompts: customPromptsArray.length > 0 ? customPromptsArray : undefined,
          faqs: data.faqs.length > 0 ? data.faqs : undefined,
          welcomeMessage: data.welcomeMessage,
          afterHoursMessage: data.afterHoursMessage,
        },
      });
      toast.success("Configuracion del bot actualizada");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message);
    }
  };

  const selectedTone = form.watch("tone");

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion del Bot</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tone Selector */}
          <div>
            <Label>Tono del bot</Label>
            <div className="flex gap-2 mt-2">
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => form.setValue("tone", option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedTone === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-input"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Define como se comunicara el bot con tus pacientes
            </p>
          </div>

          {/* Welcome Message */}
          <div>
            <Label htmlFor="welcomeMessage">Mensaje de bienvenida</Label>
            <Textarea
              {...form.register("welcomeMessage")}
              id="welcomeMessage"
              rows={3}
              className="mt-2"
              placeholder="Hola! Soy el asistente virtual de la clinica..."
            />
            <p className="text-sm text-muted-foreground mt-1">
              Mensaje que reciben los pacientes al iniciar una conversacion
            </p>
          </div>

          {/* After Hours Message */}
          <div>
            <Label htmlFor="afterHoursMessage">Mensaje fuera de horario</Label>
            <Textarea
              {...form.register("afterHoursMessage")}
              id="afterHoursMessage"
              rows={3}
              className="mt-2"
              placeholder="Estamos fuera de horario. Te contactaremos pronto..."
            />
            <p className="text-sm text-muted-foreground mt-1">
              Mensaje automatico cuando contactan fuera del horario de atencion
            </p>
          </div>

          {/* Custom Prompts */}
          <div>
            <Label htmlFor="customPrompts">Instrucciones personalizadas</Label>
            <Textarea
              {...form.register("customPrompts")}
              id="customPrompts"
              rows={4}
              className="mt-2"
              placeholder="Una instruccion por linea...&#10;Ejemplo: Siempre menciona que aceptamos todas las Isapres&#10;Ejemplo: Recuerda ofrecer parking gratuito"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Instrucciones adicionales para el bot (una por linea)
            </p>
          </div>

          {/* FAQs Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Preguntas frecuentes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ question: "", answer: "" })}
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar FAQ
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              El bot usara estas respuestas cuando los pacientes hagan preguntas similares
            </p>
            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    No hay preguntas frecuentes configuradas
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ question: "", answer: "" })}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Agregar primera FAQ
                  </Button>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">FAQ {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 hover:bg-muted rounded"
                        title="Eliminar FAQ"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`faq-question-${index}`} className="text-sm">
                          Pregunta
                        </Label>
                        <Input
                          {...form.register(`faqs.${index}.question`)}
                          id={`faq-question-${index}`}
                          placeholder="Ej: Cuales son los horarios de atencion?"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`faq-answer-${index}`} className="text-sm">
                          Respuesta
                        </Label>
                        <Textarea
                          {...form.register(`faqs.${index}.answer`)}
                          id={`faq-answer-${index}`}
                          placeholder="Ej: Atendemos de lunes a viernes de 9:00 a 18:00"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar configuracion"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
