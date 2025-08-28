import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageSquare, ArrowLeft, Trophy } from "lucide-react";
import React from "react";
import { TrainingSession } from "../types";
import Link from "next/link";

interface FinishTrainingViewProps {
  trainingSession: TrainingSession;
  athleteId: string;
}

const FinishTrainingView = ({ trainingSession, athleteId }: FinishTrainingViewProps) => {
  const totalExercises = trainingSession.length;
  const completedExercises = trainingSession.filter(exercise => 
    exercise.sets.every(set => set.isDone)
  ).length;

  const totalSets = trainingSession.reduce((total, exercise) => 
    total + exercise.sets.length, 0
  );
  
  const completedSets = trainingSession.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.isDone).length, 0
  );

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <h1 className="text-lg font-semibold">¡Entrenamiento Completado!</h1>
              <p className="text-sm text-muted-foreground">
                {completedExercises}/{totalExercises} ejercicios • {completedSets}/{totalSets} series
              </p>
            </div>
          </div>
          <Link href={`/athlete/${athleteId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Exercise Summary */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto space-y-3">
          <h2 className="text-base font-medium">Resumen del entrenamiento</h2>
          
          {trainingSession.map((exercise, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{exercise.exercise}</span>
                    {exercise.sets.every(set => set.isDone) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <Badge variant="outline">
                    {exercise.sets.filter(set => set.isDone).length}/{exercise.sets.length}
                  </Badge>
                </div>
                
                {/* Sets */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className={`p-2 rounded text-center text-sm ${
                        set.isDone 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <div className="font-medium">Set {setIndex + 1}</div>
                      <div className="text-xs">
                        {set.isDone ? `${set.reps} reps` : "No completado"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weight and Target */}
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>Peso: {exercise.weight} kg</span>
                  <span>Objetivo: {exercise.range[0]}-{exercise.range[1]} reps</span>
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  {exercise.coachNotes && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">Entrenador</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {exercise.coachNotes}
                      </p>
                    </div>
                  )}

                  {exercise.athleteNotes && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">Tú</Badge>
                        <MessageSquare className="h-3 w-3 text-blue-500" />
                      </div>
                      <p className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                        {exercise.athleteNotes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-background border-t p-4">
        <div className="max-w-lg mx-auto">
          <Link href={`/athlete/${athleteId}`}>
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Perfil del Atleta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinishTrainingView;
