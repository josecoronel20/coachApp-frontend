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
import { useCoachStore } from "@/store/coachStore";
import { RoutineDay } from "@/types/routine";
import { Exercise } from "@/types/routine";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const FeedbackBtn = () => {
  const { athletesInfo } = useCoachStore();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Count the number of feedbacks
  const feedbackCount =
    athletesInfo?.reduce(
      (acc, athlete) =>
        acc +
        athlete.routine.reduce(
          (dayAcc: number, routineDay: RoutineDay) =>
            dayAcc +
            routineDay.reduce(
              (exerciseAcc: number, exercise: Exercise) =>
                exerciseAcc + (exercise.athleteNotes !== null ? 1 : 0),
              0
            ),
          0
        ),
      0
    ) || 0;

  // Get the feedback list with athlete name, exercise name and feedback of the exercise
  const feedbackList =
    athletesInfo
      ?.flatMap((athlete) =>
        athlete.routine.flatMap((routineDay: RoutineDay) =>
          routineDay.map((exercise: Exercise) => ({
            athleteId: athlete.id,
            athleteName: athlete.name,
            exerciseName: exercise.exercise,
            feedback: exercise.athleteNotes,
          }))
        )
      )
      .filter((feedback) => feedback.feedback !== null) || [];

  console.log(feedbackList);

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
          {feedbackList ? (
            feedbackList.map((feedback, index) => (
              <div
                key={index}
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

                <Link href={`/dashboard/athlete/${feedback.athleteId}`}>
                  <Button variant="outline" size="sm" className="w-full cursor-pointer">
                    Ir al perfil
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <p>No hay feedback reciente</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackBtn;
