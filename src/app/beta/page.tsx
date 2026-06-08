"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImpruVWordmark } from "@/components/brand/ImpruVWordmark";
import { submitBetaRequest } from "@/app/api/beta";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

const selectClass =
  "h-12 w-full rounded-[14px] border border-white/[0.08] bg-[#0F1014] px-3 text-sm text-[#A1A1AA] outline-none transition focus:border-[#8B5CF6]/60 focus:ring-[3px] focus:ring-[#8B5CF6]/25";

export default function BetaPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [athleteCount, setAthleteCount] = useState("");
  const [currentTool, setCurrentTool] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await submitBetaRequest({
        name,
        email,
        athleteCount: Number(athleteCount),
        currentTool,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus(data.duplicate ? "duplicate" : "success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#08090B] px-5 py-12 text-[#F5F5F7]">
      {/* Gradiente de fondo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(168,85,247,0.14),transparent_30%)]" />

      {/* Header mínimo */}
      <div className="relative mb-10 flex w-full max-w-lg items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-[#A1A1AA] transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
        <ImpruVWordmark size="sm" color="#F8FAFC" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-lg rounded-[32px] border border-white/[0.08] bg-[#17181D]/95 p-8 shadow-[0_28px_90px_rgba(0,0,0,0.46)]">
        {status === "success" || status === "duplicate" ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-[#A78BFA]" />
            <h1 className="mt-5 text-2xl font-bold text-white">
              {status === "success"
                ? "Recibimos tu solicitud."
                : "Ya tenemos tu solicitud."}
            </h1>
            <p className="mt-2 text-[#A1A1AA]">
              {status === "success"
                ? "Te contactamos en las próximas 48 horas."
                : "Te contactamos pronto."}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-8 rounded-full border-white/[0.1] bg-white/[0.03] text-[#F5F5F7] hover:bg-white/[0.08]"
            >
              <Link href="/">Volver a la home</Link>
            </Button>
          </div>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#C4B5FD]">
              Beta gratuita · Primeros coaches
            </span>

            <h1 className="mt-5 text-2xl font-extrabold text-white">
              Solicitá acceso a la beta
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
              Cupos limitados. Te contactamos personalmente antes de darte acceso.
            </p>

            <form className="mt-7 space-y-3" onSubmit={handleSubmit}>
              <Input
                required
                type="text"
                placeholder="Nombre"
                className="h-12 rounded-[14px] border-white/[0.08] bg-[#0F1014] text-white placeholder:text-[#71717A] focus-visible:ring-[#8B5CF6]/40"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                required
                type="email"
                placeholder="Email"
                className="h-12 rounded-[14px] border-white/[0.08] bg-[#0F1014] text-white placeholder:text-[#71717A] focus-visible:ring-[#8B5CF6]/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="sr-only" htmlFor="beta-athlete-count">
                Cantidad de atletas
              </label>
              <select
                id="beta-athlete-count"
                required
                value={athleteCount}
                onChange={(e) => setAthleteCount(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Cuántos atletas manejás hoy?</option>
                <option value="5">1-5 atletas</option>
                <option value="15">6-15 atletas</option>
                <option value="16">16 o más</option>
              </select>
              <label className="sr-only" htmlFor="beta-current-tool">
                Herramienta actual
              </label>
              <select
                id="beta-current-tool"
                required
                value={currentTool}
                onChange={(e) => setCurrentTool(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>¿Qué herramienta usás hoy?</option>
                <option value="WhatsApp + Excel">WhatsApp + Excel</option>
                <option value="WhatsApp + PDFs">WhatsApp + PDFs</option>
                <option value="Trainerize / TrueCoach / similar">Trainerize / TrueCoach / similar</option>
                <option value="No uso ninguna">No uso ninguna</option>
                <option value="Otra">Otra</option>
              </select>

              {status === "error" && (
                <p className="text-sm text-red-400">
                  Algo salió mal. Intentá de nuevo.
                </p>
              )}

              <Button
                type="submit"
                disabled={status === "loading"}
                className="h-12 w-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] font-semibold text-white shadow-[0_16px_42px_rgba(139,92,246,0.28)] hover:opacity-95"
              >
                {status === "loading" ? "Enviando..." : (
                  <>Solicitar acceso<ArrowRight className="size-5" /></>
                )}
              </Button>
            </form>

            <p className="mt-5 text-xs leading-5 text-[#71717A]">
              Beta gratuita · Sin tarjeta de crédito · Cupos limitados.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
