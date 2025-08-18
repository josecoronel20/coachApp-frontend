"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCoachStore } from "@/store/coachStore";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

const UserMenuBtn = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { coachInfo } = useCoachStore();

  return (
    <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="sm" className="relative">
          <User className="h-4 w-4" />
          <span className="hidden sm:block">{coachInfo?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-md flex flex-col gap-2 p-2">
        <span className="text-sm font-medium">Profe {coachInfo?.name}</span>
        <span className="text-sm text-muted-foreground">{coachInfo?.email}</span>

        <DropdownMenuItem className="cursor-pointer">
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenuBtn;
