"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentClinic } from "@/hooks/use-current-clinic";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  Settings,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/lista-espera", label: "Lista de Espera", icon: Clock },
  { href: "/settings/clinic", label: "Configuracion", icon: Settings },
];

interface NavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Nav({ isOpen, onClose }: NavProps) {
  const pathname = usePathname();
  const { clinic } = useCurrentClinic();
  const primaryColor = clinic?.colors?.primary || "#2563eb";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Navigation */}
      <nav
        className={cn(
          "fixed lg:relative z-50 lg:z-auto",
          "w-64 lg:w-auto",
          "h-full lg:h-auto",
          "bg-background lg:bg-transparent",
          "border-r lg:border-r-0 lg:border-b border-border",
          "transition-transform lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile close button */}
        <div className="flex justify-end p-4 lg:hidden">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col lg:flex-row lg:px-4 lg:py-2 gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 lg:py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={isActive ? { backgroundColor: primaryColor } : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
