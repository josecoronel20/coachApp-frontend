"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAthleteStore } from "@/store/useAthleteStore";

const DietInfo = () => {
  const { athlete } = useAthleteStore();
  const [open, setOpen] = useState(false);

  if (!athlete) return null;

  const hasDiet = Boolean(athlete.diet && athlete.diet.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {hasDiet ? "Ver dieta" : "Sin dieta"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plan de dieta</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm text-muted-foreground">
          {hasDiet ? (
            <p className="whitespace-pre-line text-foreground">{athlete.diet}</p>
          ) : (
            <p>Tu entrenador aún no cargó una dieta para ti.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DietInfo;
