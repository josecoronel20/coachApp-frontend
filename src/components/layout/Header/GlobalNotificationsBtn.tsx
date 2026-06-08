"use client";

import Link from "next/link";
import { Bell, CreditCard, Dumbbell, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCoachNotifications } from "@/hooks/useCoachNotifications";
import type {
  CoachNotification,
  CoachNotificationType,
} from "@/types/coachNotificationType";
import { useMemo, useState } from "react";

const notificationMeta: Record<
  CoachNotificationType,
  {
    label: string;
    icon: typeof MessageSquare;
    badgeVariant: "purple" | "warning" | "success";
  }
> = {
  athlete_note: {
    label: "Nota",
    icon: MessageSquare,
    badgeVariant: "purple",
  },
  payment_overdue: {
    label: "Cuota",
    icon: CreditCard,
    badgeVariant: "warning",
  },
  session_completed: {
    label: "Sesion",
    icon: Dumbbell,
    badgeVariant: "success",
  },
};

function formatNotificationTime(receivedAt: string | null) {
  if (!receivedAt) return "Sin hora";

  const date = new Date(receivedAt);
  if (Number.isNaN(date.getTime())) return "Sin hora";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return "Recien";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationItem({
  notification,
  onOpenChange,
}: {
  notification: CoachNotification;
  onOpenChange: (open: boolean) => void;
}) {
  const meta = notificationMeta[notification.type];
  const Icon = meta.icon;

  return (
    <article className="rounded-app-xl border border-border-subtle bg-bg-surface-1 p-3 shadow-elevation-0">
      <div className="flex gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-app-lg border border-border-subtle bg-bg-surface-2 text-purple-soft">
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
            <span className="text-xs text-text-muted">
              {formatNotificationTime(notification.receivedAt)}
            </span>
          </div>

          <p className="mt-2 text-sm font-bold text-text-primary">
            {notification.athleteName}
          </p>
          <p className="mt-1 text-sm text-text-secondary">{notification.message}</p>

          <Button asChild variant="outline" size="sm" className="mt-3 w-full">
            <Link href={notification.href} onClick={() => onOpenChange(false)}>
              Ver atleta
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

const GlobalNotificationsBtn = () => {
  const [open, setOpen] = useState(false);
  const { notifications, isLoading } = useCoachNotifications();

  const notificationCount = notifications.length;
  const cappedCount = notificationCount > 99 ? "99+" : String(notificationCount);

  const groupedCounts = useMemo(
    () => ({
      notes: notifications.filter((item) => item.type === "athlete_note").length,
      payments: notifications.filter((item) => item.type === "payment_overdue").length,
      sessions: notifications.filter((item) => item.type === "session_completed").length,
    }),
    [notifications]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge
              variant="danger"
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {cappedCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md border-border-subtle bg-bg-surface-2 text-text-primary">
        <DialogHeader>
          <DialogTitle>Notificaciones</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
          <Badge variant="purple">Notas {groupedCounts.notes}</Badge>
          <Badge variant="warning">Cuotas {groupedCounts.payments}</Badge>
          <Badge variant="success">Sesiones {groupedCounts.sessions}</Badge>
        </div>

        <div className="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-text-secondary">
              Cargando notificaciones...
            </p>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpenChange={setOpen}
              />
            ))
          ) : (
            <p className="py-6 text-center text-sm text-text-secondary">
              No hay notificaciones pendientes.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalNotificationsBtn;
