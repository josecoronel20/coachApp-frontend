export type CoachNotificationType =
  | "athlete_note"
  | "payment_overdue"
  | "session_completed";

export type CoachNotification = {
  id: string;
  type: CoachNotificationType;
  athleteId: string;
  athleteName: string;
  title: string;
  message: string;
  receivedAt: string | null;
  href: string;
};
