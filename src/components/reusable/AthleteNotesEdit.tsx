import React from "react";
import { Button } from "../ui/button";

const AthleteNotesEdit = ({ notes }: { notes: string }) => {
  return (
    <div>
      <p className="text-sm font-medium">Nota del atleta</p>
      <div className="flex flex-col gap-2 border border-red-500 rounded-md p-1">
        <p className="text-sm text-red-500">{notes}</p>
        <Button>Corregido</Button>
      </div>
    </div>
  );
};

export default AthleteNotesEdit;
