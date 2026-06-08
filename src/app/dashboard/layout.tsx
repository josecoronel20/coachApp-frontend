import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import AuthGate from "@/components/auth/AuthGate";
import DashboardBottomNav from "./dashboardComponents/DashboardBottomNav";
import CoachPWAInstallPrompt from "./dashboardComponents/CoachPWAInstallPrompt";

export const metadata: Metadata = {
  title: "Dashboard - Impruv",
  description: "Dashboard para coaches fitness: atletas, rutinas por link y seguimiento real.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Dashboard - Impruv",
    description: "Dashboard para coaches fitness: atletas, rutinas por link y seguimiento real.",
    type: "website",
    locale: "es_ES",
  },
  keywords: [
    "dashboard",
    "Impruv",
    "entrenador",
    "rutina",
    "progreso",
    "seguimiento atletas",
    "rutinas por link",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <AuthGate mode="require-auth">
      <div className="app-shell py-16">
        <Header />
        <CoachPWAInstallPrompt />
        {children}
        <DashboardBottomNav />
      </div>
    </AuthGate>
  );
}
