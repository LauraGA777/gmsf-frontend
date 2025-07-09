"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { Mail, Phone, MapPin, Calendar, Shield, Activity, Dumbbell, User, Award } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { TrainerDisplayData } from "@/shared/types/trainer"
import { Button } from "@/shared/components/ui/button"

interface TrainerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  trainer: TrainerDisplayData | null
  onEdit: (trainer: TrainerDisplayData) => void
  onDelete: (trainer: TrainerDisplayData) => void
}

export function TrainerDetailModal({ isOpen, onClose, trainer, onEdit, onDelete }: TrainerDetailModalProps) {
  if (!trainer) return null

  const formatDate = (date: Date | string) => {
    if (!date) return "No especificada"
    return format(new Date(date), "dd/MM/yyyy", { locale: es })
  }

  // Mock history for the trainer
  const mockHistory = [
    { id: "1", action: "Entrenador registrado", user: "Admin", date: "15/01/2023" },
    { id: "2", action: "Especialidad actualizada", user: "Admin", date: "10/02/2023" },
    { id: "3", action: "Servicios actualizados", user: "Admin", date: "05/03/2023" },
    { id: "4", action: "Estado cambiado a activo", user: "Admin", date: "12/04/2023" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Detalles del Entrenador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with trainer info */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">
                {trainer.name} {trainer.lastName}
              </h2>
              <p className="text-sm text-gray-500">Especialidad: {trainer.specialty}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  className={
                    trainer.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {trainer.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Número de Documento</p>
                  <p className="text-sm text-gray-500 font-medium">{trainer.documentNumber || "No especificado"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tipo de Documento</p>
                  <p className="text-sm text-gray-500">{trainer.documentType || "No especificado"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Nacimiento</p>
                  <p className="text-sm text-gray-500">
                    {trainer.birthDate ? formatDate(trainer.birthDate) : "No especificada"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Género</p>
                  <p className="text-sm text-gray-500">
                    {trainer.gender === "M" ? "Masculino" : trainer.gender === "F" ? "Femenino" : "No especificado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                  <p className="text-sm text-gray-500">{trainer.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Teléfono</p>
                  <p className="text-sm text-gray-500">{trainer.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dirección</p>
                  <p className="text-sm text-gray-500">{trainer.address || "No especificada"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Especialidad</p>
                  <p className="text-sm text-gray-500">{trainer.specialty}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Registro</p>
                  <p className="text-sm text-gray-500">{formatDate(trainer.hireDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial</h3>
            <div className="space-y-3">
              {mockHistory.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <Activity className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.action}</p>
                    <p className="text-xs text-gray-500">
                      Por {item.user} el {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button onClick={() => trainer && onDelete(trainer)} variant="destructive">
              Eliminar
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button onClick={() => trainer && onEdit(trainer)} className="bg-black hover:bg-gray-800">
                Editar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
