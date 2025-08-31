import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface SetCardProps {
  value: number;
  onInc: () => void;
  onDec: () => void;
  min: number;
  max: number;
  label: string;
}

/**
 * Componente presentacional para mostrar y editar un set de ejercicios
 * No contiene lógica de store, solo llama a los handlers proporcionados
 */
const SetCard = ({ value, onInc, onDec, min, max, label }: SetCardProps) => {
  const isAtMax = value >= max;
  const isAtMin = value <= min;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-colors
                  ${isAtMax && "border-green-300"}`}>
      <span className="font-medium text-sm">{label}</span>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onDec}
          disabled={isAtMin}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="font-semibold text-lg min-w-[2rem] text-center">
          {value}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onInc}
          disabled={isAtMax}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SetCard;
