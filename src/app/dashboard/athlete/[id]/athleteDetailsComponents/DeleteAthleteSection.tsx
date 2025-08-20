"use client";
import { deleteAthlete } from "@/app/api/protected";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ErrorResponse {
  status?: number;
  message?: string;
}

export const DeleteAthleteSection = ({
  athleteId,
}: {  
  athleteId: string;
}) => {
  const [responseDataError, setResponseDataError] = useState<ErrorResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAthlete = async () => {
    setIsDeleting(true);
    const response = await deleteAthlete(athleteId);
    const responseData = await response.json();
    setResponseDataError(responseData);
    
    if (response.status === 200) {
      setIsDeleteDialogOpen(false);
      setIsSuccessDialogOpen(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            <span>Eliminar atleta</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este atleta? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAthlete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Eliminado correctamente!</DialogTitle>
            <DialogDescription>
              El atleta se eliminó correctamente. Serás redirigido al dashboard en unos segundos.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};