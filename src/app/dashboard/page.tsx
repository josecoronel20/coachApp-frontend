"use client";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./dashboardComponents/Searchbar";
import Link from "next/link";
import React, { useState } from "react";
import AthleteList from "./dashboardComponents/AthleteList";

const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
