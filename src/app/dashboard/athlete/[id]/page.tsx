"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Athlete } from "@/types/athleteType";
import { deleteAthlete } from "@/app/api/protected";
import { useGetAthleteInfo } from "@/hooks/useGetAthleteInfo";
import AthleteHeader from "./components/AthleteHeader";
import AthleteSummarySidebar from "./components/AthleteSummarySidebar";
import SkeletonAthleteDetail from "./components/SkeletonAthleteDetail";
import RoutineEditorCard from "./components/RoutineEditorCard";

interface AthleteDetailsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página de detalles del atleta dentro del dashboard del coach.
 */
const AthleteDetailsPage = ({ params }: AthleteDetailsPageProps) => {
  const router = useRouter();
  const { id: athleteId } = React.use(params);

  const { data, isLoading, mutate } = useGetAthleteInfo(athleteId);
  const athlete = data as Athlete | undefined;

  const handleDeleteAthlete = async () => {
    if (!athlete) return;

    const response = await deleteAthlete(athlete.id);
    if (response.ok) {
      router.push("/dashboard");
    }
  };

  if (isLoading || !athlete) {
    return <SkeletonAthleteDetail />;
  }

  return (
    <div className="min-h-screen bg-muted pt-16">
      <AthleteHeader athlete={athlete} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 min-w-0">
            <AthleteSummarySidebar
              athlete={athlete}
              onDelete={handleDeleteAthlete}
              onDietSaved={() => mutate()}
            />
          </div>

          <div className="lg:col-span-2 min-w-0">
            <RoutineEditorCard athleteId={athlete.id} initialRoutine={athlete.routine} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AthleteDetailsPage;
