"use client";

import { getAthleteInfo } from "@/app/api/coach";
import { useAthleteStore } from "@/store/useAthleteStore";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { id } = useParams();
  const { athlete, setAthlete } = useAthleteStore();

  useEffect(() => {
    // 1. Revisar si ya hay datos en el store
    if (!athlete) {
      // 2. Revisar LocalStorage
      const stored = localStorage.getItem("athleteData");
      if (stored) {
        console.log("stored", stored);
        setAthlete(JSON.parse(stored));
      } else {
        // 3. Hacer fetch al backend
        getAthleteInfo(id as string).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setAthlete(data);
          }
        });
      }
    }
  }, [id]);

  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
