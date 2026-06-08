"use client";

import { useState } from "react";
import Link from "next/link";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { CredentialsLogin } from "@/types/authType";
import { loginUser } from "@/app/api/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import AuthGate from "@/components/auth/AuthGate";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { ImpruVWordmark } from "@/components/brand/ImpruVWordmark";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: mutateAuthStatus } = useAuthStatus();
  const { register, handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: CredentialsLogin) => {
    setIsLoading(true);
    const response = await loginUser(data);
    const responseData = await response.json();

    if (response.status !== 200) {
      setError(responseData.message || "Error desconocido");
      setIsLoading(false);
    } else {
      await mutateAuthStatus("authenticated", { revalidate: false });
      router.replace("/dashboard");
    }
  };

  return (
    <AuthGate mode="redirect-if-auth">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08090B] px-5 py-12 text-[#F5F5F7] sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(168,85,247,0.14),transparent_30%)]" />
        <Card className="relative w-full max-w-md rounded-[32px] border-white/[0.08] bg-[#17181D]/95 shadow-[0_28px_90px_rgba(0,0,0,0.46)]">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center">
              <span className="flex items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0F1014] px-4 py-3">
                <ImpruVWordmark size="sm" color="#F8FAFC" />
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Iniciar sesion
            </CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Accede a tu dashboard de coach
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#D4D4D8]">
                  Correo electronico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  {...register("email")}
                  placeholder="tu@email.com"
                  className="w-full rounded-2xl border-white/[0.08] bg-[#0F1014] text-white placeholder:text-[#71717A] focus-visible:ring-[#8B5CF6]/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#D4D4D8]">
                  Contrasena
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    {...register("password")}
                    placeholder="********"
                    className="w-full rounded-2xl border-white/[0.08] bg-[#0F1014] pr-10 text-white placeholder:text-[#71717A] focus-visible:ring-[#8B5CF6]/40"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-[#A1A1AA]" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-[#A1A1AA]" />
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
                    {error}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] font-semibold text-white shadow-[0_16px_42px_rgba(139,92,246,0.28)] hover:opacity-95"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesion..." : "Iniciar sesion"}
              </Button>

              <div className="text-center text-sm text-[#A1A1AA]">
                No tienes cuenta?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-[#C4B5FD] underline-offset-4 hover:underline"
                >
                  Registrate aqui
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
}
