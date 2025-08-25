"use client";
import { Athlete } from "@/types/athleteType";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import EditRoutineSection from "@/components/reusable/editRoutineSection/EditRoutineSection";
import PaymentSection from "./athleteDetailsComponents/PaymentSection";
import AthleteInfo from "./athleteDetailsComponents/AthleteInfo";
import { useGetAthleteInfo } from "@/hooks/useGetAthleteInfo";
import SkeletonAthleteDetail from "./athleteDetailsComponents/SkeletonAthleteDetail";
import { deleteAthlete } from "@/app/api/protected";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/reusable/DeleteButton";
import { useGetAllAthletes } from "@/hooks/useGetAllAthletes";

const AthleteDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const { data, isLoading, mutate } = useGetAthleteInfo(id);
  const athlete = data as Athlete;
  const router = useRouter();
  const { mutate: mutateAllAthletes } = useGetAllAthletes();
  // If athlete is not found, show error message
  if (isLoading || !athlete) {
    return <SkeletonAthleteDetail />;
  }

  const handleWhatsAppRoutine = () => {
    // TODO: Implement WhatsApp routine sending
    const message = `Hola ${athlete.name}! Aquí tienes tu rutina actualizada.`;
    const whatsappUrl = `https://wa.me/${
      athlete.phone
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDeleteAthlete = async () => {
    const response = await deleteAthlete(athlete.id);
    if (response.status === 200) {
      mutateAllAthletes();
      router.push("/dashboard");
    }
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
              onClick={handleWhatsAppRoutine}
              className="w-full bg-green-800 hover:bg-green-700 hover:text-white text-white"
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
              <CardContent className="space-y-4">
                                 {/* Athlete Info */}
                 <AthleteInfo 
                   athlete={athlete} 
                   mutate={mutate}
                 />

                {/* Payment Info */}
                <PaymentSection
                  paymentDate={athlete.paymentDate}
                  athleteId={athlete.id}
                  mutate={mutate}
                />

                {/* Delete Athlete */}
                <DeleteButton label="atleta" handleDelete={handleDeleteAthlete} />
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
                  athleteId={athlete.id}
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
