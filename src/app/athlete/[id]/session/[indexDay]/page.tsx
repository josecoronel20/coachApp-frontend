"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import ExerciseView from "@/components/ExerciseView";
import {
  useAthleteSessionStore,
  ExerciseDef,
} from "@/store/useAthleteSessionStore";
import { useAthleteStore } from "@/store/useAthleteStore";
import { getAthleteById, saveSession } from "@/app/api/athlete";

/**
 * Página de ejecución de sesión de entrenamiento
 * Maneja la lógica de sesión: inicializar, editar reps/weight, navegar ejercicios, finalizar
 */
const SessionPage = () => {
  const params = useParams();
  const athleteId = params.id as string;
  const indexDay = parseInt(params.indexDay as string) - 1; // Convertir a 0-based index

  // Estado local para manejar la hidratación
  const [isClient, setIsClient] = useState(false);

  // Store de sesión
  const {
    sessionProgress,
    sessionMeta,
    initSession,
    setReps,
    setWeight,
    nextExercise,
    prevExercise,
    finalizeSession,
  } = useAthleteSessionStore();

  // Obtener datos del atleta desde el store
  const { athlete, setAthlete } = useAthleteStore();
  const router = useRouter();

  // Asegurar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inicializar sesión si no está activa para este día
  useEffect(() => {
    if (!isClient || !athlete) return;

    const dayExercises = athlete.routine[indexDay] || [];

    // Siempre reinicializar la sesión cuando el atleta cambie
    console.log("Inicializando sesión para día:", indexDay);

    // Convertir ejercicios al formato esperado por el store
    const exerciseDefs: ExerciseDef[] = dayExercises.map((exercise) => {
      const lastHistory =
        exercise.exerciseHistory?.[exercise.exerciseHistory.length - 1];
      console.log(
        `Exercise: ${exercise.exercise}, Last weight: ${
          lastHistory?.weight || 0
        }`
      ); // ← Agregar este log
      return {
        setsCount: exercise.sets,
        weight: lastHistory?.weight || 0, // Usar peso del historial o 0 por defecto
        rangeMin: exercise.rangeMin,
        rangeMax: exercise.rangeMax,
        lastHistory,
      };
    });

    initSession(indexDay, exerciseDefs);
  }, [isClient, athlete, indexDay, initSession]);

  // Mostrar loading mientras se hidrata
  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // Verificar que el atleta esté cargado
  if (!athlete) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del atleta...</p>
        </div>
      </div>
    );
  }

  // Verificar que la sesión esté activa
  if (!sessionMeta.sessionActive || sessionProgress.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Inicializando sesión...</p>
        </div>
      </div>
    );
  }

  const currentExerciseIndex = sessionMeta.currentExerciseIndex;
  const currentExercise = athlete.routine[indexDay][currentExerciseIndex];
  const currentSessionExercise = sessionProgress[currentExerciseIndex];

  // Handlers para el ejercicio actual
  const handleSetReps = (setIndex: number, reps: number) => {
    setReps(currentExerciseIndex, setIndex, reps);
  };

  const handleSetWeight = (weight: number) => {
    setWeight(currentExerciseIndex, weight);
  };

  // Handler para finalizar sesión
  const handleFinalizeSession = async () => {
    try {
      const snapshot = finalizeSession();
      const response = await saveSession(
        athleteId,
        indexDay,
        snapshot.sessionProgress
      );

      if (response.status === 200) {
        console.log(
          "�� sessionProgress:",
          JSON.stringify(snapshot.sessionProgress, null, 2)
        );

        // Refrescar datos del backend en lugar de usar el store local
        const updatedResponse = await getAthleteById(athleteId);
        const updatedAthlete = await updatedResponse.json();

        // Actualizar store y localStorage con datos frescos del backend
        setAthlete(updatedAthlete);
        localStorage.setItem("athlete", JSON.stringify(updatedAthlete));

        router.push(`/athlete/${athleteId}`);
      } else {
        console.error("Error al finalizar sesión:", response.statusText);
      }

      // TODO: Navegar a página de resumen o dashboard
    } catch (error) {
      console.error("Error al finalizar sesión:", error);
      alert("Error al finalizar la sesión");
    }
  };

  const isLastExercise = currentExerciseIndex === sessionProgress.length - 1;
  const isFirstExercise = currentExerciseIndex === 0;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            Día {indexDay + 1} • Ejercicio {currentExerciseIndex + 1}/
            {sessionProgress.length}
          </h1>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto">
        <ExerciseView
          exerciseIndex={currentExerciseIndex}
          exerciseDefinition={{
            name: currentExercise.exercise,
            setsCount: currentExercise.sets,
            rangeMin: currentExercise.rangeMin,
            rangeMax: currentExercise.rangeMax,
            weight: currentSessionExercise.weight, // Usar el peso de la sesión actual
            lastHistory:
              currentExercise.exerciseHistory?.[
                currentExercise.exerciseHistory.length - 1
              ],
          }}
          sessionExercise={currentSessionExercise}
          onSetReps={handleSetReps}
          onSetWeight={handleSetWeight}
        />
      </div>

      {/* Footer con navegación */}
      <div className="bg-background border-t p-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={prevExercise}
            disabled={isFirstExercise}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <Button
            size="sm"
            onClick={isLastExercise ? handleFinalizeSession : nextExercise}
            className={isLastExercise ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isLastExercise ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Finalizar Sesión
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
