import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rutinas y progreso en un link — PWA para entrenadores",
  description: "Plataforma PWA para entrenadores. Crea rutinas desde texto o IA, envía por WhatsApp y el atleta abre sin descargar ni registrarse. Gestión de progreso y cobros con MercadoPago.",
  manifest: "/manifest.json",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Rutinas y progreso en un link — sin app, sin login",
    description: "Crea, envía y controla rutinas. Atletas acceden por link. Feedback y progreso en tiempo real. Pagos automatizados.",
    type: "website",
    locale: "es_ES",
  },
  keywords: [
    "app para entrenadores sin app",
    "rutinas por link sin login", 
    "PWA entrenadores",
    "gestión rutinas entrenador",
    "enviar rutina por WhatsApp"
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
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CoachApp" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo.png" />
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
        className={`${outfit.variable} antialiased`}
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
