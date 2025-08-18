import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentSectionProps {
  paymentDate: string;
  athleteId: string;
  onPaymentUpdate?: (newDate: string) => void;
}

const PaymentSection = ({ paymentDate, onPaymentUpdate }: PaymentSectionProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate payment status
  const lastPaymentDate = new Date(paymentDate);
  const today = new Date();
  const daysSincePayment = Math.floor((today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Consider payment due after 30 days (you can adjust this)
  const PAYMENT_DUE_DAYS = 30;
  const isPaymentDue = daysSincePayment > PAYMENT_DUE_DAYS;
  const isPaymentOverdue = daysSincePayment > PAYMENT_DUE_DAYS + 7; // Overdue after 37 days

  const handlePaymentUpdate = () => {
    setIsUpdating(true);
    
    // Simulate API call - replace with actual API call
    setTimeout(() => {
      const newDate = new Date().toISOString();
      onPaymentUpdate?.(newDate);
      setIsUpdating(false);
    }, 1000);
  };

  const getPaymentStatusColor = () => {
    if (isPaymentOverdue) return "text-red-600";
    if (isPaymentDue) return "text-yellow-600";
    return "text-green-600";
  };

  const getPaymentStatusIcon = () => {
    if (isPaymentOverdue) return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (isPaymentDue) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getPaymentStatusText = () => {
    if (isPaymentOverdue) return "Pago vencido";
    if (isPaymentDue) return "Pago próximo a vencer";
    return "Pago al día";
  };

  const getPaymentStatusBadge = () => {
    if (isPaymentOverdue) return "bg-red-100 text-red-800";
    if (isPaymentDue) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className=" p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Estado de Pago</span>
        </h3>
        <Badge variant="secondary" className={getPaymentStatusBadge()}>
          {getPaymentStatusText()}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {getPaymentStatusIcon()}
          <p className={`text-sm font-medium ${getPaymentStatusColor()}`}>
            Último pago: {lastPaymentDate.toLocaleDateString("es-ES")}
          </p>
        </div>
        
        <p className="text-xs text-gray-500">
          {isPaymentDue 
            ? `Vencido hace ${daysSincePayment - PAYMENT_DUE_DAYS} días`
            : `Días desde el último pago: ${daysSincePayment}`
          }
        </p>

        {isPaymentDue && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">
              {isPaymentOverdue 
                ? "⚠️ Pago vencido. Contactar al atleta."
                : "⚠️ Pago próximo a vencer. Recordar al atleta."
              }
            </p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t">
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
    </div>
  );
};

export default PaymentSection;
