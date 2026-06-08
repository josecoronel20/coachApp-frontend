"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, CheckCircle, XCircle, Info } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { CreateAthleteBody } from "@/types/athleteType";
import { createNewAthlete } from "@/app/api/coach";
import { getApiErrorMessage } from "@/lib/apiError";
import { useRouter } from "next/navigation";

const SUCCESS_FOLLOW_UP =
  "Completá la rutina en la ficha del atleta antes de compartir el link.";

const NewAthletePage = () => {
  const router = useRouter();
  const { register, watch } = useForm<CreateAthleteBody>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      diet: "",
    },
  });

  const formValues = watch();
  const canCreate =
    formValues.name.trim().length > 0 && formValues.phone.trim().length > 0;

  const [showDialog, setShowDialog] = useState(false);
  const [dialogData, setDialogData] = useState<{
    isSuccess: boolean;
    message: string;
    detail?: string;
  }>({ isSuccess: false, message: "" });

  const handleCreateAthlete = async (data: CreateAthleteBody) => {
    try {
      const response = await createNewAthlete({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        diet: "",
      });
      const isSuccess = response.status === 201;
      const responseData = isSuccess ? await response.json() : null;
      const errorMessage = isSuccess
        ? ""
        : await getApiErrorMessage(response, "No se pudo crear el atleta");

      setDialogData({
        isSuccess,
        message: isSuccess ? "Atleta creado exitosamente" : errorMessage,
        detail: isSuccess ? SUCCESS_FOLLOW_UP : undefined,
      });
      setShowDialog(true);

      if (isSuccess) {
        setTimeout(() => {
          router.push(`/dashboard/athlete/${responseData.athlete.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating athlete:", error);
      setDialogData({
        isSuccess: false,
        message: "Error de conexión",
      });
      setShowDialog(true);
    }
  };

  return (
    <main className="app-page pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-16">
      <header className="flex flex-col items-center justify-between gap-4 border-b border-border-subtle bg-bg-surface-1 p-4">
        <div className="flex items-center gap-4 justify-between w-full">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Atleta</h1>
        </div>
      </header>

      <div className="app-fixed-bottom fixed bottom-0 z-30 w-full border-t border-border-subtle bg-bg-base/90 px-2 pt-2 backdrop-blur-xl">
        <Button
          onClick={() => handleCreateAthlete(formValues)}
          className="bg-primary hover:bg-primary/90 w-full max-w-4xl mx-auto flex"
          disabled={!canCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear atleta
        </Button>
      </div>

      <div className="container mx-auto p-6 max-w-lg space-y-6">
        <Card className="border-muted-foreground/20 bg-muted/30">
          <CardContent className="pt-6 flex gap-3 text-sm text-muted-foreground">
            <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p>
              La rutina de entrenamiento se configura después de crear el atleta,
              desde su ficha, con el editor de días y ejercicios.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del atleta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="name">
                Nombre *
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email (opcional)
              </label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="phone">
                Teléfono *
              </label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1234567890"
              />
            </div>

          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogData.isSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {dialogData.isSuccess ? "Éxito" : "Error"}
            </DialogTitle>
          </DialogHeader>
          <div
            className={`p-4 rounded-lg space-y-2 ${
              dialogData.isSuccess
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">{dialogData.message}</p>
            {dialogData.detail ? (
              <p className="text-sm">{dialogData.detail}</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default NewAthletePage;
