"use client";

import { logoutUser } from "@/app/api/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCoachInfo } from "@/hooks/useCoachInfo";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UserMenuBtn = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { data: coachInfo, error, isLoading } = useCoachInfo();

  const logout = async () => {
    const response = await logoutUser();
    if (response.status === 200) {
      router.push("/auth/login");
    }
  };

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
          <Button variant="ghost" className="flex items-center gap-2" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenuBtn;
