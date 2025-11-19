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
  positive: { badge: "bg-primary/10 text-green-600", text: "text-green-600" },
  warning: { badge: "bg-secondary/10 text-secondary-foreground", text: "text-secondary-foreground" },
  negative: { badge: "bg-destructive/10 text-destructive", text: "text-destructive" },
} as const;

/**
 * Muestra el estado de pago del atleta y permite marcar un pago nuevo.
 */
const PaymentStatusCard = ({ athleteId, paymentDate }: PaymentStatusCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { mutate } = useGetAllAthletes();

  const status = useMemo<PaymentStatus>(() => {
    if (!paymentDate) {
      return {
        label: "Aún no pagó",
        tone: "negative",
        badgeClass: STATUS_STYLES.negative.badge,
        icon: <XCircle className="h-4 w-4 text-destructive" />,
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
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
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
        icon: <AlertCircle className="h-4 w-4 text-secondary-foreground" />,
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
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      helperText: `Último pago: ${lastPayment.toLocaleDateString("es-ES")}`,
    };
  }, [paymentDate]);

  const handleSetPaymentToday = async () => {
    setIsUpdating(true);

    const response = await updatePaymentDate(athleteId, new Date().toISOString());
    if (response.ok) {
      mutate();
    }

    setIsUpdating(false);
  };

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar className="h-4 w-4" /> Estado de pago
        </h3>
        <Badge variant="secondary" className={status.badgeClass}>
          {status.label}
        </Badge>
      </header>

      <div className="space-y-2 text-sm text-muted-foreground">
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
          <p className="rounded-md border border-border bg-muted p-2 text-xs text-destructive">
            {status.highlight}
          </p>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={isUpdating}
        onClick={handleSetPaymentToday}
      >
        {isUpdating ? "Actualizando…" : "Marcar como pagado hoy"}
      </Button>
    </section>
  );
};

export default PaymentStatusCard;
