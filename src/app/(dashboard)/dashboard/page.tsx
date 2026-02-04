"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Plus,
  List,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Citas hoy"
          value={stats?.appointmentsToday || 0}
          icon={Calendar}
        />
        <StatsCard
          title="Citas esta semana"
          value={stats?.appointmentsWeek || 0}
          icon={CalendarDays}
        />
        <StatsCard
          title="Tasa de confirmacion"
          value={`${stats?.confirmationRate || 0}%`}
          icon={CheckCircle}
        />
        <StatsCard
          title="Horas recuperadas"
          value={stats?.hoursRecovered || 0}
          icon={Clock}
          description="Este mes"
        />
      </div>

      {/* Quick Actions + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rapidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/citas/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva cita
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/agenda">
                <Calendar className="mr-2 h-4 w-4" />
                Ver agenda
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/lista-espera">
                <List className="mr-2 h-4 w-4" />
                Lista de espera
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/pacientes">
                <Users className="mr-2 h-4 w-4" />
                Pacientes
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <UpcomingAppointments />
        </div>
      </div>
    </div>
  );
}
