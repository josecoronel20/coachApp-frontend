"use client";

import { useState, useMemo } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAthleteBasicInfo } from "@/app/api/protected";
import type { Athlete } from "@/types/athleteType";

interface AthleteInfoCardProps {
  athlete: Athlete;
}

const INITIALIZE_FORM = (athlete: Athlete) => ({
  name: athlete.name || "",
  email: athlete.email || "",
  phone: athlete.phone || "",
  bodyWeight: athlete.bodyWeight ?? 0,
  notes: athlete.notes || "",
});

const AthleteInfoCard = ({ athlete }: AthleteInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => INITIALIZE_FORM(athlete));
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
        const data = await resp.json();
        setError(data?.message || "No se pudo actualizar");
      }
    } catch {
      setError("Error de red o del servidor");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm w-full">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground tracking-tight">Información personal</h3>
        {!isEditing && (
          <Button
            variant="secondary"
            size="icon"
            aria-label="Editar información del atleta"
            onClick={() => setIsEditing(true)}
            className="border border-border text-muted-foreground hover:text-primary"
          >
            <Edit className="h-5 w-5" />
          </Button>
        )}
      </header>

      {!isEditing ? (
        <dl className="grid gap-y-2 text-sm text-muted-foreground">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground/70">Nombre</dt>
            <dd className="text-foreground">{athlete.name}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground/70">Email</dt>
            <dd className="text-foreground">{athlete.email || <span className="italic text-muted-foreground">No disponible</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground/70">Teléfono</dt>
            <dd className="text-foreground">{athlete.phone || <span className="italic text-muted-foreground">No disponible</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground/70">Peso corporal</dt>
            <dd className="text-foreground">{athlete.bodyWeight ? `${athlete.bodyWeight} kg` : <span className="italic text-muted-foreground">No registrado</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground/70">Observaciones</dt>
            <dd className="text-foreground">{athlete.notes || <span className="italic text-muted-foreground">No registradas</span>}</dd>
          </div>
          <div className="flex flex-col gap-0.5 mt-2">
            <dt className="text-xs font-medium text-muted-foreground/70">Notas del atleta</dt>
            <dd className={notesToReview ? "font-semibold text-destructive" : "font-medium text-primary"}>
              {notesToReview
                ? `Hay ${notesToReview} nota${notesToReview > 1 ? "s" : ""} pendiente${notesToReview > 1 ? "s" : ""} de revisión`
                : "No hay notas pendientes"}
            </dd>
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
            <p className="rounded bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
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
