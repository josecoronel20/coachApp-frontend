"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchInputProps {
  /** Texto actual del campo de búsqueda */
  value: string;
  /** Callback disparado cuando cambia el texto */
  onChange: (value: string) => void;
  /** Texto placeholder opcional */
  placeholder?: string;
}

/**
 * Campo de búsqueda con icono usado en el dashboard para filtrar atletas.
 */
const SearchInput = ({ value, onChange, placeholder = "Buscar" }: SearchInputProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="flex items-center gap-2">
      <Search className="size-4 text-muted-foreground" />
      <Input value={value} onChange={handleChange} placeholder={placeholder} />
    </label>
  );
};

export default SearchInput;
