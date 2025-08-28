"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAthleteStore } from "@/store/useAthleteStore";
import Link from "next/link";
import { useState } from "react";

export function AthleteView() {
  const { athlete } = useAthleteStore();
  const [bodyWeight, setBodyWeight] = useState(athlete?.bodyWeight || 0);
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(athlete?.bodyWeight || 0);
  const [indexSelectedDay, setIndexSelectedDay] = useState(0);
  // const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold">{athlete?.name}</h1>
            <div className="flex items-center gap-3">
              {isUpdatingWeight && (
                <>
                  <input
                    type="number"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(Number(e.target.value))}
                    className="w-12"
                  />
                  <Button
                    onClick={() => {
                      setBodyWeight(tempWeight);
                      setIsUpdatingWeight(false);
                    }}
                  >
                    Guardar
                  </Button>
                </>
              )}
              {!isUpdatingWeight && (
                <>
                  <span className="text-muted-foreground">{bodyWeight} kg</span>
                  <Button onClick={() => setIsUpdatingWeight(true)}>
                    Actualizar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        <h2 className="text-lg font-medium text-center mb-6">
          Rutina Entrenamiento
        </h2>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        {athlete?.routine && athlete?.routine.length > 1 && (
          <div className="flex gap-2 justify-center">
            {athlete?.routine.map((_, index) => (
              <Button
                key={index}
                variant={indexSelectedDay === index ? "default" : "outline"}
                size="sm"
                onClick={() => setIndexSelectedDay(index)}
              >
                Día {index + 1}
              </Button>
            ))}
          </div>
        )}

        {/* exercises cards of selected day */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Día {indexSelectedDay + 1}</h2>
            <div className="space-y-2">
              {athlete?.routine[indexSelectedDay].map((exercise, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span className="font-medium">{exercise.exercise}</span>
                  <span className="text-muted-foreground text-sm">
                    {exercise.sets} × {exercise.rangeMin}-
                    {exercise.rangeMax}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* start training button */}
        <Link href={`/athlete/${athlete?.id}/session/${indexSelectedDay + 1}`}>
        <Button
          
          className="w-full h-12 text-lg"
          size="lg"
          >
            Iniciar entrenamiento
          </Button>
        </Link>
      </div>
    </div>
  );
}
