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
        <Button variant="outline" className="w-full">
          <span className="text-sm">Dejar un comentario</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tuviste alguna dificultad en el ejercicio?</DialogTitle>
        </DialogHeader>
        <Textarea
          value={noteText}
          rows={3}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Escribe tu comentario aquí..."
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              onNotesChange?.(noteText);
              setOpen(false);
            }}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog></div>
  );
};

export default AthleteNotes;
