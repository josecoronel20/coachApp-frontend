import React from "react";
import { Button } from "../../ui/button";
import { X } from "lucide-react";

const AthleteNotesEdit = ({ notes }: { notes: string }) => {
  return (
    <div>
      <p className="text-sm font-medium">Nota del atleta</p>
      <div className="flex justify-between items-center gap-2 rounded-md p-2 border border-e-gray-800">
        <p className="text-sm">{notes}</p>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 hover:bg-red-400"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AthleteNotesEdit;
