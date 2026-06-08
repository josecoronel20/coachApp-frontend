"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitBetaRequest } from "@/app/api/beta";

type CtaStatus = "idle" | "loading" | "success" | "duplicate" | "error";

const SELECT_CLASS =
  "h-12 w-full rounded-app-lg border border-border-subtle bg-bg-surface-1 px-3 text-sm text-text-secondary outline-none transition focus:border-purple-soft focus:ring-[3px] focus:ring-purple-soft/30";

function CtaConfirmation({ duplicate }: { duplicate?: boolean }) {
  return (
    <div className="mt-6 rounded-app-xl border border-purple-primary/30 bg-purple-primary/10 p-6 text-center">
      <CheckCircle2 className="mx-auto size-8 text-purple-soft" />
      <p className="mt-3 font-bold text-text-primary">
        {duplicate ? "Ya tenemos tu solicitud." : "Recibimos tu solicitud."}
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        {duplicate ? "Te contactamos pronto." : "Te contactamos en las próximas 48 horas."}
      </p>
    </div>
  );
}

export function CtaForm() {
  const [status, setStatus] = useState<CtaStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [athleteCount, setAthleteCount] = useState("");
  const [currentTool, setCurrentTool] = useState("");

  if (status === "success") return <CtaConfirmation />;
  if (status === "duplicate") return <CtaConfirmation duplicate />;

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
      setStatus(!res.ok ? "error" : data.duplicate ? "duplicate" : "success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
      <Input
        required
        type="text"
        placeholder="Nombre"
        className="h-12"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        required
        type="email"
        placeholder="Email"
        className="h-12"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="sr-only" htmlFor="athletes-count">
        Cantidad de atletas
      </label>
      <select
        id="athletes-count"
        required
        value={athleteCount}
        onChange={(e) => setAthleteCount(e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="" disabled>Cuantos atletas manejas hoy?</option>
        <option value="5">1-5 atletas</option>
        <option value="15">6-15 atletas</option>
        <option value="16">16 o mas</option>
      </select>
      <label className="sr-only" htmlFor="current-tool">
        Herramienta actual
      </label>
      <select
        id="current-tool"
        required
        value={currentTool}
        onChange={(e) => setCurrentTool(e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="" disabled>Que herramienta usas hoy?</option>
        <option value="WhatsApp + Excel">WhatsApp + Excel</option>
        <option value="WhatsApp + PDFs">WhatsApp + PDFs</option>
        <option value="Trainerize / TrueCoach / similar">Trainerize / TrueCoach / similar</option>
        <option value="No uso ninguna">No uso ninguna</option>
        <option value="Otra">Otra</option>
      </select>

      {status === "error" && (
        <p className="text-sm text-danger">Algo salió mal. Intentá de nuevo.</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "loading"}
        className="h-12 w-full rounded-app-full bg-purple-primary text-white shadow-purple-glow hover:bg-purple-bright"
      >
        {status !== "loading" && <ArrowRight className="size-5" />}
        {status === "loading" ? "Enviando..." : "Quiero acceso a la beta"}
      </Button>
    </form>
  );
}
