"use client";
import { useCoachStore } from "@/store/coachStore";
import { Athlete } from "@/types/athlete";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  User,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import EditRoutineSection from "@/components/reusable/EditRoutineSection";
import PaymentSection from "./athleteDetailsComponents/PaymentSection";
import AthleteInfo from "./athleteDetailsComponents/AthleteInfo";

const AthleteDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const { athletesInfo } = useCoachStore();

  const athlete = athletesInfo?.find((athlete: Athlete) => athlete.id === id);

  // If athlete is not found, show error message
  if (!athlete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600">
            Atleta no encontrado
          </h2>
          <p className="text-gray-500 mt-2">
            El atleta que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    );
  }

  const handleWhatsAppRoutine = () => {
    // TODO: Implement WhatsApp routine sending
    const message = `Hola ${athlete.name}! Aquí tienes tu rutina actualizada.`;
    const whatsappUrl = `https://wa.me/${
      athlete.phone
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm p-2">
        <div className="">
          <div className="flex flex-col justify-between items-center w-full gap-2">
            <div className="flex gap-4 items-center space-x-4 w-full justify-between">
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-foreground">
                {athlete.name}
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={handleWhatsAppRoutine}
              className="w-full bg-green-400 hover:bg-green-500 hover:text-white text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar rutina por WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Athlete Quick Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Información del atleta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                                 {/* Athlete Info */}
                 <AthleteInfo 
                   athlete={athlete} 
                   onSave={(updatedData) => {
                     // TODO: Implement actual athlete update logic
                     console.log('Athlete updated:', updatedData);
                   }}
                 />

                {/* Payment Info */}
                <PaymentSection
                  paymentDate={athlete.paymentDate}
                  athleteId={athlete.id}
                  onPaymentUpdate={(newDate) => {
                    // TODO: Implement actual payment update logic
                    console.log(
                      "Payment updated for athlete:",
                      athlete.id,
                      "New date:",
                      newDate
                    );
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Routine Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Rutina de Entrenamiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EditRoutineSection
                  routine={athlete.routine}
                  isNewRoutine={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AthleteDetailsPage;
