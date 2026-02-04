import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AgendaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agenda</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold mb-2">Proximamente</h2>
          <p className="text-muted-foreground">
            La agenda visual se implementara en la Fase 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
