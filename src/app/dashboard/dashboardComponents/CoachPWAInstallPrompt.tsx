"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BeforeInstallPromptEvent } from "@/components/PWAInstaller";
import {
  dismissPWAInstallBanner,
  getAvailablePWAInstallPrompt,
  isIosDevice,
  markPWAInstallBannerShown,
  PWA_INSTALL_READY_EVENT,
  runPWAInstallPrompt,
  shouldShowCoachPWAInstallBanner,
} from "@/lib/pwaInstall";

export default function CoachPWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const syncPrompt = () => {
      if (shouldShowCoachPWAInstallBanner()) {
        setInstallPrompt(getAvailablePWAInstallPrompt());
        setShowIosHint(isIosDevice() && !getAvailablePWAInstallPrompt());
        setIsVisible(true);
        markPWAInstallBannerShown();
      } else {
        setIsVisible(false);
      }
    };

    syncPrompt();
    window.addEventListener(PWA_INSTALL_READY_EVENT, syncPrompt);

    return () => {
      window.removeEventListener(PWA_INSTALL_READY_EVENT, syncPrompt);
    };
  }, []);

  const dismiss = () => {
    dismissPWAInstallBanner();
    setIsVisible(false);
  };

  const installApp = async () => {
    if (!installPrompt) return;

    const result = await runPWAInstallPrompt();
    if (result === "accepted" || result === "dismissed") {
      setIsVisible(false);
      setInstallPrompt(null);
    }
  };

  if (!isVisible) return null;

  return (
    <section className="app-container pt-4">
      <div className="flex flex-col gap-3 rounded-app-2xl border border-border-subtle bg-bg-surface-1/90 p-4 shadow-elevation-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-app-xl border border-purple-primary/25 bg-purple-primary/15 text-purple-soft">
            <Smartphone className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary">Instala Impruv para coaches</p>
            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Accede mas rapido a tu dashboard, atletas y rutinas desde la pantalla de inicio.
            </p>
            {showIosHint && (
              <p className="mt-2 text-xs text-text-muted">
                En iPhone o iPad: Compartir y luego Agregar a inicio.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
          {installPrompt && (
            <Button size="sm" onClick={installApp}>
              <Download className="size-4" />
              Instalar
            </Button>
          )}
          <Button
            aria-label="Ocultar instalacion de Impruv"
            className="size-8 rounded-app-full px-0"
            size="sm"
            variant="ghost"
            onClick={dismiss}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
