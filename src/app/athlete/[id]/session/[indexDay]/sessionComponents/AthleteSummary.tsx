import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, TrendingUp } from "lucide-react";

interface Exercise {
  exercise: string;
  sets: number;
  rangeMin: number;
  rangeMax: number;
  weight: number;
  exerciseHistory?: Array<{
    date: string;
    weight: number;
    sets: number[];
  }>;
}

interface AthleteSummaryProps {
  name: string;
  routine: Exercise[][];
}

/**
 * Componente que muestra un resumen del progreso del atleta
 */
const AthleteSummary = ({ name, routine }: AthleteSummaryProps) => {
  // Calcular estadísticas generales
  const totalDays = routine.length;
  const totalExercises = routine.reduce((sum, day) => sum + day.length, 0);
  
  // Calcular ejercicios con historial
  const exercisesWithHistory = routine.flat().filter(ex => 
    ex.exerciseHistory && ex.exerciseHistory.length > 0
  );
  const progressPercentage = totalExercises > 0 
    ? Math.round((exercisesWithHistory.length / totalExercises) * 100)
    : 0;

  // Encontrar el último ejercicio completado
  const lastCompletedExercise = exercisesWithHistory
    .sort((a, b) => {
      const aDate = a.exerciseHistory?.[a.exerciseHistory.length - 1]?.date || '';
      const bDate = b.exerciseHistory?.[b.exerciseHistory.length - 1]?.date || '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rutina</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDays}</div>
          <p className="text-xs text-muted-foreground">
            {totalExercises} ejercicios en total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progressPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            Ejercicios con historial
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Actividad</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {lastCompletedExercise ? (
            <>
              <div className="text-sm font-semibold truncate">
                {lastCompletedExercise.exercise}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastCompletedExercise.exerciseHistory?.[lastCompletedExercise.exerciseHistory.length - 1]?.date}
              </p>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-muted-foreground">
                Sin actividad
              </div>
              <p className="text-xs text-muted-foreground">
                Comienza tu entrenamiento
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AthleteSummary;
