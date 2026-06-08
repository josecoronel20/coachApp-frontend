"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SearchInput from "./SearchInput";
import { Plus, Users } from "lucide-react";

interface DashboardHeaderProps {
  /** Valor actual del filtro de búsqueda */
  searchQuery: string;
  /** Callback para actualizar el texto de búsqueda */
  onSearchChange: (value: string) => void;
}

/**
 * Encabezado del dashboard con acciones rápidas (buscar y crear atleta).
 */
const DashboardHeader = ({ searchQuery, onSearchChange }: DashboardHeaderProps) => {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-purple-soft">
            <Users className="size-3.5" />
            Home coach
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-text-primary sm:text-3xl">
            Atletas
          </h1>
        </div>

        <Button asChild size="lg" className="h-10 shrink-0 rounded-app-full px-4 sm:px-5">
          <Link href="/dashboard/athlete/new">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nuevo atleta</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar por nombre"
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
