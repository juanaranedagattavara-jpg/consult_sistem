"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { registerSchema, RegisterInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function RegisterForm() {
  const { signIn } = useAuthActions();
  const createClinicForUser = useMutation(api.users.createClinicForUser);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      // Step 1: Register with Convex Auth (creates authAccount)
      await signIn("password", {
        email: data.email,
        password: data.password,
        flow: "signUp",
      });

      // Step 2: Create clinic and user record in our tables
      await createClinicForUser({
        name: data.name,
        email: data.email,
      });

      router.push("/onboarding");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrar";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>Registra tu clinica</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input {...form.register("name")} id="name" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input {...form.register("email")} type="email" id="email" />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Contrasena</Label>
            <Input {...form.register("password")} type="password" id="password" />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Contrasena</Label>
            <Input {...form.register("confirmPassword")} type="password" id="confirmPassword" />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </form>
        <p className="text-center text-sm mt-4">
          Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia sesion</Link>
        </p>
      </CardContent>
    </Card>
  );
}
