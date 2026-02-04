"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/dashboard/header";
import { Nav } from "@/components/dashboard/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const [navOpen, setNavOpen] = useState(false);

  // Auth check: redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  // Onboarding check: redirect to onboarding if not completed
  useEffect(() => {
    if (user && !user.clinic?.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [user, router]);

  // Apply white label colors from clinic settings
  useEffect(() => {
    if (user?.clinic?.colors) {
      const { primary, secondary } = user.clinic.colors;

      // Apply primary color
      if (primary) {
        document.documentElement.style.setProperty("--primary", primary);
        // Convert hex to HSL for CSS variable compatibility
        const primaryHsl = hexToHsl(primary);
        if (primaryHsl) {
          document.documentElement.style.setProperty(
            "--primary",
            `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`
          );
        }
      }

      // Apply secondary color
      if (secondary) {
        document.documentElement.style.setProperty("--secondary", secondary);
        const secondaryHsl = hexToHsl(secondary);
        if (secondaryHsl) {
          document.documentElement.style.setProperty(
            "--secondary",
            `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`
          );
        }
      }
    }
  }, [user?.clinic?.colors]);

  // Loading state while checking auth
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - render nothing while redirecting
  if (user === null) {
    return null;
  }

  // Not onboarded - render nothing while redirecting
  if (!user.clinic?.onboardingCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header with menu toggle for mobile */}
      <Header onMenuToggle={() => setNavOpen(!navOpen)} />

      {/* Navigation - horizontal on desktop, slide-out on mobile */}
      <Nav isOpen={navOpen} onClose={() => setNavOpen(false)} />

      {/* Main content area */}
      <main className="lg:ml-0 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

/**
 * Convert hex color to HSL values
 * Used for CSS variable compatibility with shadcn/ui
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
