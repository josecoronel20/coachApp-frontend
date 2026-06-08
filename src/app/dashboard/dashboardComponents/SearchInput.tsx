"use client";

import { SearchInput as BaseSearchInput } from "@/components/ui/search-input";

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
const SearchInput = ({ value, onChange, placeholder = "Buscar" }: SearchInputProps) => (
  <BaseSearchInput
    value={value}
    onValueChange={onChange}
    placeholder={placeholder}
  />
);

export default SearchInput;
