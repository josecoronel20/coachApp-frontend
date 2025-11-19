"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SearchInput from "./SearchInput";

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
    <header className="flex flex-col gap-4 border-b p-4">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Buscar atleta"
      />

      <Link href="/dashboard/athlete/new">
        <Button className="w-full">+ Nuevo cliente</Button>
      </Link>
    </header>
  );
};

export default DashboardHeader;
