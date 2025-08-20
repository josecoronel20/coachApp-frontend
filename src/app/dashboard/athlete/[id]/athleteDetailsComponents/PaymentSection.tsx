"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updatePaymentDate } from "@/app/api/protected";
import { KeyedMutator } from "swr";
import { Athlete } from "@/types/athleteType";

interface PaymentSectionProps {
  paymentDate: string;
  athleteId: string;
  mutate: KeyedMutator<Athlete>;
}

const PaymentSection = ({
  paymentDate,
  athleteId,
  mutate,
}: PaymentSectionProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if payment date is not set
  const hasNotPaid = !paymentDate || paymentDate === "";

  // Calculate payment status only if payment date exists
  const getPaymentStatus = () => {
    if (hasNotPaid) {
      return {
        status: "not-paid",
        text: "Aún no pagó",
        color: "text-red-600",
        badge: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4 text-red-600" />,
      };
    }

    const lastPaymentDate = new Date(paymentDate);
    const today = new Date();
    const daysSincePayment = Math.floor(
      (today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const PAYMENT_DUE_DAYS = 30;
    const isPaymentDue = daysSincePayment > PAYMENT_DUE_DAYS;
    const isPaymentOverdue = daysSincePayment > PAYMENT_DUE_DAYS + 7;

    if (isPaymentOverdue) {
      return {
        status: "overdue",
        text: "Pago vencido",
        color: "text-red-600",
        badge: "bg-red-100 text-red-800",
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        days: daysSincePayment - PAYMENT_DUE_DAYS,
      };
    }

    if (isPaymentDue) {
      return {
        status: "due",
        text: "Pago próximo a vencer",
        color: "text-yellow-600",
        badge: "bg-yellow-100 text-yellow-800",
        icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
        days: daysSincePayment - PAYMENT_DUE_DAYS,
      };
    }

    return {
      status: "paid",
      text: "Pago al día",
      color: "text-green-600",
      badge: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      days: daysSincePayment,
    };
  };

  const paymentStatus = getPaymentStatus();

  const handlePaymentUpdate = async () => {
    setIsUpdating(true);

    const currentDate = new Date().toISOString();

    const response = await updatePaymentDate(athleteId, currentDate);

    if (response.ok) {
      mutate();
    }

    setIsUpdating(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Estado de Pago</span>
        </h3>
        <Badge variant="secondary" className={paymentStatus.badge}>
          {paymentStatus.text}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          {paymentStatus.icon}
          <p className={`text-sm font-medium ${paymentStatus.color}`}>
            {hasNotPaid
              ? "Sin pagos registrados"
              : `Último pago: ${new Date(paymentDate).toLocaleDateString(
                  "es-ES"
                )}`}
          </p>
        </div>

        {!hasNotPaid && (
          <p className="text-xs text-gray-500">
            {paymentStatus.status === "paid"
              ? `Días desde el último pago: ${paymentStatus.days}`
              : `Vencido hace ${paymentStatus.days} días`}
          </p>
        )}

        {(paymentStatus.status === "overdue" ||
          paymentStatus.status === "due") && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">
              {paymentStatus.status === "overdue"
                ? "⚠️ Pago vencido. Contactar al atleta."
                : "⚠️ Pago próximo a vencer. Recordar al atleta."}
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={handlePaymentUpdate}
        disabled={isUpdating}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isUpdating ? "Actualizando..." : "Marcar como pagado hoy"}
      </Button>
    </div>
  );
};

export default PaymentSection;
