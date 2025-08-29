"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Dumbbell } from "lucide-react";
import { useAthleteStore } from "@/store/useAthleteStore";

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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

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

  const selectedDayExercises = selectedDayIndex !== null 
    ? athlete.routine[selectedDayIndex] 
    : null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {athlete.name}
          </h1>
          <p className="text-gray-600">
            Selecciona un día para ver los ejercicios y comenzar tu entrenamiento
          </p>
        </div>

        {/* Días de la rutina */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Días de Entrenamiento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {athlete.routine.map((dayExercises, dayIndex) => (
              <Button
                key={dayIndex}
                variant={selectedDayIndex === dayIndex ? "default" : "outline"}
                className="h-20 flex flex-col items-center justify-center gap-1"
                onClick={() => handleDaySelect(dayIndex)}
              >
                <span className="text-lg font-semibold">Día {dayIndex + 1}</span>
                <span className="text-sm opacity-80">
                  {dayExercises.length} ejercicio{dayExercises.length !== 1 ? 's' : ''}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Lista simple de ejercicios del día seleccionado */}
        {selectedDayIndex !== null && selectedDayExercises && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Ejercicios del Día {selectedDayIndex + 1}
            </h2>

            {/* Lista de ejercicios */}
            <div className="space-y-2">
              {selectedDayExercises.map((exercise, exerciseIndex) => (
                <div
                  key={exerciseIndex}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      {exerciseIndex + 1}.
                    </span>
                    <span className="font-semibold text-gray-900">
                      {exercise.exercise}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{exercise.sets} series</span>
                    <span className="mx-2">•</span>
                    <span>{exercise.rangeMin}-{exercise.rangeMax} reps</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón para comenzar entrenamiento */}
            <div className="pt-4">
              <Button
                onClick={handleStartTraining}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
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
              Selecciona un día para ver los ejercicios y comenzar tu entrenamiento
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AthletePage;
