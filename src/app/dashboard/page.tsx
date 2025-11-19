"use client";

import { useState } from "react";
import DashboardHeader from "./dashboardComponents/DashboardHeader";
import AthleteGrid from "./dashboardComponents/AthleteGrid";

/**
 * Dashboard principal del coach.
 * Permite buscar atletas, crear nuevos y acceder a la vista detallada.
 */
const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="flex min-h-screen flex-col gap-4 pt-16">
      {/* Encabezado con buscador y CTA para crear atletas */}
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Grid filtrable de atletas */}
      <section className="flex-1 overflow-y-auto pb-6">
        <AthleteGrid searchQuery={searchQuery} />
      </section>
    </main>
  );
};

export default DashboardPage;
