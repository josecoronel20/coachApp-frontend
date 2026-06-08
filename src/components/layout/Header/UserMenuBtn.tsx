"use client";

import { logoutUser } from "@/app/api/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCoachInfo } from "@/hooks/useCoachInfo";
import {
  getAvailablePWAInstallPrompt,
  isIosDevice,
  isStandaloneMode,
  PWA_INSTALL_READY_EVENT,
  runPWAInstallPrompt,
} from "@/lib/pwaInstall";
import { Check, Download, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UserMenuBtn = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasNativeInstallPrompt, setHasNativeInstallPrompt] = useState(false);
  const router = useRouter();
  const { data: coachInfo } = useCoachInfo();

  useEffect(() => {
    const syncInstallState = () => {
      setIsInstalled(isStandaloneMode());
      setHasNativeInstallPrompt(Boolean(getAvailablePWAInstallPrompt()));
    };

    syncInstallState();
    window.addEventListener(PWA_INSTALL_READY_EVENT, syncInstallState);
    window.addEventListener("appinstalled", syncInstallState);

    return () => {
      window.removeEventListener(PWA_INSTALL_READY_EVENT, syncInstallState);
      window.removeEventListener("appinstalled", syncInstallState);
    };
  }, []);

  const logout = async () => {
    const response = await logoutUser();
    if (response.status === 200) {
      router.push("/auth/login");
    }
  };

  const installApp = async () => {
    setUserMenuOpen(false);

    if (isStandaloneMode()) return;

    const result = await runPWAInstallPrompt();
    if (result !== "unavailable") return;

    if (isIosDevice()) {
      window.alert("En iPhone o iPad: toca Compartir y luego Agregar a inicio.");
      return;
    }

    window.alert("Si tu navegador lo permite, usa el menu del navegador y elegi Instalar app o Agregar a pantalla de inicio.");
  };

  return (
    <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="sm" className="relative">
          <User className="h-4 w-4" />
          <span className="hidden sm:block">{coachInfo?.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="flex max-w-md flex-col gap-2 p-2">
        <span className="text-sm font-medium">Profe {coachInfo?.name}</span>
        <span className="text-sm text-muted-foreground">{coachInfo?.email}</span>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          disabled={isInstalled}
          onSelect={(event) => {
            event.preventDefault();
            void installApp();
          }}
        >
          <Button variant="ghost" className="flex w-full items-center justify-start gap-2 px-2">
            {isInstalled ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {isInstalled ? "App instalada" : hasNativeInstallPrompt ? "Instalar app" : "Como instalar app"}
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start gap-2 px-2"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" /> Cerrar sesion
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenuBtn;
