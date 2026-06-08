"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetAllAthletesWithRoutine } from "@/hooks/useGetAllAthletesWithRoutine";
import type { Athlete } from "@/types/athleteType";
import { RoutineDay } from "@/types/routineType";
import { Exercise } from "@/types/routineType";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

interface FeedbackItem {
  athleteId: string;
  athleteName: string;
  exerciseName: string;
  feedback: string;
}

const FeedbackBtn = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { athletes, isLoading } = useGetAllAthletesWithRoutine(true);
  const [cachedFeedbackList, setCachedFeedbackList] = useState<FeedbackItem[]>(
    []
  );

  // Get the feedback list with athlete name, exercise name and feedback of the exercise
  const feedbackList: FeedbackItem[] = useMemo(() => {
    if (!athletes || athletes.length === 0) {
      return [];
    }

    const list = athletes
      .flatMap((athlete: Athlete) => {
        if (!athlete.routine || athlete.routine.length === 0) {
          return [];
        }

        return athlete.routine.flatMap((routineDay: RoutineDay) => {
          if (!routineDay || routineDay.length === 0) {
            return [];
          }

          return routineDay
            .filter((exercise: Exercise) => {
              const hasNotes =
                exercise.athleteNotes && exercise.athleteNotes.trim() !== "";
              return hasNotes;
            })
            .map((exercise: Exercise) => ({
              athleteId: athlete.id,
              athleteName: athlete.name,
              exerciseName: exercise.exercise,
              feedback: exercise.athleteNotes,
            }));
        });
      });

    return list;
  }, [athletes]);

  useEffect(() => {
    if (athletes) {
      setCachedFeedbackList(feedbackList);
    }
  }, [athletes, feedbackList]);

  const visibleFeedbackList = athletes ? feedbackList : cachedFeedbackList;

  // Count the number of feedbacks
  const feedbackCount = useMemo(() => {
    return visibleFeedbackList.length;
  }, [visibleFeedbackList]);

  return (
    <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="h-4 w-4" />
          {feedbackCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {feedbackCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Feedback Reciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Cargando feedback...
            </p>
          ) : visibleFeedbackList.length > 0 ? (
            visibleFeedbackList.map((feedback: FeedbackItem, index: number) => (
              <div
                key={`${feedback.athleteId}-${index}`}
                className="border p-2 rounded-md border-gray-200 pb-2 flex flex-col gap-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold">{feedback.athleteName}</p>
                    <p className="text-sm text-muted-foreground">
                      {feedback.exerciseName}
                    </p>
                  </div>
                  <p className="text-sm text-red-500">{feedback.feedback}</p>
                </div>

                <Link href={`/dashboard/athlete/${feedback.athleteId}`} onClick={() => setFeedbackOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full cursor-pointer">
                    Ir al perfil
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay feedback reciente
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackBtn;
