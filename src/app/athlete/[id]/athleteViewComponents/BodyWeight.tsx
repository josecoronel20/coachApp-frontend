import { updateBodyWeight } from "@/app/api/athlete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ATHLETE_LEGACY_CACHE_KEY,
  writeOfflineJson,
} from "@/lib/athleteOfflineStorage";
import { useAthleteStore } from "@/store/useAthleteStore";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const BodyWeight = () => {
  const [bodyWeight, setBodyWeight] = useState(0);
  const { athlete, setAthlete } = useAthleteStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setBodyWeight(athlete?.bodyWeight || 0);
  }, [athlete?.bodyWeight]);

  if (!athlete) return null;

  const handleUpdateBodyWeight = async () => {
    if (!athlete?.id) return;
    const response = await updateBodyWeight(athlete.id, bodyWeight);
    if (response.status === 200) {
      const updatedAthlete = { ...athlete, bodyWeight };
      setAthlete(updatedAthlete);
      writeOfflineJson(ATHLETE_LEGACY_CACHE_KEY, updatedAthlete);
      setIsDialogOpen(false);
    } else {
      console.error("Error al actualizar el peso");
      setBodyWeight(athlete?.bodyWeight || 0);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button
        variant="outline"
        className="rounded-app-full flex flex-col border-border-subtle bg-bg-surface-1 text-text-primary hover:bg-bg-surface-2 hover:text-text-primary h-fit gap-0"
        onClick={() => setIsDialogOpen(true)}
      >
         <span className="text-text-secondary">peso actual:</span>
           <span className="text-text-primary text-2xl font-bold">{athlete?.bodyWeight} kg</span>
      </Button>
      <DialogContent className="border-border-subtle bg-bg-surface-2 text-text-primary">
        <DialogTitle className="text-text-primary">Actualizar peso</DialogTitle>
        <div className="flex items-center gap-2 justify-around">
          <Button
            variant="outline"
            onClick={() => setBodyWeight(bodyWeight - 1)}
            className="size-12 rounded-app-full border-border-strong bg-bg-surface-1 p-0 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary"
          >
            <Minus className="size-4" />
          </Button>
          <span className="min-w-[5rem] text-center text-xl font-bold tabular-nums text-text-primary">
            {bodyWeight} kg
          </span>
          <Button
            variant="outline"
            onClick={() => setBodyWeight(bodyWeight + 1)}
            className="size-12 rounded-app-full border-border-strong bg-bg-surface-1 p-0 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <Button
          onClick={handleUpdateBodyWeight}
          className="rounded-app-full bg-purple-primary text-white shadow-purple-glow hover:bg-purple-bright"
        >
          Guardar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BodyWeight;
