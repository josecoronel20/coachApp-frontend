import { Input } from "@/components/ui/input";
import React from "react";
import { Search } from "lucide-react";

export const SearchBar = ({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (query: string) => void }) => {
  return (
    <div className="flex items-center gap-2">
      <Search className="size-4 text-muted-foreground" />
      <Input type="text" placeholder="Buscar cliente" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
    </div>
  );
};
