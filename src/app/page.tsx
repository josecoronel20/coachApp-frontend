"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Link2,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ImpruVLogo } from "@/components/brand/ImpruVLogo";
import { ImpruVWordmark } from "@/components/brand/ImpruVWordmark";
import { LandingBadge } from "@/components/landing/landing-badge";
import { Section, SectionHeader } from "@/components/landing/section";
import { FeatureCard } from "@/components/landing/feature-card";
import { HeroProof } from "@/components/landing/hero-proof";
import { ProofCard } from "@/components/landing/proof-card";
import { ProblemItem } from "@/components/landing/problem-item";
import { CtaForm } from "@/components/landing/cta-form";

// ─── Data ────────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Diferencial", href: "#diferencial" },
  { label: "Para quien", href: "#para-quien" },
];

const problemCards = [
  {
    icon: MessageCircle,
    title: '"Cuanto levantaste la semana pasada?"',
    text: "Le preguntas por WhatsApp. Tu atleta busca entre mensajes, responde tarde o directamente no responde. Terminas decidiendo la progresion con informacion incompleta.",
  },
  {
    icon: BarChart3,
    title: "Un Excel por atleta",
    text: "Rutinas en archivos distintos, formatos distintos, versiones distintas. A veces ni sabes cual fue el ultimo cambio que mandaste.",
  },
  {
    icon: ClipboardList,
    title: "Rutinas como PDF o imagen",
    text: "El atleta la guarda en el telefono, despues no la encuentra, te pide que se la mandes de nuevo y volves a buscar entre chats.",
  },
];

const steps = [
  {
    number: "1",
    title: "Creas la rutina",
    text: "Organizas dias, ejercicios, series y rangos de repeticiones desde tu dashboard.",
  },
  {
    number: "2",
    title: "Compartis un link",
    text: "Generas un link unico para ese atleta y se lo mandas por WhatsApp, Instagram o donde ya hablen normalmente.",
  },
  {
    number: "3",
    title: "Tu atleta entrena desde el celular",
    text: "Abre el link, ve su rutina y registra cada serie: peso, reps y notas.",
  },
  {
    number: "4",
    title: "Recibis la sesion en tu dashboard",
    text: "Ves los datos cargados sin pedir capturas, audios ni mensajes sueltos.",
  },
];

const comparisonRows = [
  ["El atleta necesita descargar una app", "No", "Muchas veces si"],
  ["El atleta necesita crear una cuenta", "No", "Muchas veces si"],
  ["Puede cargar pesos, reps y notas", "Si", "Si"],
  ["El coach recibe la sesion ordenada", "Si", "Si"],
  ["Esta pensado para una beta simple y rapida", "Si", "No siempre"],
];

const isFor = [
  "Ya tenes atletas pagando y hoy gestionas rutinas, seguimiento y feedback entre WhatsApp, Excel o PDFs.",
  "Queres dar una experiencia mas profesional sin obligar a tu atleta a descargar otra app o crear otra cuenta.",
  "Estas creciendo y sentis que tu sistema actual empieza a quedar chico.",
];

const isNotFor = [
  "Buscas gestion de dietas, agenda integrada o videollamadas. Eso no esta en esta beta, pero si en el futuro.",
  "Todos tus atletas son presenciales y no necesitas registrar sesiones de forma digital.",
  "Ya usas una herramienta que funciona bien y tus atletas la adoptan sin friccion.",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-bg-base text-text-primary">
      <LandingHeader />
      <HeroSection />
      <div className="mx-auto w-full max-w-[1200px] px-5 pb-20 sm:px-8 lg:pb-28">
        <ProblemSection />
        <HowItWorksSection />
        <DifferentialSection />
        <AudienceSection />
        <BuildSection />
        <FinalCtaSection />
      </div>
      <LandingFooter />
    </main>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-base/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Impruv" className="flex items-center">
          <span className="block sm:hidden">
            <ImpruVLogo size={30} color="#A855F7" />
          </span>
          <span className="hidden sm:block">
            <ImpruVWordmark size="sm" color="#F8FAFC" />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button
          asChild
          className="rounded-app-full bg-purple-primary px-5 text-white shadow-purple-glow hover:bg-purple-bright"
        >
          <Link href="/beta">Quiero acceso a la beta</Link>
        </Button>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden border-b border-border-subtle">
      <Image
        src="/logo.png"
        alt=""
        width={900}
        height={900}
        priority
        className="pointer-events-none absolute right-[-260px] top-8 hidden w-[760px] max-w-none opacity-20 blur-[1px] lg:block"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,12,0.72)_0%,rgba(8,8,12,0.94)_72%,rgba(8,8,12,1)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.24),transparent_64%)]" />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1200px] content-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:py-16">
        <div className="max-w-3xl">
          <LandingBadge>Beta gratuita · Primeros coaches</LandingBadge>
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-tight text-text-primary sm:text-6xl lg:text-[64px]">
            Tus atletas entrenan desde un link.
            <span className="block text-purple-soft">
              Vos recibis pesos, reps y notas.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
            Creas la rutina, generas un link y se lo mandas. Tu atleta lo abre
            desde el celular, sin descargar nada y sin registrarse. Carga
            pesos, reps y notas; vos recibis la sesion en tu dashboard.
          </p>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <HeroProof icon={Link2} text="Solo link" />
            <HeroProof icon={Smartphone} text="Sin app" />
            <HeroProof icon={ShieldCheck} text="Sin registro" />
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="h-12 rounded-app-full bg-purple-primary px-7 text-white shadow-purple-glow hover:bg-purple-bright"
            >
              <Link href="/beta">
                Quiero acceso a la beta
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <a
              href="#conversacion"
              className="text-sm text-text-secondary underline-offset-4 transition hover:text-text-primary hover:underline"
            >
              Prefiero contar como trabajo hoy
            </a>
          </div>

          <p className="mt-4 text-xs font-medium text-text-muted">
            Beta gratuita · Sin tarjeta de credito · Cupos limitados para
            primeros coaches.
          </p>
        </div>

        <div className="relative self-center lg:pl-4">
          <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-purple-primary/20 blur-3xl" />
          <Image
            src="/mockup_atleta_navegador_transparente.png"
            alt="Vista del atleta entrenando desde un link en el navegador"
            width={1086}
            height={1448}
            priority
            sizes="(min-width: 1024px) 470px, (min-width: 640px) 420px, 92vw"
            className="h-auto w-full rounded-[24px]"
          />
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <Reveal>
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20 lg:items-start">
          <div className="max-w-md">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-text-primary sm:text-5xl">
              Gestionar atletas no deberia depender de WhatsApp, Excel y PDFs
            </h2>
            <p className="mt-5 text-base leading-8 text-text-secondary">
              Cuando tenes pocos atletas, lo podes manejar a mano. Pero cuando
              empezas a crecer, el sistema se vuelve dificil de sostener.
            </p>
            <p className="mt-4 text-base text-text-muted">
              Todo eso te quita tiempo, te desordena y hace mas dificil
              acompanar bien a cada atleta.
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {problemCards.map((card) => (
              <ProblemItem
                key={card.title}
                icon={card.icon}
                title={card.title}
                text={card.text}
              />
            ))}
          </div>
        </div>
      </Section>
    </Reveal>
  );
}

function HowItWorksSection() {
  return (
    <Reveal>
      <Section id="como-funciona">
        <SectionHeader
          title="Como funciona Impruv"
          text="Sin apps que instalar. Sin cuentas que crear. Sin explicarle nada raro a tu atleta."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <FeatureCard key={step.number}>
              <div className="flex size-11 items-center justify-center rounded-app-lg bg-purple-primary text-lg font-black text-white shadow-purple-glow">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-bold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                {step.text}
              </p>
            </FeatureCard>
          ))}
        </div>

        <div className="mt-8 rounded-app-xl border border-purple-primary/30 bg-purple-primary/10 p-5">
          <p className="font-semibold text-text-primary">
            Menos friccion para el atleta. Mas informacion util para vos.
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            El flujo esta pensado para que el atleta pueda entrenar desde el
            celular sin crear cuenta.
          </p>
        </div>
      </Section>
    </Reveal>
  );
}

function DifferentialSection() {
  return (
    <Reveal>
      <Section id="diferencial">
        <SectionHeader
          title="La diferencia es simple: el atleta no tiene que hacer nada extra"
          text="Muchas herramientas funcionan bien cuando el atleta adopta la app. El problema es que muchas veces no la descarga, no crea la cuenta o deja de usarla."
          align="center"
        />

        <div className="mt-10 rounded-app-2xl border border-purple-primary/35 bg-bg-surface-1 p-6 text-center shadow-elevation-2 sm:p-10">
          <p className="text-2xl font-extrabold text-text-primary sm:text-3xl">
            Impruv reduce esa friccion al minimo.
          </p>
          <p className="mt-3 text-lg font-semibold text-purple-soft">
            Tu atleta solo abre un link.
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Sin app. Sin registro. Sin cuenta.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-app-xl border border-border-subtle bg-bg-surface-1">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-5 py-4 text-left font-medium text-text-muted" />
                <th className="px-5 py-4 text-center font-bold text-purple-soft">Impruv</th>
                <th className="px-5 py-4 text-center font-medium text-text-muted">Apps tradicionales</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([feature, impruv, traditional], index) => (
                <tr
                  key={feature}
                  className={index < comparisonRows.length - 1 ? "border-b border-border-subtle/60" : undefined}
                >
                  <td className="px-5 py-4 text-text-secondary">{feature}</td>
                  <td className="px-5 py-4 text-center font-semibold text-purple-soft">{impruv}</td>
                  <td className="px-5 py-4 text-center text-text-muted">{traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Reveal>
  );
}

function AudienceSection() {
  return (
    <Reveal>
      <Section id="para-quien">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <AudienceList title="Impruv es para vos si..." items={isFor} positive />
          <AudienceList title="Impruv todavia no es para vos si..." items={isNotFor} />
        </div>
      </Section>
    </Reveal>
  );
}

function BuildSection() {
  return (
    <Reveal>
      <Section>
        <div className="rounded-app-2xl border border-border-subtle bg-bg-surface-1 p-8 shadow-elevation-3 sm:p-12">
          <div className="max-w-3xl">
            <LandingBadge>Lo que estamos construyendo</LandingBadge>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-text-primary sm:text-4xl">
              Una herramienta simple para seguir mejor a tus atletas
            </h2>
            <p className="mt-5 text-base leading-8 text-text-secondary">
              Impruv arranca con una idea concreta: que el coach pueda crear
              rutinas, compartirlas facil y recibir datos reales de entrenamiento
              sin perseguir al atleta.
            </p>
            <p className="mt-4 text-base leading-8 text-text-secondary">
              Estamos trabajando tambien en senales simples para ayudarte a
              detectar cuando un atleta alcanza el tope de un rango de reps y
              puede ser momento de ajustar la carga.
            </p>
            <p className="mt-4 text-base leading-8 text-text-secondary">
              Hoy estamos en beta. Queremos construir esto cerca de coaches que
              realmente manejan atletas y entienden el problema.
            </p>
          </div>
        </div>
      </Section>
    </Reveal>
  );
}

function FinalCtaSection() {
  return (
    <Section id="cta">
      <div
        id="conversacion"
        className="grid gap-10 rounded-app-2xl border border-border-subtle bg-bg-surface-1 p-6 shadow-elevation-3 sm:p-8 lg:grid-cols-[1fr_0.85fr] lg:p-12"
      >
        <div>
          <LandingBadge>Beta gratuita</LandingBadge>
          <h2 className="mt-5 max-w-xl text-3xl font-extrabold leading-tight text-text-primary sm:text-4xl">
            Probalo esta semana
          </h2>
          <p className="mt-4 text-base leading-8 text-text-secondary">
            Beta gratuita para los primeros coaches. Sin tarjeta, sin
            compromiso.
          </p>
          <CtaForm />
          <p className="mt-5 text-sm leading-6 text-text-muted">
            Te contactamos personalmente. No es un bot ni un email automatico.
            Queremos entender como trabajas antes de darte acceso a la beta.
          </p>
        </div>

        <div className="space-y-3">
          <ProofCard title="Sin registro del atleta" text="No descarga nada. No crea cuenta." />
          <ProofCard title="Pesos, reps y notas" text="Datos ordenados en el dashboard, sin capturas ni audios." />
          <ProofCard title="Beta gratuita" text="Pensada para primeros coaches que quieran probar con atletas reales." />
        </div>
      </div>
    </Section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-bg-base">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <ImpruVWordmark size="sm" color="#F8FAFC" />
            <p className="mt-3 text-sm text-text-muted">
              Seguimiento real para coaches fitness. Solo un link de por medio.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-text-muted">
            <a href="#como-funciona" className="transition hover:text-text-primary">Producto</a>
            <a href="#cta" className="transition hover:text-text-primary">Acceso beta</a>
            <a href="#conversacion" className="transition hover:text-text-primary">Contacto</a>
            <Link href="/auth/login" className="transition hover:text-text-primary">Iniciar sesion</Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border-subtle/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">2026 Impruv - Terminos - Privacidad</p>
          <p className="text-xs text-text-muted">Hecho para coaches que se toman en serio a sus atletas.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Local components (used only on this page) ────────────────────────────────

function AudienceList({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  const Icon = positive ? CheckCircle2 : X;

  return (
    <div>
      <h2 className="text-3xl font-extrabold leading-tight text-text-primary sm:text-4xl">
        {title}
      </h2>
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-app-lg border border-border-subtle bg-bg-surface-1 p-4"
          >
            <Icon
              className={`mt-0.5 size-5 shrink-0 ${positive ? "text-success" : "text-text-muted"}`}
            />
            <p className={positive ? "text-sm text-text-secondary" : "text-sm text-text-muted"}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
