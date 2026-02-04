"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Type for future appointment data (Phase 3)
interface Appointment {
  patientName: string;
  serviceName: string;
  time: string;
  professional: string;
}

export function UpcomingAppointments() {
  // TODO: In Phase 3, this will query actual appointments from Convex
  // Example: const appointments = useQuery(api.appointments.getUpcoming);
  const appointments: Appointment[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Proximas citas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay citas programadas para hoy</p>
            <p className="text-sm mt-1">
              Las citas apareceran aqui cuando se creen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <p className="font-medium">{apt.patientName}</p>
                  <p className="text-sm text-muted-foreground">{apt.serviceName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{apt.time}</p>
                  <p className="text-sm text-muted-foreground">{apt.professional}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
