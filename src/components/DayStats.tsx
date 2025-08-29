import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Timer, TrendingUp } from "lucide-react";

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

interface DayStatsProps {
  exercises: Exercise[];
  dayIndex: number;
}

/**
 * Componente que muestra estadísticas del día seleccionado
 */
const DayStats = ({ exercises, dayIndex }: DayStatsProps) => {
  // Calcular estadísticas
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const estimatedTime = totalSets * 3; // 3 minutos por set en promedio
  
  // Calcular progreso promedio basado en el historial
  const exercisesWithHistory = exercises.filter(ex => ex.exerciseHistory && ex.exerciseHistory.length > 0);
  const progressPercentage = exercisesWithHistory.length > 0 
    ? Math.round((exercisesWithHistory.length / totalExercises) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ejercicios</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalExercises}</div>
          <p className="text-xs text-muted-foreground">
            {totalSets} series en total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Estimado</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estimatedTime} min</div>
          <p className="text-xs text-muted-foreground">
            Aproximadamente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progreso</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progressPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            Con historial disponible
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DayStats;
