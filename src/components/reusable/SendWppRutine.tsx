import { Athlete } from "@/types/athleteType";
import { MessageCircle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

const SendWppRutine = ({athlete}: {athlete: Athlete}) => {
const urlVercel = "https://gymbrocoach.vercel.app/"

  const handleWhatsAppRoutine = () => {
    // TODO: Implement WhatsApp routine sending
    const message = `Hola ${athlete.name}! Acá tenés tu rutina actualizada. ${urlVercel}/athlete/${athlete.id}`;
    
    const whatsappUrl = `https://wa.me/${
      athlete.phone
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };
  return (
    <Button
      onClick={handleWhatsAppRoutine}
      className="w-full bg-green-800 hover:bg-green-700 hover:text-white text-white"
    >
      <MessageCircle className="h-4 w-4" />
      Enviar rutina
    </Button>
  );
};

export default SendWppRutine;
