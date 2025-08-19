"use client";
import { Button } from "@/components/ui/button";
import { useAthleteStore } from "@/store/athleteStore";
import { Athlete } from "@/types/athleteType";
import { useState, useEffect } from "react";
import { ChevronDown, Info, CheckCircle, MessageSquare } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import WeightSection from "./sessionComponents/WeightSection";
import SetsAndReps from "./sessionComponents/SetsAndReps";
import { TrainingSession } from "./types";
import CommentsBtn from "./sessionComponents/CommentsBtn";
import FinishTrainingView from "./sessionComponents/FinishTrainingView";

const SessionPage = ({
  params,
}: {
  params: Promise<{ idSession: string; id: string }>;
}) => {
  const { athleteInfo, setAthleteInfo } = useAthleteStore();
  const [idSession, setIdSession] = useState<string>("");
  const [athleteId, setAthleteId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const { idSession: sessionId, id: athleteIdParam } = await params;
      setIdSession(sessionId);
      setAthleteId(athleteIdParam);
    };
    getParams();
    
    const athleteExample: Athlete = {
    id: "abc",
    coachId: "abc",
    paymentDate: "2025-01-01",
    notes:
      "tiene sobrepeso, no puede hacer squat con peso y debe hacer squat con 10kg",
    name: "Juan Perez",
    email: "juan.perez@gmail.com",
    phone: "1234567890",
    bodyWeight: 80,
    routine: [
      [
        {
          exercise: "Bench Press",
          sets: [8, 8, 8],
          range: [8, 10],
          weight: 100,
          coachNotes: "Mantener control en la bajada",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Incline Dumbbell Press",
          sets: [10, 10, 10],
          range: [8, 12],
          weight: 30,
          coachNotes: "No bloquear codos arriba",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Chest Fly Machine",
          sets: [12, 12, 12],
          range: [10, 15],
          weight: 60,
          coachNotes: "Controlar apertura máxima",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Triceps Pushdown",
          sets: [12, 12, 12],
          range: [10, 15],
          weight: 40,
          coachNotes: "Mantener codos pegados al cuerpo",
          athleteNotes: null,
          exerciseHistory: [],
        },
      ],
      [
        {
          exercise: "Back Squat",
          sets: [8, 8, 8],
          range: [6, 8],
          weight: 140,
          coachNotes: "Profundidad paralela",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Leg Press",
          sets: [10, 10, 10],
          range: [8, 12],
          weight: 220,
          coachNotes: "Controlar rodillas, no bloquear arriba",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Leg Curl",
          sets: [12, 12, 12],
          range: [10, 15],
          weight: 50,
          coachNotes: "Pausa de 1s arriba",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Calf Raise",
          sets: [15, 15, 15],
          range: [12, 20],
          weight: 60,
          coachNotes: "Estiramiento completo abajo",
          athleteNotes: null,
          exerciseHistory: [],
        },
      ],
      [
        {
          exercise: "Pull Ups",
          sets: [8, 8, 8],
          range: [6, 10],
          weight: 0,
          coachNotes: "Mentón sobre la barra",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Barbell Row",
          sets: [10, 10, 10],
          range: [8, 12],
          weight: 80,
          coachNotes: "Mantener espalda recta",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Lat Pulldown",
          sets: [12, 12, 12],
          range: [10, 15],
          weight: 70,
          coachNotes: "No llevar barra detrás de la cabeza",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Face Pull",
          sets: [15, 15, 15],
          range: [12, 20],
          weight: 30,
          coachNotes: "Abrir codos al nivel de orejas",
          athleteNotes: null,
          exerciseHistory: [],
        },
      ],
      [
        {
          exercise: "Overhead Press",
          sets: [8, 8, 8],
          range: [6, 10],
          weight: 50,
          coachNotes: "No arquear la espalda baja",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Lateral Raise",
          sets: [12, 12, 12],
          range: [10, 15],
          weight: 10,
          coachNotes: "No subir más arriba de hombros",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Barbell Curl",
          sets: [10, 10, 10],
          range: [8, 12],
          weight: 35,
          coachNotes: "No balancear el cuerpo",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Hammer Curl",
          sets: [12, 12, 12],
          range: [10, 15],
          weight: 15,
          coachNotes: "Movimiento controlado",
          athleteNotes: null,
          exerciseHistory: [],
        },
      ],
      [
        {
          exercise: "Deadlift",
          sets: [5, 5, 5],
          range: [4, 6],
          weight: 160,
          coachNotes: "Espalda recta en todo el movimiento",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Front Squat",
          sets: [8, 8, 8],
          range: [6, 10],
          weight: 100,
          coachNotes: "Codos arriba",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Romanian Deadlift",
          sets: [10, 10, 10],
          range: [8, 12],
          weight: 100,
          coachNotes: "Bajar hasta sentir estiramiento en femoral",
          athleteNotes: null,
          exerciseHistory: [],
        },
        {
          exercise: "Hip Thrust",
          sets: [12, 12, 12],
          range: [10, 15],
          weight: 120,
          coachNotes: "Pausa de 1s arriba",
          athleteNotes: null,
          exerciseHistory: [],
        },
      ],
    ],
    };
    setAthleteInfo(athleteExample);
  }, [params, setAthleteInfo]);

  const currentDayExercises = athleteInfo?.routine[Number(idSession) - 1];

  // Initialize training session state
  const [trainingSession, setTrainingSession] = useState<TrainingSession>([]);

  // Initialize training session when exercises are loaded
  useEffect(() => {
    if (currentDayExercises) {
      const initializedSession: TrainingSession = currentDayExercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((targetReps) => ({
          isDone: false,
          reps: targetReps,
          targetReps,
        })),
      }));
      setTrainingSession(initializedSession);
    }
  }, [currentDayExercises]);

  const [showExerciseList, setShowExerciseList] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [showFinishView, setShowFinishView] = useState(false);

  const currentSessionData = trainingSession[currentExerciseIndex];

  // Update set completion status
  const updateSetStatus = (exerciseIndex: number, setIndex: number, isDone: boolean, reps: number) => {
    setTrainingSession((prev) =>
      prev.map((exercise, exIndex) =>
        exIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, setIdx) =>
                setIdx === setIndex
                  ? { ...set, isDone, reps }
                  : set
              ),
            }
          : exercise
      )
    );
  };

  // Update athlete notes for current exercise
  const updateAthleteNotes = (notes: string) => {
    setTrainingSession((prev) =>
      prev.map((exercise, exIndex) =>
        exIndex === currentExerciseIndex
          ? { ...exercise, athleteNotes: notes }
          : exercise
      )
    );
  };

  // Check if all exercises and sets are completed
  const allDone = trainingSession.length > 0 && trainingSession.every((exercise) =>
    exercise.sets.every((set) => set.isDone)
  );

  // Handle finish training
  const handleFinishTraining = () => {
    // Here you would typically save the training session data
    console.log("Training session completed:", trainingSession);
    setShowFinishView(true);
  };

  // Show finish training view if all exercises are completed
  if (showFinishView) {
    return (
      <FinishTrainingView 
        trainingSession={trainingSession} 
        athleteId={athleteId} 
      />
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="bg-background border-b p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExerciseList(!showExerciseList)}
          >
            Día {idSession} • Ejercicio {currentExerciseIndex + 1}/
            {trainingSession?.length}
          </Button>
        </div>

        <h1 className="text-lg font-semibold mt-1">
          {currentSessionData?.exercise}
        </h1>

        <p className="text-sm text-muted-foreground">
          Meta: {currentSessionData?.sets.length} ×{" "}
          {currentSessionData?.range[0]}-
          {currentSessionData?.range[1]} reps
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
            Busca acercar cada set al máximo (
            {currentSessionData?.range[1]} reps)
            sumando las reps que puedas cada semana y manteniendo el mismo peso.
            Si llegas al máximo en todas las series: Sube el peso y vuelve al
            minimo ({currentSessionData?.range[0]}{" "}
            reps).
          </p>
        </details>
      </div>

      {showExerciseList && (
        <div className="absolute inset-0 bg-background z-20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ejercicios del día</h2>
            <Button variant="ghost" onClick={() => setShowExerciseList(false)}>
              ×
            </Button>
          </div>
          <div className="space-y-2">
            {trainingSession?.map((exercise, index) => (
              <Button
                key={index}
                variant={index === currentExerciseIndex ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentExerciseIndex(index);
                  setShowExerciseList(false);
                }}
              >
                                 <div className="flex items-center justify-between w-full">
                   <span>
                     {exercise.exercise} — {exercise.sets.length} ×{" "}
                     {exercise.range[0]}-{exercise.range[1]}
                   </span>
                   <div className="flex items-center gap-1">
                     {exercise.athleteNotes && (
                       <MessageSquare className="h-4 w-4 text-blue-500" />
                     )}
                     {exercise.sets.every((set) => set.isDone) && (
                       <CheckCircle className="h-4 w-4" />
                     )}
                   </div>
                 </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* exercise data */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2 w-full">
            {/* image */}
            <div className="w-full h-48 bg-foreground/5 rounded-md" />

            {/* weight */}
            <WeightSection weight={currentSessionData?.exerciseHistory[0]?.weight || 0} />
          </div>

          {/* sets and reps */}
          <SetsAndReps
            sets={currentSessionData?.sets || []}
            exerciseIndex={currentExerciseIndex}
            onSetUpdate={updateSetStatus}
          />

          {showFeedback && (
            <Card>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="text-sm">
                    Comentario para el entrenador
                  </Label>
                  <Textarea
                    id="feedback"
                    placeholder="Comentario breve..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    maxLength={200}
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => {}} size="sm">
                      Enviar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFeedback(false)}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* feedback button and next button */}
      <div className="bg-background border-t p-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <CommentsBtn 
            exercise={currentSessionData} 
            onUpdateAthleteNotes={updateAthleteNotes} 
          />

          <div className="flex gap-2">
            {allDone ? (
              <Button
                size="sm"
                onClick={handleFinishTraining}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Finalizar Entrenamiento
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentExerciseIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (
                      currentExerciseIndex <
                      (trainingSession?.length || 0) - 1
                    ) {
                      setCurrentExerciseIndex((prev) => prev + 1);
                    } else {
                      // setViewMode("summary")
                    }
                  }}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
