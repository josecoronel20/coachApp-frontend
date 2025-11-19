"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateAthleteDiet } from "@/app/api/protected";

interface AthleteDietCardProps {
  athleteId: string;
  initialDiet: string;
  onDietSaved?: () => void;
}

const AthleteDietCard = ({ athleteId, initialDiet, onDietSaved }: AthleteDietCardProps) => {
  const [diet, setDiet] = useState(initialDiet || "");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  useEffect(() => {
    setDiet(initialDiet || "");
  }, [initialDiet]);

  const handleSave = async () => {
    setStatus("saving");
    try {
      const response = await updateAthleteDiet(athleteId, diet);
      if (!response.ok) {
        throw new Error("Failed to update diet");
      }
      setStatus("success");
      onDietSaved?.();
    } catch (error) {
      console.error("Error updating diet:", error);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Plan de dieta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={diet}
          onChange={(event) => setDiet(event.target.value)}
          placeholder="Describe la dieta actual del atleta..."
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          El atleta verá esta información en su enlace personal.
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {status === "success" && (
          <span className="text-xs text-primary">Dieta guardada</span>
        )}
        {status === "error" && (
          <span className="text-xs text-destructive">
            No se pudo guardar, intenta nuevamente.
          </span>
        )}
        <Button
          type="button"
          size="sm"
          className="ml-auto"
          onClick={handleSave}
          disabled={status === "saving"}
        >
          {status === "saving" ? "Guardando..." : "Guardar dieta"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AthleteDietCard;
