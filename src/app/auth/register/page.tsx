"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FieldValues,
  SubmitHandler,
  UseFormRegisterReturn,
  useForm,
} from "react-hook-form";
import { CredentialsRegister } from "@/types/authType";
import { registerUser } from "@/app/api/auth";
import { validateInviteToken } from "@/app/api/beta";
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
import { ImpruVWordmark } from "@/components/brand/ImpruVWordmark";

type TokenStatus =
  | "validating"
  | "valid"
  | "no_token"
  | "invalid"
  | "used"
  | "expired"
  | "error";

const TOKEN_ERROR_MESSAGES: Record<string, string> = {
  no_token: "El registro está cerrado. Solicitá acceso en la beta.",
  invalid: "Este link de invitación no es válido.",
  used: "Este link ya fue utilizado.",
  expired: "Este link expiró. Contactá al administrador.",
  error: "No se pudo validar el link. Intentá de nuevo.",
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? "";

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");
  const { register, handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validar el token en background al montar
  useEffect(() => {
    if (!inviteToken) {
      setTokenStatus("no_token");
      return;
    }
    validateInviteToken(inviteToken).then((result) => {
      if (result.valid) {
        setTokenStatus("valid");
      } else {
        setTokenStatus(result.reason as TokenStatus);
      }
    }).catch(() => setTokenStatus("error"));
  }, [inviteToken]);

  const onSubmit = async (data: CredentialsRegister) => {
    setIsLoading(true);
    setError(null);

    if (data.password !== data.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        confirmPassword: data.confirmPassword,
        inviteToken,
      });

      const responseData = await response.json();

      if (response.status !== 200) {
        setError(responseData.message || "Error al crear la cuenta");
      } else {
        router.push("/auth/login");
      }
    } catch {
      setError("Error al crear la cuenta");
    }

    setIsLoading(false);
  };

  // Pantalla de carga mientras valida el token
  if (tokenStatus === "validating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090B]">
        <p className="text-[#A1A1AA] text-sm">Verificando acceso...</p>
      </div>
    );
  }

  // Beta cerrada o token inválido — mostrar mensaje y link a /beta
  if (tokenStatus !== "valid") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08090B] px-5 py-12 text-[#F5F5F7]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_34%)]" />
        <Card className="relative w-full max-w-md rounded-[32px] border-white/[0.08] bg-[#17181D]/95 p-8 shadow-[0_28px_90px_rgba(0,0,0,0.46)] text-center">
          <div className="flex justify-center mb-6">
            <ImpruVWordmark size="sm" color="#F8FAFC" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Registro cerrado
          </h1>
          <p className="text-[#A1A1AA] text-sm leading-6 mb-8">
            {TOKEN_ERROR_MESSAGES[tokenStatus] ?? TOKEN_ERROR_MESSAGES.error}
          </p>
          {tokenStatus === "no_token" && (
            <Button
              asChild
              className="w-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] font-semibold text-white"
            >
              <Link href="/beta">Solicitar acceso a la beta</Link>
            </Button>
          )}
          <div className="mt-4 text-center text-sm text-[#A1A1AA]">
            ¿Ya tenés cuenta?{" "}
            <Link href="/auth/login" className="font-medium text-[#C4B5FD] underline-offset-4 hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Token válido — mostrar formulario de registro
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
              Crear cuenta
            </CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Acceso beta · Empezá a ordenar rutinas y atletas
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
            >
              <AuthField label="Nombre" id="name">
                <Input
                  id="name"
                  type="text"
                  autoComplete="given-name"
                  required
                  {...register("name")}
                  placeholder="Tu nombre"
                  className={inputClassName}
                />
              </AuthField>

              <AuthField label="Correo electronico" id="email">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  {...register("email")}
                  placeholder="tu@email.com"
                  className={inputClassName}
                />
              </AuthField>

              <AuthField label="Contrasena" id="password">
                <PasswordInput
                  id="password"
                  show={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  registerProps={register("password")}
                />
              </AuthField>

              <AuthField label="Confirmar contrasena" id="confirmPassword">
                <PasswordInput
                  id="confirmPassword"
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  registerProps={register("confirmPassword")}
                />
              </AuthField>

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] font-semibold text-white shadow-[0_16px_42px_rgba(139,92,246,0.28)] hover:opacity-95"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>

              <div className="text-center text-sm text-[#A1A1AA]">
                Ya tenés cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-[#C4B5FD] underline-offset-4 hover:underline"
                >
                  Inicia sesion aqui
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
}

const inputClassName =
  "w-full rounded-2xl border-white/[0.08] bg-[#0F1014] text-white placeholder:text-[#71717A] focus-visible:ring-[#8B5CF6]/40";

function AuthField({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[#D4D4D8]">
        {label}
      </Label>
      {children}
    </div>
  );
}

function PasswordInput({
  id,
  show,
  onToggle,
  registerProps,
}: {
  id: string;
  show: boolean;
  onToggle: () => void;
  registerProps: UseFormRegisterReturn;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete="new-password"
        required
        {...registerProps}
        placeholder="********"
        className={`${inputClassName} pr-10`}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={onToggle}
      >
        {show ? (
          <EyeOffIcon className="h-4 w-4 text-[#A1A1AA]" />
        ) : (
          <EyeIcon className="h-4 w-4 text-[#A1A1AA]" />
        )}
      </Button>
    </div>
  );
}
