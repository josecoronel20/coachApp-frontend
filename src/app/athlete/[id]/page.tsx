"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useAthleteStore } from "@/store/useAthleteStore";
import BodyWeight from "./athleteViewComponents/BodyWeight";

/**
 * Página principal del atleta que muestra:
 * - Botones para cada día de la rutina
 * - Lista simple de ejercicios del día seleccionado
 * - Botón para comenzar entrenamiento
 */
const AthletePage = () => {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  // Estado local para manejar la hidratación
  const [isClient, setIsClient] = useState(false);

  // Estado para el día seleccionado
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Obtener datos del atleta desde el store
  const { athlete } = useAthleteStore();

  // Asegurar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mostrar loading mientras se hidrata
  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
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

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
  };

  const handleStartTraining = () => {
    if (selectedDayIndex !== null) {
      router.push(`/athlete/${athleteId}/session/${selectedDayIndex + 1}`);
    }
  };

  const selectedDayExercises =
    selectedDayIndex !== null ? athlete.routine[selectedDayIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto space-y-6 flex flex-col">
        {/* Header */}
        <header className="text-center  border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">{athlete.name}</h1>
            <BodyWeight />
          </div>
        </header>

        {/* Días de la rutina */}
        <div className="px-2 flex flex-col gap-4 items-center">
          <h2 className="text-xl">Rutina de entrenamiento</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {athlete.routine.map((dayExercises, dayIndex) => (
              <Button
                key={dayIndex}
                variant={selectedDayIndex === dayIndex ? "default" : "ghost"}
                className="w-fit"
                onClick={() => handleDaySelect(dayIndex)}
              >
                Día {dayIndex + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista simple de ejercicios del día seleccionado */}
        {selectedDayIndex !== null && selectedDayExercises && (
          <div className="space-y-4 p-4 m-4 border rounded-lg">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Día {selectedDayIndex + 1}
            </h2>

            {/* Lista de ejercicios */}
            <div className="space-y-2">
              {selectedDayExercises.map((exercise, exerciseIndex) => (
                <div
                  key={exerciseIndex}
                  className={`grid grid-cols-4 items-center p-3 ${
                    exerciseIndex !== selectedDayExercises.length - 1
                      ? "border-b"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 col-span-3">
                    <span className="text-foreground">{exercise.exercise}</span>
                  </div>
                  <div className="text-sm text-muted-foreground col-span-1 justify-self-end">
                    <span className="font-medium">{exercise.sets} x </span>
                    <span>
                      {exercise.rangeMin}-{exercise.rangeMax}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón para comenzar entrenamiento */}
            <div className="fixed bottom-0 left-0 right-0 p-4">
              <Button
                onClick={handleStartTraining}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
              >
                Empezar Entrenamiento
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {selectedDayIndex === null && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Selecciona un día para ver los ejercicios y comenzar tu
              entrenamiento
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AthletePage;
