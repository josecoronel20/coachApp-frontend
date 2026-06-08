"use client";

import AthleteInfoCard from "./AthleteInfoCard";
import PaymentStatusCard from "./PaymentStatusCard";
import { DeleteButton } from "@/components/reusable/DeleteButton";
import type { Athlete } from "@/types/athleteType";

interface AthleteSummarySidebarProps {
  athlete: Athlete;
  onDelete: () => Promise<void> | void;
  onPaymentSaved?: () => Promise<void> | void;
  onAthleteUpdated?: () => Promise<void> | void;
}

/**
 * Columna lateral del detalle del atleta con información, pagos y acciones.
 */
const AthleteSummarySidebar = ({
  athlete,
  onDelete,
  onPaymentSaved,
  onAthleteUpdated,
}: AthleteSummarySidebarProps) => {
  return (
    <aside className="space-y-4">
      <AthleteInfoCard athlete={athlete} onRepsTrackedSaved={onAthleteUpdated} />
      <PaymentStatusCard
        athleteId={athlete.id}
        paymentDate={athlete.paymentDate}
        onPaymentSaved={onPaymentSaved}
      />
      <DeleteButton label="atleta" handleDelete={onDelete} />
    </aside>
  );
};

export default AthleteSummarySidebar;
