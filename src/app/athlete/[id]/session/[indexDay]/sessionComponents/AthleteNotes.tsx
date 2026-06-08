"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const AthleteNotes = ({ 
  notes, 
  onNotesChange 
}: { 
  notes?: string;
  onNotesChange?: (notes: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState(notes || "");

  // Sincronizar el estado interno cuando cambien las props
  useEffect(() => {
    setNoteText(notes || "");
  }, [notes]);

  return (
    <div className="w-full pb-16">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full rounded-full border-border-strong bg-bg-surface-2 text-text-secondary hover:bg-bg-surface-3 hover:text-text-primary"
          >
            <span className="text-sm">
              {noteText ? "Ver / editar comentario" : "Dejar un comentario"}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="border-border-subtle bg-bg-surface-2">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              ¿Tuviste alguna dificultad con el ejercicio?
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            rows={3}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escribí tu comentario acá..."
            className="select-text border-border-strong bg-bg-surface-1 text-text-primary placeholder:text-text-muted"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full border-border-strong bg-bg-surface-1 text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onNotesChange?.(noteText);
                setOpen(false);
              }}
              className="rounded-full bg-purple-primary text-white hover:opacity-90"
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthleteNotes;
