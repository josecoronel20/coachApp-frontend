import type { AthleteLite } from "@/types/athleteType";
import { MessageCircle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

const SendWppRutine = ({ athlete }: { athlete: AthleteLite }) => {
const urlVercel = "https://impruv-app-frontend.vercel.app/"

  const handleWhatsAppRoutine = () => {
    // TODO: Implement WhatsApp routine sending
    const message = `Hola ${athlete.name}! Acá tenés tu rutina actualizada. ${urlVercel}athlete/${athlete.id}`;
    
    const whatsappUrl = `https://wa.me/${
      athlete.phone
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };
  return (
    <Button
      onClick={handleWhatsAppRoutine}
      variant="outline"
      className="h-10 w-full rounded-app-full border-success/25 bg-success/10 text-success hover:bg-success/15 hover:text-text-primary"
    >
      <MessageCircle className="size-4" />
      Enviar rutina
    </Button>
  );
};

export default SendWppRutine;
