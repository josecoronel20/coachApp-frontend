import { getAthleteById, updateBodyWeight } from "@/app/api/athlete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAthleteStore } from "@/store/useAthleteStore";
import { Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

const BodyWeight = () => {
  const [bodyWeight, setBodyWeight] = useState(0);
  const { athlete, setAthlete } = useAthleteStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setBodyWeight(athlete?.bodyWeight || 0);
  }, []);

  if (!athlete) return null;

  const handleUpdateBodyWeight = async () => {
    const response = await updateBodyWeight(athlete?.id, bodyWeight);
    if (response.status === 200) {
      athlete.bodyWeight = bodyWeight;
      setAthlete(athlete);
      localStorage.setItem("athlete", JSON.stringify(athlete));
      setIsDialogOpen(false);
    } else {
      console.log("Error al actualizar el peso");
      setBodyWeight(athlete?.bodyWeight || 0);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <DialogTitle>
          <Button variant="outline">
            peso actual: {athlete?.bodyWeight} kg
          </Button>
        </DialogTitle>
      </DialogTrigger>
      <DialogContent>
        <div className="flex items-center gap-2 justify-around">
          <Button
            variant="outline"
            onClick={() => setBodyWeight(bodyWeight - 1)}
          >
            <Minus />
          </Button>
          <span>{bodyWeight} kg</span>
          <Button
            variant="outline"
            onClick={() => setBodyWeight(bodyWeight + 1)}
          >
            <Plus />
          </Button>
        </div>
        <Button onClick={handleUpdateBodyWeight}>
          Guardar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BodyWeight;
