"use client";

// import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AthleteView } from "./athleteComponent/Athlete-view";
import { useAthleteStore } from "@/store/athleteStore";
import { Athlete } from "@/types/athleteType";
import { useEffect } from "react";

export default function AthletePage() {
  // const { id } = useParams();
  
  const { athleteInfo, setAthleteInfo } = useAthleteStore();

  useEffect(() => {
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
              "exercise": "Bench Press",
              "sets": [8, 8, 8],
              "range": [8, 10],
              "weight": 100,
              "coachNotes": "Mantener control en la bajada",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Incline Dumbbell Press",
              "sets": [10, 10, 10],
              "range": [8, 12],
              "weight": 30,
              "coachNotes": "No bloquear codos arriba",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Chest Fly Machine",
              "sets": [12, 12, 12],
              "range": [10, 15],
              "weight": 60,
              "coachNotes": "Controlar apertura máxima",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Triceps Pushdown",
              "sets": [12, 12, 12],
              "range": [10, 15],
              "weight": 40,
              "coachNotes": "Mantener codos pegados al cuerpo",
              "athleteNotes": null,
              "exerciseHistory": []
            }
          ],
          [
            {
              "exercise": "Back Squat",
              "sets": [8, 8, 8],
              "range": [6, 8],
              "weight": 140,
              "coachNotes": "Profundidad paralela",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Leg Press",
              "sets": [10, 10, 10],
              "range": [8, 12],
              "weight": 220,
              "coachNotes": "Controlar rodillas, no bloquear arriba",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Leg Curl",
              "sets": [12, 12, 12],
              "range": [10, 15],
              "weight": 50,
              "coachNotes": "Pausa de 1s arriba",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Calf Raise",
              "sets": [15, 15, 15],
              "range": [12, 20],
              "weight": 60,
              "coachNotes": "Estiramiento completo abajo",
              "athleteNotes": null,
              "exerciseHistory": []
            }
          ],
          [
            {
              "exercise": "Pull Ups",
              "sets": [8, 8, 8],
              "range": [6, 10],
              "weight": 0,
              "coachNotes": "Mentón sobre la barra",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Bent Over Row",
              "sets": [10, 10, 10],
              "range": [8, 12],
              "weight": 80,
              "coachNotes": "No arquear la espalda baja",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Lateral Raise",
              "sets": [12, 12, 12],
              "range": [10, 15],
              "weight": 10,
              "coachNotes": "No subir más arriba de hombros",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Barbell Curl",
              "sets": [10, 10, 10],
              "range": [8, 12],
              "weight": 35,
              "coachNotes": "No balancear el cuerpo",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Hammer Curl",
              "sets": [12, 12, 12],
              "range": [10, 15],
              "weight": 15,
              "coachNotes": "Movimiento controlado",
              "athleteNotes": null,
              "exerciseHistory": []
            }
          ],
          [
            {
              "exercise": "Deadlift",
              "sets": [5, 5, 5],
              "range": [4, 6],
              "weight": 160,
              "coachNotes": "Espalda recta en todo el movimiento",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Front Squat",
              "sets": [8, 8, 8],
              "range": [6, 10],
              "weight": 100,
              "coachNotes": "Codos arriba",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Romanian Deadlift",
              "sets": [10, 10, 10],
              "range": [8, 12],
              "weight": 100,
              "coachNotes": "Bajar hasta sentir estiramiento en femoral",
              "athleteNotes": null,
              "exerciseHistory": []
            },
            {
              "exercise": "Hip Thrust",
              "sets": [12, 12, 12],
              "range": [10, 15],
              "weight": 120,
              "coachNotes": "Pausa de 1s arriba",
              "athleteNotes": null,
              "exerciseHistory": []
            }
          ]
        ]
        
    };
    setAthleteInfo(athleteExample);
  }, [setAthleteInfo]);

  if (!athleteInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-900">Cargando rutina...</span>
      </div>
    );
  }

  if (!athleteInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-600">
        <p>No se pudo cargar la rutina del atleta.</p>
      </div>
    );
  }

  return <AthleteView />;
}
