"use client";

import { useEffect } from "react";
import { markPWAInstallAccepted, PWA_INSTALL_READY_EVENT } from "@/lib/pwaInstall";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __impruvInstallPrompt?: BeforeInstallPromptEvent;
  }
}

export default function PWAInstaller() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.__impruvInstallPrompt = event as BeforeInstallPromptEvent;
      window.dispatchEvent(new Event(PWA_INSTALL_READY_EVENT));
    };

    const handleAppInstalled = () => {
      window.__impruvInstallPrompt = undefined;
      markPWAInstallAccepted();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
