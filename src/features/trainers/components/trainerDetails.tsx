import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import type { Trainer } from "@/shared/types/trainer";
import { User, Mail, Phone, MapPin, Calendar, FileText, Briefcase, Activity } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";

interface TrainerDetailsProps {
  trainer: Trainer;
  isOpen: boolean;
  onClose: () => void;
}

export function TrainerDetails({ trainer, isOpen, onClose }: TrainerDetailsProps) {
  if (!trainer) {
    return null;
  }

  const getStatusBadge = (estado: boolean) => {
    return estado
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : "bg-red-100 text-red-800 hover:bg-red-100";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {trainer.usuario?.nombre} {trainer.usuario?.apellido}
              </DialogTitle>
              <DialogDescription>Código: {trainer.codigo}</DialogDescription>
            </div>
            <Badge className={getStatusBadge(trainer.estado)}>{trainer.estado ? "Activo" : "Inactivo"}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                Información Profesional
            </h3>
            <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                    <p className="text-sm font-medium text-gray-900">Especialidad</p>
                    <p className="text-sm text-gray-500">{trainer.especialidad}</p>
                </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Documento</p>
                  <p className="text-sm text-gray-500">
                    {trainer.usuario?.tipo_documento} - {trainer.usuario?.numero_documento}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Nacimiento</p>
                  <p className="text-sm text-gray-500">
                    {trainer.usuario?.fecha_nacimiento
                      ? format(new Date(trainer.usuario.fecha_nacimiento), "dd/MM/yyyy", { locale: es })
                      : "No especificada"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                  <p className="text-sm text-gray-500">{trainer.usuario?.correo}</p>
                </div>
              </div>
              {trainer.usuario?.telefono && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Teléfono</p>
                    <p className="text-sm text-gray-500">{trainer.usuario.telefono}</p>
                  </div>
                </div>
              )}
              {trainer.usuario?.direccion && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dirección</p>
                    <p className="text-sm text-gray-500">{trainer.usuario.direccion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
           <Separator />

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Fecha de Registro</p>
                            <p className="text-sm text-gray-500">
                                {trainer.fecha_registro
                                ? format(new Date(trainer.fecha_registro), "dd/MM/yyyy HH:mm", { locale: es })
                                : "No especificada"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <div>
                        <p className="text-sm font-medium text-gray-900">Última Actualización</p>
                        <p className="text-sm text-gray-500">
                            {trainer.updatedAt
                            ? format(new Date(trainer.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })
                            : "No especificada"}
                        </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
} 