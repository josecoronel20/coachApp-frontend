import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rutinas y progreso en un link — PWA para entrenadores",
  description: "Plataforma PWA para entrenadores. Crea rutinas desde texto o IA, envía por WhatsApp y el atleta abre sin descargar ni registrarse. Gestión de progreso y cobros con MercadoPago.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
