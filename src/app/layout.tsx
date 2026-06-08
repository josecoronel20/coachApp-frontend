import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["800"],
});

export const metadata: Metadata = {
  title: "Impruv — Rutinas por link y seguimiento real para coaches fitness",
  description:
    "Creá rutinas, compartilas con atletas sin registro y recibí pesos, reps y notas de cada sesión en un dashboard ordenado.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Rutinas por link, seguimiento real y mejores decisiones",
    description:
      "Tus atletas entrenan desde un link. Vos recibís pesos, reps y notas sin perseguirlos por WhatsApp.",
    type: "website",
    locale: "es_ES",
  },
  keywords: [
    "app para entrenadores sin app",
    "rutinas por link sin login", 
    "PWA entrenadores",
    "gestion rutinas entrenador",
    "seguimiento fitness coaches",
    "historial atletas fitness"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#7C3AED" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Impruv" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme) {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${syne.variable} min-h-dvh bg-bg-base text-text-primary antialiased`}
        style={{
          fontFamily: "var(--font-outfit)",
        }}
      >
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}
