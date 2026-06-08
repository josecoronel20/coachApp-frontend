"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { adminApi } from "@/app/api/admin";
import { Copy, Check, RefreshCw, AlertTriangle, Wrench, CheckCircle2 } from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type BetaRequest = {
  id: string;
  name: string;
  email: string;
  athleteCount: number;
  currentTool: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
};

type ApproveResult = { token: string; link: string; expiresAt: string };

type Coach = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  athleteCount: number;
  sessionCount: number;
};

type InviteToken = {
  id: string;
  email: string;
  tokenPreview: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  status: "active" | "used" | "expired";
};

type Activity = {
  totalBetaRequests: number;
  totalCoaches: number;
  recentSessions: number;
  activeAthletes: number;
};

type AuditSummary = {
  totalSessions: number;
  totalSessionExercises: number;
  totalExerciseHistory: number;
  defaultSnapshotRows: number;
  suspiciousSnapshotRows: number;
  repairableRows: number;
  orphanSnapshotRows: number;
  orphanExerciseIds: number;
  deltaHistoryVsSessionExercise: number;
};

type SuspiciousRow = {
  sessionExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  athleteId: string;
  date: string;
  dayIndex: number;
  weight: number;
  sets: number[];
  currentSnapshot: { minReps: number; maxReps: number; expectedSets: number };
  template: { minReps: number; maxReps: number; sets: number } | null;
  isSuspicious: boolean;
  isRepairable: boolean;
};

type AuditResult = {
  summary: AuditSummary;
  suspicious: SuspiciousRow[];
  orphans: SuspiciousRow[];
};

type Screen = "requests" | "coaches" | "tokens" | "activity" | "audit";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copiar"
      className="ml-1 inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition hover:bg-white/10"
    >
      {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

const STATUS_BADGE: Record<string, string> = {
  pending: "rounded px-2 py-0.5 text-xs font-semibold bg-yellow-500/15 text-yellow-300",
  approved: "rounded px-2 py-0.5 text-xs font-semibold bg-green-500/15 text-green-300",
  rejected: "rounded px-2 py-0.5 text-xs font-semibold bg-red-500/15 text-red-300",
  active: "rounded px-2 py-0.5 text-xs font-semibold bg-blue-500/15 text-blue-300",
  used: "rounded px-2 py-0.5 text-xs font-semibold bg-zinc-500/15 text-zinc-400",
  expired: "rounded px-2 py-0.5 text-xs font-semibold bg-orange-500/15 text-orange-300",
};

// ─── Componente principal ────────────────────────────────────────────────────

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const [secret, setSecret] = useState<string>("");
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
  const [screen, setScreen] = useState<Screen>("requests");

  // ── Auth: leer secret de URL o sessionStorage ────────────────────────────
  useEffect(() => {
    const fromUrl = searchParams.get("secret") ?? "";
    const fromStorage =
      typeof window !== "undefined"
        ? (sessionStorage.getItem("admin-secret") ?? "")
        : "";

    const resolved = fromUrl || fromStorage;
    if (!resolved) { setAuthed(false); return; }

    // Verificar contra el backend con una petición liviana
    const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "";
    fetch(`${BACKEND}/api/admin/activity`, {
      headers: { "X-Admin-Secret": resolved },
    }).then((r) => {
      if (r.ok) {
        sessionStorage.setItem("admin-secret", resolved);
        setSecret(resolved);
        setAuthed(true);
        // Limpiar el secret de la URL (sin recargar)
        if (fromUrl && typeof window !== "undefined") {
          const clean = window.location.pathname;
          window.history.replaceState({}, "", clean);
        }
      } else {
        setAuthed(false);
      }
    }).catch(() => setAuthed(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
        Verificando acceso...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-600 text-sm">404 — Not found</p>
      </div>
    );
  }

  const NAV: { id: Screen; label: string }[] = [
    { id: "requests", label: "Solicitudes beta" },
    { id: "coaches", label: "Coaches activos" },
    { id: "tokens", label: "Tokens" },
    { id: "activity", label: "Actividad" },
    { id: "audit", label: "🔍 Auditoría" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-zinc-800 pt-8 px-4">
        <p className="mb-6 px-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Impruv Ops
        </p>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                screen === item.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {screen === "requests" && <BetaRequestsScreen secret={secret} />}
        {screen === "coaches" && <CoachesScreen secret={secret} />}
        {screen === "tokens" && <TokensScreen secret={secret} />}
        {screen === "activity" && <ActivityScreen secret={secret} />}
        {screen === "audit" && <AuditScreen secret={secret} />}
      </main>
    </div>
  );
}

// ─── Pantalla 1: Solicitudes beta ────────────────────────────────────────────

function BetaRequestsScreen({ secret }: { secret: string }) {
  const [requests, setRequests] = useState<BetaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<Record<string, ApproveResult>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getBetaRequests(secret);
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests);
    }
    setLoading(false);
  }, [secret]);

  useEffect(() => { void load(); }, [load]);

  const approve = async (id: string) => {
    setBusy(id);
    const res = await adminApi.approveBetaRequest(secret, id);
    if (res.ok) {
      const data = await res.json();
      setApprovals((prev) => ({ ...prev, [id]: data }));
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
    }
    setBusy(null);
  };

  const reject = async (id: string) => {
    if (!confirm("¿Rechazar esta solicitud?")) return;
    setBusy(id);
    const res = await adminApi.rejectBetaRequest(secret, id);
    if (res.ok) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
      );
    }
    setBusy(null);
  };

  return (
    <div>
      <ScreenHeader title="Solicitudes de beta" onRefresh={load} />
      {loading ? <LoadingRow /> : (
        <Table
          headers={["Nombre", "Email", "Atletas", "Herramienta", "Fecha", "Estado", "Acciones"]}
        >
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-zinc-800 hover:bg-zinc-900/40">
              <td className="px-4 py-3 text-sm">{r.name}</td>
              <td className="px-4 py-3 text-sm text-zinc-300">{r.email}</td>
              <td className="px-4 py-3 text-sm text-center">{r.athleteCount}</td>
              <td className="px-4 py-3 text-sm text-zinc-400">{r.currentTool}</td>
              <td className="px-4 py-3 text-xs text-zinc-500">{fmtDate(r.createdAt)}</td>
              <td className="px-4 py-3">
                <span className={STATUS_BADGE[r.status]}>{r.status}</span>
              </td>
              <td className="px-4 py-3">
                {r.status === "pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={busy === r.id}
                      onClick={() => approve(r.id)}
                      className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50"
                    >
                      {busy === r.id ? "..." : "Aprobar"}
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => reject(r.id)}
                      className="rounded bg-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-600 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                ) : r.status === "approved" && approvals[r.id] ? (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <span className="font-mono truncate max-w-[180px]">
                      {approvals[r.id].link}
                    </span>
                    <CopyButton text={approvals[r.id].link} />
                  </div>
                ) : (
                  <span className="text-xs text-zinc-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

// ─── Pantalla 2: Coaches activos ─────────────────────────────────────────────

function CoachesScreen({ secret }: { secret: string }) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getCoaches(secret);
    if (res.ok) {
      const data = await res.json();
      setCoaches(data.coaches);
    }
    setLoading(false);
  }, [secret]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <ScreenHeader title="Coaches activos" onRefresh={load} />
      {loading ? <LoadingRow /> : (
        <Table headers={["Nombre", "Email", "Registro", "Atletas", "Sesiones", "Último acceso"]}>
          {coaches.map((c) => (
            <tr key={c.id} className="border-b border-zinc-800 hover:bg-zinc-900/40">
              <td className="px-4 py-3 text-sm">{c.name}</td>
              <td className="px-4 py-3 text-sm text-zinc-300">{c.email}</td>
              <td className="px-4 py-3 text-xs text-zinc-500">{fmtDate(c.createdAt)}</td>
              <td className="px-4 py-3 text-sm text-center">{c.athleteCount}</td>
              <td className="px-4 py-3 text-sm text-center">{c.sessionCount}</td>
              <td className="px-4 py-3 text-xs text-zinc-500">{fmtDate(c.lastLoginAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

// ─── Pantalla 3: Tokens ───────────────────────────────────────────────────────

function TokensScreen({ secret }: { secret: string }) {
  const [tokens, setTokens] = useState<InviteToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ link: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getTokens(secret);
    if (res.ok) {
      const data = await res.json();
      setTokens(data.tokens);
    }
    setLoading(false);
  }, [secret]);

  useEffect(() => { void load(); }, [load]);

  const generate = async () => {
    if (!newEmail.trim()) return;
    setGenerating(true);
    setGenerated(null);
    const res = await adminApi.generateToken(secret, newEmail.trim());
    if (res.ok) {
      const data = await res.json();
      setGenerated(data);
      setNewEmail("");
      void load();
    }
    setGenerating(false);
  };

  return (
    <div>
      <ScreenHeader title="Tokens de invitación" onRefresh={load} />

      {/* Generador manual */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <p className="mb-3 text-sm font-semibold text-zinc-300">Generar token para un email</p>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="email@ejemplo.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <button
            onClick={generate}
            disabled={generating || !newEmail.trim()}
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
          >
            {generating ? "Generando..." : "Generar"}
          </button>
        </div>
        {generated && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm">
            <span className="font-mono text-green-300 truncate">{generated.link}</span>
            <CopyButton text={generated.link} />
          </div>
        )}
      </div>

      {loading ? <LoadingRow /> : (
        <Table headers={["Email", "Token", "Creado", "Vence", "Estado"]}>
          {tokens.map((t) => (
            <tr key={t.id} className="border-b border-zinc-800 hover:bg-zinc-900/40">
              <td className="px-4 py-3 text-sm">{t.email}</td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                {t.tokenPreview}
                {t.status === "active" && <CopyButton text={`${window.location.origin}/auth/register?token=${t.token}`} />}
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500">{fmtDate(t.createdAt)}</td>
              <td className="px-4 py-3 text-xs text-zinc-500">{fmtDate(t.expiresAt)}</td>
              <td className="px-4 py-3">
                <span className={STATUS_BADGE[t.status]}>{t.status}</span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

// ─── Pantalla 4: Actividad ────────────────────────────────────────────────────

function ActivityScreen({ secret }: { secret: string }) {
  const [data, setData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getActivity(secret);
    if (res.ok) {
      const d = await res.json();
      setData(d);
    }
    setLoading(false);
  }, [secret]);

  useEffect(() => { void load(); }, [load]);

  const metrics = data
    ? [
        { label: "Solicitudes de beta recibidas", value: data.totalBetaRequests },
        { label: "Coaches registrados", value: data.totalCoaches },
        { label: "Sesiones completadas (últimos 7 días)", value: data.recentSessions },
        { label: "Atletas activos (con al menos 1 sesión)", value: data.activeAthletes },
      ]
    : [];

  return (
    <div>
      <ScreenHeader title="Actividad global" onRefresh={load} />
      {loading ? <LoadingRow /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
            >
              <p className="text-sm text-zinc-400">{m.label}</p>
              <p className="mt-2 text-4xl font-extrabold text-white">{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pantalla 5: Auditoría de sesiones ───────────────────────────────────────

function AuditScreen({ secret }: { secret: string }) {
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<{ repaired: number; skipped: number; message: string } | null>(null);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setRepairResult(null);
    const res = await adminApi.auditSessions(secret);
    if (res.ok) {
      setAudit(await res.json());
    }
    setLoading(false);
  }, [secret]);

  const runRepair = async () => {
    if (!confirm(`¿Reparar ${audit?.summary.repairableRows} filas? Esta operación es segura pero irreversible.`)) return;
    setRepairing(true);
    const res = await adminApi.repairSnapshots(secret);
    if (res.ok) {
      const data = await res.json();
      setRepairResult(data);
      // Re-ejecutar auditoría para ver el estado nuevo
      await runAudit();
    }
    setRepairing(false);
  };

  const s = audit?.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Auditoría de sesiones</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Detecta SessionExercise con snapshots en default que generan progresión incorrecta.
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Ejecutando..." : "Ejecutar auditoría"}
        </button>
      </div>

      {/* Resultado de reparación */}
      {repairResult && (
        <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-400" />
          <div>
            <p className="font-semibold text-green-300">Reparación completada</p>
            <p className="mt-1 text-sm text-zinc-400">{repairResult.message}</p>
          </div>
        </div>
      )}

      {!audit && !loading && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-600">
          Presioná "Ejecutar auditoría" para analizar los datos de producción.
        </div>
      )}

      {audit && (
        <>
          {/* Resumen en cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Total SessionExercise"
              value={s!.totalSessionExercises}
              sub={`${s!.totalSessions} sesiones`}
            />
            <StatCard
              label="Con snapshot default (1,1,1)"
              value={s!.defaultSnapshotRows}
              sub={`${s!.suspiciousSnapshotRows} sospechosos · ${s!.repairableRows} reparables`}
              alert={s!.suspiciousSnapshotRows > 0}
            />
            <StatCard
              label="Ejercicios eliminados en historial"
              value={s!.orphanExerciseIds}
              sub={`${s!.orphanSnapshotRows} filas sin template`}
              alert={s!.orphanExerciseIds > 0}
            />
          </div>

          {/* Delta ExerciseHistory vs SessionExercise */}
          {s!.deltaHistoryVsSessionExercise !== 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-300">Desincronización detectada</p>
                <p className="mt-1 text-sm text-zinc-400">
                  ExerciseHistory ({s!.totalExerciseHistory}) y SessionExercise ({s!.totalSessionExercises})
                  difieren en <strong className="text-white">{Math.abs(s!.deltaHistoryVsSessionExercise)}</strong> registros.
                  Esto indica sesiones guardadas antes de que existieran los snapshots.
                </p>
              </div>
            </div>
          )}

          {/* Botón de reparación */}
          {s!.repairableRows > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <Wrench className="mt-0.5 size-5 shrink-0 text-blue-400" />
              <div className="flex-1">
                <p className="font-semibold text-blue-300">Reparación disponible</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {s!.repairableRows} fila(s) se pueden reparar haciendo backfill desde el template actual del ejercicio.
                  Esta operación es segura — solo actualiza filas con snapshot default cuando el template existe.
                </p>
              </div>
              <button
                onClick={runRepair}
                disabled={repairing}
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {repairing ? "Reparando..." : `Reparar ${s!.repairableRows} filas`}
              </button>
            </div>
          )}

          {s!.suspiciousSnapshotRows === 0 && s!.orphanExerciseIds === 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <CheckCircle2 className="size-5 text-green-400" />
              <p className="text-sm font-semibold text-green-300">
                Todo limpio. No se encontraron problemas en los datos de sesiones.
              </p>
            </div>
          )}

          {/* Tabla de filas sospechosas */}
          {audit.suspicious.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Filas sospechosas — snapshot default pero template con valores distintos
              </h2>
              <Table headers={["Ejercicio", "Atleta", "Fecha", "Día", "Snapshot actual", "Template real", "Peso / Reps"]}>
                {audit.suspicious.map((row) => (
                  <tr key={row.sessionExerciseId} className="border-b border-zinc-800 hover:bg-zinc-900/40">
                    <td className="px-4 py-3 text-sm font-medium text-white">{row.exerciseName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-500">{row.athleteId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{row.date}</td>
                    <td className="px-4 py-3 text-xs text-center text-zinc-400">{row.dayIndex + 1}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="rounded bg-red-500/15 px-2 py-0.5 text-red-400">
                        {row.currentSnapshot.minReps}-{row.currentSnapshot.maxReps} · {row.currentSnapshot.expectedSets} series
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {row.template ? (
                        <span className="rounded bg-green-500/15 px-2 py-0.5 text-green-400">
                          {row.template.minReps}-{row.template.maxReps} · {row.template.sets} series
                        </span>
                      ) : (
                        <span className="text-zinc-600">eliminado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {row.weight}kg / {row.sets.join("-")}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* Tabla de huérfanos */}
          {audit.orphans.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Registros huérfanos — ejercicio eliminado, historial sin template
              </h2>
              <Table headers={["Nombre snapshot", "Atleta", "Fecha", "Peso / Reps"]}>
                {audit.orphans.map((row) => (
                  <tr key={row.sessionExerciseId} className="border-b border-zinc-800 hover:bg-zinc-900/40">
                    <td className="px-4 py-3 text-sm text-zinc-400 italic">{row.exerciseName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-500">{row.athleteId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{row.date}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{row.weight}kg / {row.sets.join("-")}</td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: number;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${alert ? "border-red-500/30 bg-red-500/10" : "border-zinc-800 bg-zinc-900/60"}`}>
      <p className={`text-sm ${alert ? "text-red-400" : "text-zinc-400"}`}>{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${alert ? "text-red-300" : "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

// ─── Primitivos de UI ─────────────────────────────────────────────────────────

function ScreenHeader({ title, onRefresh }: { title: string; onRefresh: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-white">{title}</h1>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
      >
        <RefreshCw className="size-3" />
        Actualizar
      </button>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-max text-left">
        <thead className="border-b border-zinc-800 bg-zinc-900/80">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="py-12 text-center text-sm text-zinc-600">Cargando...</div>
  );
}
