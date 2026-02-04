"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useCurrentClinic } from "@/hooks/use-current-clinic";
import { useFileUrl } from "@/hooks/use-file-url";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, User, Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { clinic, user } = useCurrentClinic();
  const logoUrl = useFileUrl(clinic?.logo);
  const avatarUrl = useFileUrl(user?.avatar);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header
      className="h-16 border-b bg-background px-4 flex items-center justify-between"
      style={{
        borderColor: clinic?.colors?.secondary
          ? `${clinic.colors.secondary}20`
          : undefined,
      }}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
          ) : (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: clinic?.colors?.primary || "#2563eb" }}
            >
              {clinic?.name?.charAt(0) || "C"}
            </div>
          )}
          <span
            className="font-semibold hidden sm:inline text-foreground"
            style={{ color: clinic?.colors?.primary || undefined }}
          >
            {clinic?.name || "ConsultSystem"}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback
                style={{
                  backgroundColor: clinic?.colors?.secondary || "#64748b",
                  color: "white",
                }}
              >
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-foreground">{user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
            <User className="mr-2 h-4 w-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings/clinic")}>
            <Settings className="mr-2 h-4 w-4" />
            Configuracion
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
