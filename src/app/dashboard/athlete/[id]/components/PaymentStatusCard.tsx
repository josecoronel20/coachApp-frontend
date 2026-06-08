"use client";

import { useMemo, useState } from "react";
import { Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updatePaymentDate } from "@/app/api/protected";
import { useGetAllAthletes } from "@/hooks/useGetAllAthletes";

interface PaymentStatusCardProps {
  athleteId: string;
  paymentDate: string;
  onPaymentSaved?: () => Promise<void> | void;
}

interface PaymentStatus {
  label: string;
  tone: "positive" | "warning" | "negative";
  badgeClass: string;
  icon: React.ReactNode;
  helperText: string;
  highlight?: string;
}

const PAYMENT_WINDOW_DAYS = 30;
const PAYMENT_GRACE_DAYS = 7;
const STATUS_STYLES = {
  positive: { badge: "border-success/25 bg-success/10 text-success", text: "text-success" },
  warning: { badge: "border-warning/25 bg-warning/10 text-warning", text: "text-warning" },
  negative: { badge: "border-danger/25 bg-danger/10 text-danger", text: "text-danger" },
} as const;

/**
 * Muestra el estado de pago del atleta y permite marcar un pago nuevo.
 */
const PaymentStatusCard = ({
  athleteId,
  paymentDate,
  onPaymentSaved,
}: PaymentStatusCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { mutate } = useGetAllAthletes();

  const status = useMemo<PaymentStatus>(() => {
    if (!paymentDate) {
      return {
        label: "Aún no pagó",
        tone: "negative",
        badgeClass: STATUS_STYLES.negative.badge,
        icon: <XCircle className="size-4 text-danger" />,
        helperText: "Sin pagos registrados",
      };
    }

    const lastPayment = new Date(paymentDate);
    const today = new Date();
    const daysSincePayment = Math.floor(
      (today.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePayment > PAYMENT_WINDOW_DAYS + PAYMENT_GRACE_DAYS) {
      return {
        label: "Pago vencido",
        tone: "negative",
        badgeClass: STATUS_STYLES.negative.badge,
        icon: <AlertCircle className="size-4 text-danger" />,
        helperText: `Vencido hace ${
          daysSincePayment - PAYMENT_WINDOW_DAYS
        } días`,
        highlight: "⚠️ Contactar al atleta a la brevedad",
      };
    }

    if (daysSincePayment > PAYMENT_WINDOW_DAYS) {
      return {
        label: "Pago próximo a vencer",
        tone: "warning",
        badgeClass: STATUS_STYLES.warning.badge,
        icon: <AlertCircle className="size-4 text-warning" />,
        helperText: `Vence en ${
          PAYMENT_WINDOW_DAYS - daysSincePayment
        } días`,
        highlight: "⚠️ Recordar al atleta el pago pendiente",
      };
    }

    return {
      label: "Pago al día",
      tone: "positive",
      badgeClass: STATUS_STYLES.positive.badge,
        icon: <CheckCircle className="size-4 text-success" />,
      helperText: `Último pago: ${lastPayment.toLocaleDateString("es-ES")}`,
    };
  }, [paymentDate]);

  const handleSetPaymentToday = async () => {
    setIsUpdating(true);

    const response = await updatePaymentDate(athleteId, new Date().toISOString());
    if (response.ok) {
      await mutate();
      await onPaymentSaved?.();
    }

    setIsUpdating(false);
  };

  return (
    <section className="space-y-4 rounded-app-2xl border border-border-subtle bg-bg-surface-1 p-5 shadow-elevation-2">
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Calendar className="size-4" /> Estado de pago
        </h3>
        <Badge variant="secondary" className={status.badgeClass}>
          {status.label}
        </Badge>
      </header>

      <div className="space-y-2 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          {status.icon}
          <span
            className={`font-medium ${
              status.tone === "positive"
                ? STATUS_STYLES.positive.text
                : status.tone === "warning"
                ? STATUS_STYLES.warning.text
                : STATUS_STYLES.negative.text
            }`}
          >
            {status.helperText}
          </span>
        </div>

        {status.highlight && (
          <p className="rounded-app-xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger">
            {status.highlight}
          </p>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-app-full"
        disabled={isUpdating}
        onClick={handleSetPaymentToday}
      >
        {isUpdating ? "Actualizando…" : "Marcar como pagado hoy"}
      </Button>
    </section>
  );
};

export default PaymentStatusCard;
