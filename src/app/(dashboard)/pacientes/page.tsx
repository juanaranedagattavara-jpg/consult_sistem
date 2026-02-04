import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PacientesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pacientes</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold mb-2">Proximamente</h2>
          <p className="text-muted-foreground">
            La gestion de pacientes se implementara en la Fase 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
