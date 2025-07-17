import { useState, useEffect } from "react";
import { useAuth } from "@/shared/contexts/authContext";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { contractService } from "@/features/contracts/services/contract.service";
import { ContractDetails } from "@/features/contracts/components/contractDetails";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { 
  User, CreditCard, Calendar, Clock, DollarSign, 
  FileText, Eye, AlertTriangle, CheckCircle, Ban, 
  Snowflake, RefreshCw, Loader2 
} from "lucide-react";
import type { Contract } from "@/shared/types";
import { formatCOP } from "@/shared/lib/utils";

// Componente para el estado de carga
const LoadingState = () => (
  <div className="container mx-auto px-4 py-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-10 w-32 ml-auto" />
      </CardContent>
    </Card>
  </div>
);

// Componente para el estado sin contrato
const NoContractState = () => (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg text-center shadow-lg">
          <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-200 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FileText className="h-12 w-12 text-blue-700" />
              </div>
              <CardTitle className="text-2xl font-extrabold">No tienes un contrato activo</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-gray-600 mb-6 leading-relaxed">
                  Para ver tus detalles, un administrador debe asignarte y activar un contrato.
              </p>
              <div className="bg-blue-50 border-t border-b border-blue-200 px-6 py-4">
                  <p className="text-blue-800 font-medium flex items-center justify-center gap-3">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Contacta a la administración para más detalles.</span>
                  </p>
              </div>
          </CardContent>
      </Card>
    </div>
);


export function MyContractPage() {
  const { user } = useAuth();
  const { hasModuleAccess, isLoading: permissionsLoading } = usePermissions();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchMyContracts = async (personId: string) => {
    try {
      const response = await contractService.getContracts({
        id_persona: parseInt(personId, 10),
        limit: 10
      });
      setContracts(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo cargar tu contrato.");
      setContracts([]); // Asegurar que no haya datos en caso de error
    }
  };

  useEffect(() => {
    // Solo proceder cuando los permisos y el usuario estén listos
    if (!permissionsLoading && user?.personId) {
      if (hasModuleAccess("CONTRATOS")) {
        fetchMyContracts(user.personId).finally(() => setPageLoading(false));
      } else {
        setError("No tienes permisos para ver esta página.");
        setPageLoading(false);
      }
    } else if (!permissionsLoading && !user?.personId) {
        // Si el usuario no tiene personId, no podemos buscar
        setError("Información de usuario incompleta.");
        setPageLoading(false);
    }
  }, [user, permissionsLoading, hasModuleAccess]);

  const getContractStatusInfo = (contract: Contract) => {
    const statusConfig: Record<Contract['estado'], { label: string; color: string; icon: React.ReactElement }> = {
      Cancelado: { 
        label: "Cancelado", 
        color: "bg-red-100 text-red-800",
        icon: <Ban className="h-4 w-4" />
      },
      Congelado: { 
        label: "Congelado", 
        color: "bg-blue-100 text-blue-800",
        icon: <Snowflake className="h-4 w-4" />
      },
      Vencido: { 
        label: "Vencido", 
        color: "bg-gray-100 text-gray-800",
        icon: <AlertTriangle className="h-4 w-4" />
      },
      'Por vencer': { 
        label: "Por vencer", 
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-4 w-4" />
      },
      Activo: { 
        label: "Activo", 
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4" />
      }
    };
    return statusConfig[contract.estado] || statusConfig.Activo;
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  if (pageLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    // Muestra un error genérico si falla
    return <NoContractState />;
  }

  if (contracts.length === 0) {
    return <NoContractState />;
  }
  
  const activeContract = contracts.find(c => c.estado === "Activo") || contracts[0];
  const otherContracts = contracts.filter(c => c.id !== activeContract.id);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Contrato</h1>
          <p className="text-gray-600">Información de tu membresía actual</p>
        </div>
        <Button onClick={() => fetchMyContracts(user?.personId || '')} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Contrato Principal */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {activeContract.membresia?.nombre || "Membresía"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`flex items-center gap-1 ${getContractStatusInfo(activeContract).color}`}>
                {getContractStatusInfo(activeContract).icon}
                {getContractStatusInfo(activeContract).label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Código del Contrato */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Código</p>
                <p className="text-sm text-gray-600 font-mono">{activeContract.codigo}</p>
              </div>
            </div>

            {/* Fecha de Inicio */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fecha de Inicio</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(activeContract.fecha_inicio), "dd 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
            </div>

            {/* Fecha de Vencimiento */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fecha de Vencimiento</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(activeContract.fecha_fin), "dd 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
            </div>

            {/* Precio */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Precio Pagado</p>
                <p className="text-sm text-gray-600 font-semibold">
                  {formatCOP(activeContract.membresia_precio)}
                </p>
              </div>
            </div>
          </div>

          {/* Información adicional de la membresía */}
          {activeContract.membresia && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Detalles de la Membresía</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Días de acceso:</span>
                  <span className="ml-2 font-medium">{activeContract.membresia.dias_acceso} días</span>
                </div>
                <div>
                  <span className="text-gray-500">Vigencia:</span>
                  <span className="ml-2 font-medium">{activeContract.membresia.vigencia_dias} días</span>
                </div>
                <div>
                  <span className="text-gray-500">Días restantes:</span>
                  <span className="ml-2 font-medium">
                    {Math.max(0, differenceInDays(new Date(activeContract.fecha_fin), new Date()))} días
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botón para ver detalles */}
          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleViewDetails(activeContract)} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles Completos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información del Cliente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Información
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Nombre Completo</p>
                <p className="text-sm text-gray-600">
                  {activeContract.persona?.usuario?.nombre} {activeContract.persona?.usuario?.apellido}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Documento</p>
                <p className="text-sm text-gray-600">
                  {activeContract.persona?.usuario?.tipo_documento} {activeContract.persona?.usuario?.numero_documento}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Otros contratos (si los hay) */}
      {otherContracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historial de Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherContracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getContractStatusInfo(contract).color}`}>
                      {getContractStatusInfo(contract).label}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{contract.membresia?.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(contract.fecha_inicio), "dd/MM/yyyy")} - {format(new Date(contract.fecha_fin), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleViewDetails(contract)} variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles */}
      {selectedContract && (
        <ContractDetails
          contract={selectedContract}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedContract(null);
          }}
        />
      )}
    </div>
  );
}