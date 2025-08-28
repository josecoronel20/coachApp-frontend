"use client";
import { Button } from "@/components/ui/button";
import { useAthleteStore } from "@/store/useAthleteStore";
import { useState, useEffect } from "react";
import { ChevronDown, Info, CheckCircle } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WeightSection from "./sessionComponents/WeightSection";
import SetsAndReps from "./sessionComponents/SetsAndReps";
import CommentsBtn from "./sessionComponents/CommentsBtn";
import { Exercise, ExerciseHistory } from "@/types/routineType";
import { useParams } from "next/navigation";

const SessionPage = () => {
  // store
  const { athlete, infoCurrentSession, setInfoCurrentSession } = useAthleteStore();

  // index selected day from params
  const { indexSelectedDay: indexSelectedDayFromParams } = useParams();
  const indexSelectedDay = Number(indexSelectedDayFromParams) - 1;

  // local states
  const [indexCurrentExercise, setIndexCurrentExercise] = useState(0);
  const [currentDayExercises, setCurrentDayExercises] = useState<Exercise[]>(
    []
  );
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [weightCurrentExercise, setWeightCurrentExercise] = useState<number>(0);
  const [athleteNotes, setAthleteNotes] = useState("");

  // set current exercise + history when list or index changes
  useEffect(() => {
    if (!athlete) return;

    setCurrentDayExercises(athlete.routine[indexSelectedDay] || []);

    const exercise = currentDayExercises[indexCurrentExercise];
    setCurrentExercise(exercise);

    // set feedback text
    setAthleteNotes(exercise?.athleteNotes || "");

    // set last session history
    const history = exercise?.exerciseHistory?.at(-1) || null;
    setWeightCurrentExercise(history?.weight || 0);

    // set infoCurrentSession default values

    currentDayExercises.forEach((exercise, index) => {
      setInfoCurrentSession(index, {
        date: new Date().toISOString().split("T")[0],
        weight: history?.weight || 0,
        sets: history?.sets || [],
      });
    });

    // Array(exercise?.sets || 0).fill(0).forEach((_, index) => {
    //   setInfoCurrentSession(index, {
    //     date: new Date().toISOString().split("T")[0],
    //     weight: history?.weight || 0,
    //     sets: Array(exercise.sets).fill(exercise.rangeMin),
    //   });
    // });
    console.log("infoCurrentSession", infoCurrentSession);
  }, [currentDayExercises, indexCurrentExercise]);

  // Function to finish session and update exercise history
  const handleFinishSession = async () => {
    console.log("Finishing session with data:", currentDayExercises);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="bg-background border-b p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          Día {indexSelectedDay + 1} • Ejercicio {indexCurrentExercise + 1}/
          {currentDayExercises?.length}
        </div>

        <h1 className="text-lg font-semibold mt-1">
          {currentExercise?.exercise}
        </h1>

        <p className="text-sm text-muted-foreground">
          Meta: {currentExercise?.sets} × {currentExercise?.rangeMin}-
          {currentExercise?.rangeMax} reps
        </p>

        <details>
          <summary className="cursor-pointer flex items-center justify-between p-1 w-full bg-foreground/5 rounded-t-md text-sm mt-2">
            <p className="flex items-center gap-2">
              <span>
                <Info className="h-4 w-4" />
              </span>
              Cómo progresar en tus series
            </p>
            <ChevronDown className="h-4 w-4" />
          </summary>
          <p className="text-sm text-muted-foreground bg-foreground/5 rounded-b-md p-2">
            Busca acercar cada set al máximo ({currentExercise?.rangeMax} reps)
            sumando las reps que puedas cada semana y manteniendo el mismo peso.
            Si llegas al máximo en todas las series: Sube el peso y vuelve al
            minimo ({currentExercise?.rangeMin} reps).
          </p>
        </details>
      </div>

      {/* exercise data */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2 w-full">
            {/* image */}
            <div className="w-full h-48 bg-foreground/5 rounded-md" />

            {/* weight */}
            <WeightSection
              weight={weightCurrentExercise}
              setWeight={(newWeight) => {
                setWeightCurrentExercise(newWeight);
                // Update weight in session data
                console.log("newWeight", newWeight);
              }}
            />
          </div>

          {/* sets and reps */}
          <SetsAndReps
            minReps={currentExercise?.rangeMin || 0}
            maxReps={currentExercise?.rangeMax || 0}
            infoCurrentExercise={infoCurrentSession[indexCurrentExercise]}
            indexExercise={indexCurrentExercise}
          />
        </div>
      </div>

      {/* feedback button and next button */}
      <div className="bg-background border-t p-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <CommentsBtn
            coachNotes={currentExercise?.coachNotes || ""}
            athleteNotes={athleteNotes}
            setAthleteNotes={setAthleteNotes}
          />

          <div className="flex gap-2">
            {/* previous button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIndexCurrentExercise((prev) => prev - 1)}
              disabled={indexCurrentExercise === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            {/* next button */}
            <Button
              size="sm"
              onClick={() => {
                if (
                  indexCurrentExercise <
                  (currentDayExercises?.length || 0) - 1
                ) {
                  setIndexCurrentExercise((prev) => prev + 1);
                } else {
                  // If it's the last exercise, show finish button
                  handleFinishSession();
                }
              }}
            >
              {indexCurrentExercise < (currentDayExercises?.length || 0) - 1 ? (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Finalizar Sesión
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
