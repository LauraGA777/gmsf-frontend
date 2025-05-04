import React from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { User, CreditCard, Calendar, Clock, DollarSign, FileText } from "lucide-react";

// Función para formatear precio en COP
const formatCOP = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function MyContractPage() {
  const { user } = useAuth();

  if (!user || !user.contract) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Mi Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8">No se encontró información de contrato.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contract = user.contract;
  
  const getContractStatus = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(contract.fecha_fin);
    endDate.setHours(0, 0, 0, 0);

    if (contract.estado === "Cancelado") {
      return { label: "Cancelado", color: "bg-red-100 text-red-800" };
    }

    if (endDate < today) {
      return { label: "Vencido", color: "bg-gray-100 text-gray-800" };
    }

    const daysRemaining = differenceInDays(endDate, today);

    if (daysRemaining <= 7) {
      return { label: `Por vencer (${daysRemaining} días)`, color: "bg-yellow-100 text-yellow-800" };
    }

    return { label: "Activo", color: "bg-green-100 text-green-800" };
  };

  const status = getContractStatus();

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Mi Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Información del Contrato</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
                <div className="flex items-start">
                  <FileText className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Código</p>
                    <p>{contract.codigo}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Membresía</p>
                    <p>{contract.membresia_nombre}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Fecha de Inicio</p>
                    <p>{format(new Date(contract.fecha_inicio), "PPP", { locale: es })}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Fecha de Vencimiento</p>
                    <p>{format(new Date(contract.fecha_fin), "PPP", { locale: es })}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Precio Total</p>
                    <p>{formatCOP(contract.precio_total)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Nombre</p>
                    <p>{contract.cliente_nombre || user.name}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Documento</p>
                    <p>{contract.cliente_documento_tipo} {contract.cliente_documento}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}