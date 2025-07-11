import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreHorizontal, CheckCircle, AlertTriangle, Power, RotateCcw, User } from "lucide-react";
import { format } from "date-fns";
import type { Trainer } from "@/shared/types/trainer";
import { TableSkeleton } from "@/shared/components/ui/table-skeleton";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { cn } from "@/shared/lib/utils";

interface TrainersTableProps {
  trainers: Trainer[];
  isLoading: boolean;
  onViewDetails: (trainer: Trainer) => void;
  onEdit: (trainer: Trainer) => void;
  onToggleStatus: (trainer: Trainer) => void;
  onDelete: (id: number) => void;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  permissions: {
    canUpdateTrainers: boolean;
    canDeleteTrainers: boolean;
    canChangeStatus: boolean;
  };
  onAddNewTrainer?: () => void;
}

export function TrainersTable({
  trainers,
  isLoading,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onDelete,
  pagination,
  onPageChange,
  permissions,
  onAddNewTrainer
}: TrainersTableProps) {
  
  const hasActions = permissions.canUpdateTrainers || permissions.canDeleteTrainers || permissions.canChangeStatus;

  if (isLoading) {
    return <TableSkeleton columns={6} rows={pagination.limit} />;
  }

  if (trainers.length === 0) {
    return (
      <EmptyState
        Icon={User}
        title="No se encontraron entrenadores"
        description="Parece que no hay entrenadores que coincidan con tu búsqueda."
        actionText={onAddNewTrainer ? "Crear Nuevo Entrenador" : undefined}
        onAction={onAddNewTrainer}
      />
    );
  }

  const getStatusBadge = (estado: boolean) => {
    return estado
      ? {
          label: "Activo",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
        }
      : {
          label: "Inactivo",
          color: "bg-red-100 text-red-800",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
        };
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estado</TableHead>
              {hasActions && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((trainer) => {
              const status = getStatusBadge(trainer.estado);
              return (
                <TableRow key={trainer.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{trainer.codigo}</TableCell>
                  <TableCell>{trainer.usuario?.nombre} {trainer.usuario?.apellido}</TableCell>
                  <TableCell>
                    {trainer.usuario?.tipo_documento} - {trainer.usuario?.numero_documento}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{trainer.usuario?.correo}</div>
                    <div className="text-xs text-gray-500">{trainer.usuario?.telefono || 'N/A'}</div>
                  </TableCell>
                  <TableCell>{trainer.especialidad}</TableCell>
                  <TableCell>
                    <Badge className={cn("flex items-center w-fit", status.color)}>
                        {status.icon}
                        <span>{status.label}</span>
                    </Badge>
                  </TableCell>
                  {hasActions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewDetails(trainer)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver detalles
                          </DropdownMenuItem>
                          {permissions.canUpdateTrainers && (
                            <DropdownMenuItem onClick={() => onEdit(trainer)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          )}
                          {permissions.canChangeStatus && (
                            <DropdownMenuItem onClick={() => onToggleStatus(trainer)}>
                                {trainer.estado ? <Power className="mr-2 h-4 w-4" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                                {trainer.estado ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                          )}
                          {permissions.canDeleteTrainers && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onDelete(trainer.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {pagination.page} de {pagination.totalPages}. Total: {pagination.total} entrenadores.
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
    </>
  );
} 