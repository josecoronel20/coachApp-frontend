"use client";

import AthleteInfoCard from "./AthleteInfoCard";
import PaymentStatusCard from "./PaymentStatusCard";
import AthleteDietCard from "./AthleteDietCard";
import { DeleteButton } from "@/components/reusable/DeleteButton";
import type { Athlete } from "@/types/athleteType";

interface AthleteSummarySidebarProps {
  athlete: Athlete;
  onDelete: () => Promise<void> | void;
  onDietSaved?: () => void;
}

/**
 * Columna lateral del detalle del atleta con información, pagos y acciones.
 */
const AthleteSummarySidebar = ({
  athlete,
  onDelete,
  onDietSaved,
}: AthleteSummarySidebarProps) => {
  return (
    <aside className="space-y-4">
      <AthleteInfoCard athlete={athlete} />
      <AthleteDietCard
        athleteId={athlete.id}
        initialDiet={athlete.diet ?? ""}
        onDietSaved={onDietSaved}
      />
      <PaymentStatusCard athleteId={athlete.id} paymentDate={athlete.paymentDate} />
      <DeleteButton label="atleta" handleDelete={onDelete} />
    </aside>
  );
};

export default AthleteSummarySidebar;
