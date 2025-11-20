/**
 * Utilidades para verificar el estado de pago de un atleta
 */

const PAYMENT_WINDOW_DAYS = 30;
const PAYMENT_GRACE_DAYS = 7;

export interface PaymentStatus {
  isUpToDate: boolean;
  daysSincePayment: number;
  isOverdue: boolean;
  message: string;
}

/**
 * Verifica si el atleta está al día con el pago
 * @param paymentDate - Fecha del último pago (string ISO o vacío)
 * @returns Objeto con el estado del pago
 */
export const checkPaymentStatus = (paymentDate: string): PaymentStatus => {
  // Si no hay fecha de pago, está vencido
  if (!paymentDate || paymentDate === "") {
    return {
      isUpToDate: false,
      daysSincePayment: Infinity,
      isOverdue: true,
      message: "No se ha registrado ningún pago",
    };
  }

  const lastPayment = new Date(paymentDate);
  const today = new Date();
  const daysSincePayment = Math.floor(
    (today.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Si pasaron más de 30 días + 7 días de gracia (37 días total), está vencido
  const maxAllowedDays = PAYMENT_WINDOW_DAYS + PAYMENT_GRACE_DAYS;
  const isOverdue = daysSincePayment > maxAllowedDays;

  return {
    isUpToDate: !isOverdue,
    daysSincePayment,
    isOverdue,
    message: isOverdue
      ? `El pago venció hace ${daysSincePayment - PAYMENT_WINDOW_DAYS} días`
      : `Último pago: ${lastPayment.toLocaleDateString("es-ES")}`,
  };
};

