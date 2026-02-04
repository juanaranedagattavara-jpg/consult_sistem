"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Step1Props {
  onNext: () => void;
}

export function Step1Account({ onNext }: Step1Props) {
  const user = useQuery(api.users.getCurrentUser);
  const { setStepData } = useOnboardingStore();

  const handleContinue = () => {
    if (user) {
      setStepData("account", { name: user.name, email: user.email });
      onNext();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirma tu cuenta</CardTitle>
        <CardDescription>Verifica que tus datos sean correctos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Nombre</p>
          <p className="font-medium">{user?.name || "Cargando..."}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user?.email || "Cargando..."}</p>
        </div>
        <Button onClick={handleContinue} className="w-full" disabled={!user}>
          Continuar
        </Button>
      </CardContent>
    </Card>
  );
}
