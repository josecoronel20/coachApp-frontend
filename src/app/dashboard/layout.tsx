import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";

export const metadata: Metadata = {
  title: "Dashboard - GymBro Coach",
  description: "Dashboard - GymBro Coach",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Dashboard - GymBro Coach",
    description: "Dashboard - GymBro Coach",
    type: "website",
    locale: "es_ES",
  },
  keywords: [
    "dashboard",
    "GymBro Coach",
    "entrenador",
    "rutina",
    "progreso",
    "cobros",
    "MercadoPago",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <>
      <Header/>
      {children}
    </>
  );
}
