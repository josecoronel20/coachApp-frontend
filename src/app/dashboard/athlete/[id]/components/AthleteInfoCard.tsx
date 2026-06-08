"use client";

import { useState, useMemo } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBanner } from "@/components/ui/status-banner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateRepsTracked } from "@/app/api/athlete";
import { updateAthleteBasicInfo } from "@/app/api/protected";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Athlete } from "@/types/athleteType";

interface AthleteInfoCardProps {
  athlete: Athlete;
  onRepsTrackedSaved?: () => Promise<void> | void;
}

const INITIALIZE_FORM = (athlete: Athlete) => ({
  name: athlete.name || "",
  email: athlete.email || "",
  phone: athlete.phone || "",
  bodyWeight: athlete.bodyWeight ?? 0,
  notes: athlete.notes || "",
});

const AthleteInfoCard = ({ athlete, onRepsTrackedSaved }: AthleteInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => INITIALIZE_FORM(athlete));
  const [repsTracked, setRepsTracked] = useState(athlete.repsTracked);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calcula notas pendientes de revisión
  const notesToReview = useMemo(
    () =>
      athlete.routine?.reduce(
        (acc, day) =>
          acc + day.reduce((count, ex) => count + (ex.athleteNotes ? 1 : 0), 0),
        0
      ) ?? 0,
    [athlete.routine]
  );

  const onField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "bodyWeight"
          ? Number(e.target.value)
          : e.target.value
    }));
  };

  const handleCancel = () => {
    setForm(INITIALIZE_FORM(athlete));
    setError(null);
    setIsEditing(false);
  };

  const handleRepsTrackedChange = async (checked: boolean) => {
    const previous = repsTracked;
    setRepsTracked(checked);
    setError(null);

    try {
      const response = await updateRepsTracked(athlete.id, checked);
      if (!response.ok) {
        setRepsTracked(previous);
        setError(
          await getApiErrorMessage(response, "No se pudo actualizar el modo detallado")
        );
        return;
      }

      await onRepsTrackedSaved?.();
    } catch {
      setRepsTracked(previous);
      setError("Error de red al actualizar el modo detallado");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const resp = await updateAthleteBasicInfo(
        athlete.id,
        form.name,
        form.email,
        form.phone,
        form.notes
      );
      if (resp.ok) {
        setIsEditing(false);
      } else {
        setError(await getApiErrorMessage(resp, "No se pudo actualizar"));
      }
    } catch {
      setError("Error de red o del servidor");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="w-full rounded-app-2xl border border-border-subtle bg-bg-surface-1 px-6 py-5 shadow-elevation-2">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-text-primary">Informacion personal</h3>
        {!isEditing && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Editar informacion del atleta"
            onClick={() => setIsEditing(true)}
            className="rounded-app-xl"
          >
            <Edit className="size-5" />
          </Button>
        )}
      </header>

      {!isEditing ? (
        <dl className="grid gap-y-3 text-sm text-text-secondary">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-text-muted">Nombre</dt>
            <dd className="text-text-primary">{athlete.name}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-text-muted">Email</dt>
            <dd className="text-text-primary">{athlete.email || <span className="italic text-text-muted">No disponible</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-text-muted">Telefono</dt>
            <dd className="text-text-primary">{athlete.phone || <span className="italic text-text-muted">No disponible</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-text-muted">Peso corporal</dt>
            <dd className="text-text-primary">{athlete.bodyWeight ? `${athlete.bodyWeight} kg` : <span className="italic text-text-muted">No registrado</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-text-muted">Observaciones</dt>
            <dd className="text-text-primary">{athlete.notes || <span className="italic text-text-muted">No registradas</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5 mt-2">
            <dt className="text-xs font-medium text-text-muted">Notas del atleta</dt>
            <dd className={notesToReview ? "font-semibold text-warning" : "font-medium text-purple-soft"}>
              {notesToReview
                ? `Hay ${notesToReview} nota${notesToReview > 1 ? "s" : ""} pendiente${notesToReview > 1 ? "s" : ""} de revision`
                : "No hay notas pendientes"}
            </dd>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-app-xl border border-border-subtle bg-bg-surface-2 p-3">
            <div className="space-y-0.5">
              <dt className="text-xs font-medium text-text-muted">Modo de registro</dt>
              <dd className="text-sm text-text-primary">
                {repsTracked ? "Detallado por serie" : "Simple"}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="coach-reps-tracked"
                checked={repsTracked}
                onCheckedChange={handleRepsTrackedChange}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="coach-reps-tracked" className="text-xs text-text-secondary">
                Detallado
              </Label>
            </div>
          </div>
        </dl>
      ) : (
        <form
          className="grid gap-5"
          onSubmit={handleSave}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nombre</label>
              <Input
                value={form.name}
                onChange={onField("name")}
                required
                placeholder="Nombre del atleta"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={onField("email")}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Teléfono</label>
              <Input
                value={form.phone}
                onChange={onField("phone")}
                placeholder="+34 600 000 000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Peso corporal (kg)</label>
              <Input
                type="number"
                value={form.bodyWeight}
                disabled
                className="cursor-not-allowed bg-muted text-muted-foreground"
                readOnly
              />
              <span className="mt-1 block text-xs text-muted-foreground/70">Solo puede ser actualizado por el atleta.</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Observaciones</label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={onField("notes")}
              placeholder="Notas médicas o recordatorios importantes"
            />
          </div>
          {error && (
            <StatusBanner variant="danger" message={error} />
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="submit"
              disabled={isSaving}
              className="font-semibold"
            >
              <Save className="mr-2 h-4 w-4" /> Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AthleteInfoCard;
