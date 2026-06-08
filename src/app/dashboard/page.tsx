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
    <main className="app-page">
      <div className="app-container app-safe-bottom relative flex flex-col gap-5 py-6 lg:py-8">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <section className="flex-1 overflow-y-auto">
          <AthleteGrid searchQuery={searchQuery} />
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
