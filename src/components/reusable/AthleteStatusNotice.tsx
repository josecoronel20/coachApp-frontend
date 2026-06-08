import { SyncStatus } from "@/components/ui/sync-status";

type AthleteStatusNoticeTone = "info" | "success" | "warning" | "error";

const toneToVariant = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "danger",
} as const;

export type AthleteStatusNoticeProps = {
  message: string;
  tone?: AthleteStatusNoticeTone;
  className?: string;
};

export function AthleteStatusNotice({
  message,
  tone = "info",
  className = "",
}: AthleteStatusNoticeProps) {
  return (
    <SyncStatus
      variant={toneToVariant[tone]}
      message={message}
      className={className}
    />
  );
}
