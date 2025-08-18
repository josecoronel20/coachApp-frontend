import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone,
  Zap,
  BarChart3,
  MessageCircle,
  CreditCard,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xl font-bold text-gray-900">
                GymBro Coach
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Iniciar sesión
              </Link>
              <Button asChild>
                <Link href="/auth/register">Crear cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Rutinas y progreso en un link —{" "}
            <span className="text-blue-600">sin app, sin login</span>
          </h1> 
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Crea rutinas desde texto o IA. Envía por WhatsApp. Atletas abren y
            entrenan sin descargar nada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link href="/auth/register">
                Crear cuenta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Plan base: hasta 5 atletas por entrenador.
          </p>
        </div>
      </section>

      {/* Valor Clave */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Acceso inmediato por link
              </h3>
            </div>
            <div className="flex flex-col items-center">
              <Smartphone className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Ejecución click-only para atletas
              </h3>
            </div>
            <div className="flex flex-col items-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Control y métricas para entrenadores
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que un entrenador necesita para gestionar rutinas y
              progreso sin fricción
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Creación ultra rápida
                </h3>
                <p className="text-gray-600">
                  Pega texto o usa IA. Preview antes de guardar.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Smartphone className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Vista atleta sin fricción
                </h3>
                <p className="text-gray-600">
                  PWA móvil. No login. No instalación. Inicia en un tap.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Edición por atleta
                </h3>
                <p className="text-gray-600">
                  Ajuste de peso y reps. Progresión automática.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <MessageCircle className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Feedback por ejercicio
                </h3>
                <p className="text-gray-600">
                  Botones predefinidos y comentarios guardados.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <BarChart3 className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Historial semanal
                </h3>
                <p className="text-gray-600">
                  Reps y peso por semana por ejercicio.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <CreditCard className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Pagos automáticos
                </h3>
                <p className="text-gray-600">
                  MercadoPago: alias y monto preconfigurado por atleta.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tres pasos para llevar rutinas al atleta
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Crear</h3>
              <p className="text-gray-600">
                Pegar la rutina o generar con IA. Ver preview. Confirmar.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Enviar</h3>
              <p className="text-gray-600">
                Pulsar &quot;Enviar por WhatsApp&quot;. Se crea link seguro.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Entrenar</h3>
              <p className="text-gray-600">
                Atleta abre link, inicia entrenamiento, registra feedback y
                peso. Datos sincronizan y aparecen en tu dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Beneficios — Entrenador
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Ahorro de tiempo en creación de rutinas
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Centralización de rutinas, progreso y cobros
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Feedback registrado y accionable
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Beneficios — Atleta
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Acceso inmediato sin descargar
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Interfaz click-only</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Guarda progreso y ajusta carga fácilmente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Plan Base</h2>
          <Card className="max-w-md mx-auto border-2 border-blue-600">
            <CardContent className="p-8">
              <div className="text-4xl font-bold text-gray-900 mb-2">$29</div>
              <div className="text-gray-600 mb-6">por mes</div>
              <div className="space-y-4 text-left mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Hasta 5 atletas activos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Cobros vía MercadoPago sin comisión</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Historial completo</span>
                </div>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/auth/register">Comenzar ahora</Link>
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Upgrades: más atletas y más historial disponible
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿El atleta necesita crear cuenta?
              </h3>
              <p className="text-gray-600">
                No. Solo abre el link y usa la PWA.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿El enlace puede revocarse?
              </h3>
              <p className="text-gray-600">
                Sí. Admins pueden revocar o regenerar tokens desde el dashboard.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Se pierden datos si el atleta está offline?
              </h3>
              <p className="text-gray-600">
                No. Se guarda localmente y se sincroniza al reconectar.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Cómo funcionan los pagos?
              </h3>
              <p className="text-gray-600">
                Se genera un cobro en MercadoPago con alias y monto. El
                entrenador administra cobros desde su panel.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Cuántos atletas por plan?
              </h3>
              <p className="text-gray-600">
                Plan base: hasta 5 atletas. Se pueden comprar upgrades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Lo que dicen nuestros entrenadores
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  &quot;Me ahorra horas por semana. Mis atletas ya no pierden
                  entrenos.&quot;
                </p>
                <div className="font-semibold text-gray-900">
                  — Carlos M., Entrenador Personal
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  &quot;La facilidad para enviar rutinas por WhatsApp es
                  increíble. Mis clientes están más comprometidos.&quot;
                </p>
                <div className="font-semibold text-gray-900">
                  — Ana L., Preparadora Física
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  &quot;El feedback en tiempo real me permite ajustar las
                  rutinas al instante.&quot;
                </p>
                <div className="font-semibold text-gray-900">
                  — Miguel R., Coach Deportivo
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para revolucionar tu entrenamiento?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a cientos de entrenadores que ya están usando GymBro Coach
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-4"
            asChild
          >
            <Link href="/auth/register">
              Comenzar ahora — Crear cuenta
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xl font-bold">GymBro Coach</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white">
                Privacidad
              </Link>
              <Link href="#" className="hover:text-white">
                Términos
              </Link>
              <Link
                href="mailto:hola@gymbrocoach.com"
                className="hover:text-white"
              >
                Contacto
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 GymBro Coach. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
