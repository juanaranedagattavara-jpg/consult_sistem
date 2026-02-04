"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FileUpload } from "@/components/ui/file-upload";
import { useFileUrl } from "@/hooks/use-file-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface ProfileData {
  name: string;
  avatar: string | null;
}

export function ProfileForm() {
  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const avatarUrl = useFileUrl(user?.avatar);

  const form = useForm<ProfileData>({
    defaultValues: {
      name: "",
      avatar: null,
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        avatar: user.avatar ? String(user.avatar) : null,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileData) => {
    try {
      await updateProfile({
        name: data.name,
        avatar: data.avatar ? (data.avatar as Id<"_storage">) : undefined,
      });
      toast.success("Perfil actualizado");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message);
    }
  };

  const handleAvatarUpload = (storageId: string) => {
    form.setValue("avatar", storageId);
  };

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
        <CardTitle>Mi perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label>Foto de perfil</Label>
              <FileUpload
                onUpload={handleAvatarUpload}
                currentImage={avatarUrl || undefined}
                className="mt-2"
              />
            </div>
          </div>

          {/* Name Field (Editable) */}
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              {...form.register("name")}
              id="name"
              className="mt-2"
              placeholder="Tu nombre"
            />
          </div>

          {/* Email Field (Disabled) */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              value={user.email}
              id="email"
              disabled
              className="mt-2 bg-muted"
            />
            <p className="text-sm text-muted-foreground mt-1">
              El email no se puede cambiar
            </p>
          </div>

          {/* Role Field (Disabled) */}
          <div>
            <Label>Rol</Label>
            <Input
              value={user.role === "admin" ? "Administrador" : "Staff"}
              disabled
              className="mt-2 bg-muted"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
