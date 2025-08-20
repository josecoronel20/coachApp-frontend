"use client";
import { Athlete } from "@/types/athleteType";
import { FileText, Edit, Save, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAthleteBasicInfo } from "@/app/api/protected";


interface ErrorResponse {
  status?: number;
  message?: string;
}

const AthleteInfo = ({
  athlete,
  onSave,
  mutate,
}: {
  athlete: Athlete;
  onSave?: (updatedAthlete: Partial<Athlete>) => void;
  mutate: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: athlete.name,
    email: athlete.email || "",
    phone: athlete.phone,
    bodyWeight: athlete.bodyWeight || 0,
    notes: athlete.notes || "",
  });
  const [responseDataError, setResponseDataError] = useState<ErrorResponse | null>(null);
  //number of notes to review
  const numberOfNotesToReview = athlete.routine.reduce(
    (acc, day) =>
      acc +
      day.reduce(
        (acc, exercise) => acc + (exercise.athleteNotes !== null ? 1 : 0),
        0
      ),
    0
  );

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const response = await updateAthleteBasicInfo(athlete.id, formData.name, formData.email, formData.phone, formData.notes);

    const responseData = await response.json();
    if (response.status === 200) {
      setIsEditing(false);
      mutate()
    }else if (response.status === 400 || response.status === 404) {
      setResponseDataError(responseData);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: athlete.name,
      email: athlete.email || "",
      phone: athlete.phone,
      bodyWeight: athlete.bodyWeight || 0,
      notes: athlete.notes || "",
    });
    setIsEditing(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Información Personal</h3>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground flex flex-col gap-2">
            <p>
              <strong>Nombre:</strong> {athlete.name}
            </p>
            <p>
              <strong>Email:</strong> {athlete.email || "No disponible"}
            </p>
            <p>
              <strong>Teléfono:</strong> {athlete.phone}
            </p>
            <p>
              <strong>Peso corporal actual:</strong>{" "}
              {athlete.bodyWeight || "No registrado"} kg
            </p>

            <p
              className={`${
                numberOfNotesToReview > 0 ? "text-red-700" : "text-green-700"
              } `}
            >
              <strong className="text-foreground">Notas del atleta:</strong>
              {numberOfNotesToReview > 0
                ? ` hay ${numberOfNotesToReview} notas por revisar`
                : " no hay notas por revisar"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nombre
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nombre del atleta"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Peso corporal (kg)
              </label>
              <Input
                type="number"
                value={formData.bodyWeight}
                onChange={(e) =>
                  handleInputChange(
                    "bodyWeight",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="75"
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 italic">
                Solo puede ser actualizado por el atleta
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Notas médicas o observaciones relevantes..."
              rows={3}
            />
          </div>

          {responseDataError && (
            <p className="text-red-500">{responseDataError.message}</p>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>Guardar</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </Button>
          </div>
        </div>
      )}

      {/* Notes */}
      {athlete.notes && !isEditing && (
        <div className="space-y-2">
          <h3 className="font-medium text-foreground flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Observaciones del atleta</span>
          </h3>
          <p className="text-sm text-muted-foreground bg-background p-3 rounded-md ">
            {athlete.notes}
          </p>
        </div>
      )}
    </section>
  );
};

export default AthleteInfo;
