"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicForm } from "@/components/settings/clinic-form";
import { BotConfigForm } from "@/components/settings/bot-config-form";
import { TimingForm } from "@/components/settings/timing-form";

export default function ClinicSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuracion de la clinica</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="bot">Bot WhatsApp</TabsTrigger>
          <TabsTrigger value="timing">Tiempos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <ClinicForm />
        </TabsContent>

        <TabsContent value="bot">
          <BotConfigForm />
        </TabsContent>

        <TabsContent value="timing">
          <TimingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
