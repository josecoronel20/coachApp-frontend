"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Save, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Routine } from "@/types/routineType";
import { useForm } from "react-hook-form";
import EditRoutineSection from "@/components/reusable/editRoutineSection/EditRoutineSection";
import { NewAthlete } from "@/types/athleteType";
import { createNewAthlete } from "@/app/api/coach";
import { useRouter } from "next/navigation";

const NewAthletePage = () => {
  const router = useRouter();
  const { register, watch } = useForm<NewAthlete>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      routine: [],
      coachId: "",
      paymentDate: "",
      diet: "",
    },
  });

  const formValues = watch();
  const [isRoutineParsed, setIsRoutineParsed] = useState(false);
  const [routine, setRoutine] = useState<Routine>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogData, setDialogData] = useState<{
    isSuccess: boolean;
    message: string;
  }>({ isSuccess: false, message: "" });

  const handleTransformRoutine = () => {
    // Simular el proceso de parseo con la API de OpenAI
    console.log("Transformando rutina:", formValues.routine);

    // Simular delay de procesamiento
    setTimeout(() => {
      setRoutine([[]
      ]);
      setIsRoutineParsed(true);
    }, 1000);
  };

  const handleCreateAthlete = async (data: NewAthlete) => {
    console.log("handleCreateAthlete");
    try {
      const response = await createNewAthlete({
        ...data,
        routine: routine as Routine,
      });
      const responseData = await response.json();

      const isSuccess = response.status === 201;
      setDialogData({
        isSuccess,
        message: responseData.message,
      });
      setShowDialog(true);

      if (isSuccess) {
        // Redirect to dashboard after successful creation
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
    <main className="min-h-screen bg-background pt-16 pb-10">
      {/* Header */}
      <header className="flex flex-col items-center justify-between p-4 border-b bg-card gap-4">
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
      <div className="fixed bottom-0 w-full bg-background p-2">
        <Button
          onClick={() => handleCreateAthlete(formValues as NewAthlete)}
          className="bg-primary hover:bg-primary/90 w-full"
          disabled={!isRoutineParsed}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Nuevo Atleta
        </Button>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de datos básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Atleta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre *
                </label>
                <Input {...register("name")} placeholder="Nombre completo" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email (opcional)
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Teléfono *
                </label>
                <Input {...register("phone")} placeholder="+1234567890" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Plan de dieta (opcional)
                </label>
                <Textarea
                  {...register("diet")}
                  placeholder="Describe la dieta del atleta..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sección de rutina */}
          <Card>
            <CardHeader>
              <CardTitle>Rutina de Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              {!isRoutineParsed ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rutina (cualquier formato)
                    </label>
                    <Textarea
                      {...register("routine")}
                      placeholder="Escribe la rutina en cualquier formato..."
                      rows={10}
                    />
                  </div>
                  <Button
                    onClick={handleTransformRoutine}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!formValues.routine.length}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Transformar Rutina
                  </Button>
                </div>
              ) : (
                <EditRoutineSection
                  routine={routine}
                  setRoutine={setRoutine}
                  isNewRoutine={true}
                  athleteId="" // Add this prop
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Dialog */}
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
            className={`p-4 rounded-lg ${
              dialogData.isSuccess
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">{dialogData.message}</p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default NewAthletePage;
