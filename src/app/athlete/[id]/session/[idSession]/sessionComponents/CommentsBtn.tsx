import { MessageCircle, Send } from 'lucide-react'
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { TrainingExercise } from "../types";

interface CommentsBtnProps {
  exercise: TrainingExercise | undefined;
  onUpdateAthleteNotes: (notes: string) => void;
}

const CommentsBtn = ({ exercise, onUpdateAthleteNotes }: CommentsBtnProps) => {
  const [athleteNotes, setAthleteNotes] = useState(exercise?.athleteNotes || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveNotes = () => {
    onUpdateAthleteNotes(athleteNotes);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setAthleteNotes(exercise?.athleteNotes || "");
    setIsOpen(false);
  };

  // Don't render if exercise is undefined
  if (!exercise) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <MessageCircle className="h-4 w-4" /> Comentarios
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className={exercise?.athleteNotes ? "text-blue-600" : ""}>
                <MessageCircle className="h-4 w-4" /> 
                {exercise?.athleteNotes ? "Ver Comentarios" : "Comentarios"}
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Comentarios sobre {exercise?.exercise || "este ejercicio"}</DialogTitle>
                <DialogDescription>
                    Revisa los comentarios del entrenador y deja tu feedback sobre este ejercicio
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
                {/* Coach Comments Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">Entrenador</Badge>
                    </div>
                    <Card>
                        <CardContent className="">
                            {exercise?.coachNotes ? (
                                <p className="text-sm text-muted-foreground">
                                    {exercise.coachNotes}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No hay comentarios del entrenador para este ejercicio.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Athlete Comments Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Tú</Badge>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="athlete-notes" className="text-sm">
                            ¿Cómo te sientes con este ejercicio?
                        </Label>
                        <Textarea
                            id="athlete-notes"
                            placeholder="Describe cómo te sientes, si tienes dolor, dificultades, o cualquier observación importante..."
                            value={athleteNotes}
                            onChange={(e) => setAthleteNotes(e.target.value)}
                            maxLength={500}
                            rows={4}
                            className="text-sm resize-none"
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Comparte tus sensaciones, dolor, dificultades, etc.</span>
                            <span>{athleteNotes.length}/500</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button
                        onClick={handleSaveNotes}
                        size="sm"
                        className="flex-1"
                        disabled={athleteNotes === (exercise?.athleteNotes || "")}
                    >
                        <Send className="h-4 w-4 mr-1" />
                        Guardar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        size="sm"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default CommentsBtn;
