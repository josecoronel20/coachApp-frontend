"use client";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./dashboardComponents/Searchbar";
import { useCoachStore } from "@/store/coachStore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AthleteList from "./dashboardComponents/AthleteList";

const DashboardPage = () => {
  const { coachInfo, setCoachInfo, athletesInfo, setAthletesInfo } =
    useCoachStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCoachInfo({
      id: "abc",
      name: "Juan Perez",
      email: "juan.perez@gmail.com",
    });

    setAthletesInfo([
      {
        id: "abc",
        coachId: "abc",
        paymentDate: "2025-01-01",
        notes:"tiene sobrepeso, no puede hacer squat con peso y debe hacer squat con 10kg",
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
              coachNotes: "cuiado con el codo",
              athleteNotes:
                "me molesta el hombro en el momento que bajo y espero unos segundos para volver a subir",
              exerciseHistory: [
                { date: "2025-01-01", weight: 100, sets: [8, 8, 8] },
                { date: "2025-01-02", weight: 100, sets: [10, 9, 8] },
                { date: "2025-01-03", weight: 100, sets: [12, 10, 10] },
              ],
            },
            {
              exercise: "Squat",
              sets: [8, 8, 8],
              range: [8, 10],
              weight: 150,
              coachNotes: "cuiado con el codo",
              athleteNotes: "me molesta la rodilla",
              exerciseHistory: [],
            },

            {
              exercise: "Squat",
              sets: [8, 8, 8],
              range: [8, 10],
              weight: 150,
              coachNotes: "cuiado con el codo",
              athleteNotes: "me molesta la cadera",
              exerciseHistory: [],
            },
          ],
          [
            {
              exercise: "Deadlift",
              sets: [8, 8, 8],
              range: [8, 10],
              weight: 150,
              coachNotes: "cuiado con el codo",
              athleteNotes: null,
              exerciseHistory: [
                { date: "2025-01-01", weight: 150, sets: [8, 8, 8] },
                { date: "2025-01-02", weight: 150, sets: [10, 9, 8] },
                { date: "2025-01-03", weight: 150, sets: [12, 10, 10] },
              ],
            },
          ],
        ],
      },
      {
        id: "def",
        coachId: "abc",
        paymentDate: "2025-08-10",
        notes: "Lesion en el antebrazo, no puede hacer bench press porque al cargar mucho peso sobre el hombro se siente dolor",
        name: "Matias Perez",
        email: "juan.perez@gmail.com",
        phone: "1234567890",
        bodyWeight: 70,
        routine: [
          [
            {
              exercise: "Bench Press",
              sets: [8, 8, 8],
              range: [8, 10],
              weight: 100,
              coachNotes: "cuiado con el codo",
              athleteNotes: "me molesta la pata",
              exerciseHistory: [
                { date: "2025-01-01", weight: 100, sets: [8, 8, 8] },
                { date: "2025-01-02", weight: 100, sets: [10, 9, 8] },
                { date: "2025-01-03", weight: 100, sets: [12, 10, 10] },
              ],
            },
            {
              exercise: "Squat",
              sets: [8, 8, 8],
              range: [8, 10],
              weight: 150,
              coachNotes: "cuiado con el codo",
              athleteNotes: "me molesta el tobillo",
              exerciseHistory: [],
            },

            {
              exercise: "Squat",
              sets: [8, 8, 8],
              range: [8, 10],
              weight: 150,
              coachNotes: "cuiado con el codo",
              athleteNotes: "me molesta el pubis",
              exerciseHistory: [],
            },
          ],
          [
            {
              exercise: "Deadlift",
              sets: [8, 8, 8],
              range: [8, 11],
              weight: 150,
              coachNotes: "cuiado con la lumbar",
              athleteNotes: null,
              exerciseHistory: [
                { date: "2025-01-01", weight: 150, sets: [8, 8, 8] },
                { date: "2025-01-02", weight: 150, sets: [10, 9, 8] },
                { date: "2025-01-03", weight: 150, sets: [12, 10, 11] },
              ],
            },
          ],
        ],
      },
    ]);
  }, [setAthletesInfo, setCoachInfo]);

  if (!coachInfo || !athletesInfo) {
    return <div>Loading...</div>;
  }
  return (
    <main className="flex flex-col min-h-screen pt-16 p-1">
      <div className="flex-1 flex flex-col overflow-hidden gap-4">
        <div className="p-4 border-b flex flex-col gap-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          <Link href="/dashboard/athlete/new">
            <Button className="w-full">+ Nuevo Cliente</Button>
          </Link>
        </div>

        <div className="flex-1 overflow-hidden">
          <AthleteList searchQuery={searchQuery} />
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
