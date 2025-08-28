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
  coachNotes: string;
  athleteNotes: string;
  setAthleteNotes: (text: string) => void;
}

const CommentsBtn = ({ coachNotes, athleteNotes, setAthleteNotes }: CommentsBtnProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className={athleteNotes ? "text-blue-600" : ""}>
                <MessageCircle className="h-4 w-4" /> 
                {athleteNotes ? "Ver Comentarios" : "Comentarios"}
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Comentarios sobre este ejercicio</DialogTitle>
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
                            {coachNotes ? (
                                <p className="text-sm text-muted-foreground">
                                    {coachNotes}
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

                </div>
        </DialogContent>
    </Dialog>
  );
};

export default CommentsBtn;
