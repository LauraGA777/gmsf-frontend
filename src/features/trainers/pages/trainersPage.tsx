import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Plus, 
  Search, 
  Users, 
  MoreHorizontal,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  Power,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/shared/components/ui/use-toast";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { PERMISSIONS, PRIVILEGES } from "@/shared/services/permissionService";
import { trainerService } from "../services/trainer.service";
import type { Trainer } from "@/shared/types/trainer";
import { NewTrainerForm, CreateTrainerFormValues } from "../components/newTrainerForm";
import { EditTrainerModal, UpdateTrainerFormValues } from "../components/editTrainerModal";
import { TrainerDetails } from "../components/trainerDetails";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export function TrainersPage() {
  const { toast } = useToast();
  const { hasPrivilege } = usePermissions();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [isNewTrainerModalOpen, setIsNewTrainerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Permisos
  const canViewTrainers = hasPrivilege(PERMISSIONS.ENTRENADORES, PRIVILEGES.TRAINER_READ);
  const canCreateTrainers = hasPrivilege(PERMISSIONS.ENTRENADORES, PRIVILEGES.TRAINER_CREATE);
  const canUpdateTrainers = hasPrivilege(PERMISSIONS.ENTRENADORES, PRIVILEGES.TRAINER_UPDATE);
  const canDeleteTrainers = hasPrivilege(PERMISSIONS.ENTRENADORES, PRIVILEGES.TRAINER_DELETE);
  const canChangeStatus = hasPrivilege(PERMISSIONS.ENTRENADORES, PRIVILEGES.TRAINER_ACTIVATE) || hasPrivilege(PERMISSIONS.ENTRENADORES, PRIVILEGES.TRAINER_DEACTIVATE);

  const fetchTrainers = useCallback(async (page = 1, limit = 10) => {
    if (!canViewTrainers) return;
    setIsLoading(true);
    try {
      const params: any = {
        pagina: page,
        limite: limit,
        orden: 'codigo',
        direccion: 'ASC',
      };
      if (searchTerm) params.q = searchTerm;
      if (statusFilter !== "all") params.estado = statusFilter === 'Activo';
      
      const response = await trainerService.getTrainers(params);
      setTrainers(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron cargar los entrenadores.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [canViewTrainers, searchTerm, statusFilter, toast]);

  useEffect(() => {
    fetchTrainers(pagination.page, pagination.limit);
  }, [fetchTrainers, pagination.page, pagination.limit]);

  const getStatusBadge = (estado: boolean) => {
    return estado ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
    );
  };

  const handleCreateTrainer = async (data: CreateTrainerFormValues) => {
    try {
      await trainerService.createTrainer(data);
      toast({ title: "¡Éxito!", description: "Entrenador creado correctamente." });
      fetchTrainers(pagination.page, pagination.limit);
      setIsNewTrainerModalOpen(false);
    } catch (error: any) {
      console.error("Error al crear entrenador:", error);
      toast({ title: "Error", description: error.response?.data?.message || "No se pudo crear el entrenador.", variant: "destructive" });
      throw error;
    }
  };

  const handleUpdateTrainer = async (id: number, data: UpdateTrainerFormValues) => {
    try {
      await trainerService.updateTrainer(id, JSON.parse(JSON.stringify(data)));
      toast({ title: "¡Éxito!", description: "Entrenador actualizado correctamente." });
      fetchTrainers(pagination.page, pagination.limit);
      setIsEditModalOpen(false);
      setSelectedTrainer(null);
    } catch (error: any) {
      console.error("Error al actualizar entrenador:", error);
      toast({ title: "Error", description: error.response?.data?.message || "No se pudo actualizar el entrenador.", variant: "destructive" });
      throw error;
    }
  };

  const handleToggleStatus = async (trainer: Trainer) => {
    const actionText = trainer.estado ? "desactivar" : "activar";
    const result = await Swal.fire({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} entrenador?`,
      text: `¿Estás seguro de que deseas ${actionText} a ${trainer.usuario?.nombre} ${trainer.usuario?.apellido}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        if (trainer.estado) {
          await trainerService.deactivateTrainer(trainer.id);
        } else {
          await trainerService.activateTrainer(trainer.id);
        }
        toast({ 
          title: "¡Éxito!", 
          description: `Entrenador ${actionText}do correctamente.` 
        });
        fetchTrainers(pagination.page, pagination.limit);
      } catch (error: any) {
        toast({ 
          title: "Error", 
          description: error.response?.data?.message || `No se pudo ${actionText} el entrenador.`, 
          variant: "destructive" 
        });
      }
    }
  };

  const handleDeleteTrainer = async (trainer: Trainer) => {
    const result = await Swal.fire({
      title: "¿Eliminar entrenador?",
      text: `¿Está seguro que desea eliminar a ${trainer.usuario?.nombre} ${trainer.usuario?.apellido}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await trainerService.deleteTrainer(trainer.id);
        toast({ 
          title: '¡Éxito!', 
          description: 'Entrenador eliminado correctamente.' 
        });
        fetchTrainers(pagination.page, pagination.limit);
      } catch (error: any) {
        toast({ 
          title: 'Error', 
          description: error.response?.data?.message || 'No se pudo eliminar el entrenador.', 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleViewDetails = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsDetailsModalOpen(true);
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsEditModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTrainers(1, pagination.limit);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Trigger search when Enter is pressed
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Entrenadores</h1>
          <p className="text-gray-600">Gestión de entrenadores del gimnasio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchTrainers(pagination.page, pagination.limit)} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {canCreateTrainers && (
            <Button onClick={() => setIsNewTrainerModalOpen(true)} className="bg-black hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Entrenador
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, documento, especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Activo">Activos</SelectItem>
                  <SelectItem value="Inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} variant="outline" disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Entrenadores ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Estado</TableHead>
                  {(canUpdateTrainers || canDeleteTrainers || canChangeStatus) && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron entrenadores</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  trainers.map((trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.codigo}</TableCell>
                      <TableCell>
                        <div className="font-medium">{trainer.usuario?.nombre} {trainer.usuario?.apellido}</div>
                        <div className="text-xs text-gray-500">Entrenador</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {trainer.usuario?.tipo_documento} {trainer.usuario?.numero_documento}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trainer.usuario?.fecha_nacimiento
                            ? format(new Date(trainer.usuario.fecha_nacimiento), "dd/MM/yyyy")
                            : "Sin fecha"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{trainer.usuario?.correo}</div>
                        <div className="text-xs text-gray-500">{trainer.usuario?.telefono || "Sin teléfono"}</div>
                      </TableCell>
                      <TableCell>{trainer.especialidad}</TableCell>
                      <TableCell>
                        {getStatusBadge(trainer.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(canUpdateTrainers || canDeleteTrainers || canChangeStatus) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(trainer)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              {canUpdateTrainers && (
                                <DropdownMenuItem onClick={() => handleEditTrainer(trainer)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {canChangeStatus && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(trainer)}>
                                  {trainer.estado ? (
                                    <Power className="w-4 h-4 mr-2" />
                                  ) : (
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                  )}
                                  {trainer.estado ? "Desactivar" : "Activar"}
                                </DropdownMenuItem>
                              )}
                              {canDeleteTrainers && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTrainer(trainer)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
          >
            Anterior
          </Button>
          <span className="py-2 px-3 text-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* New Trainer Modal */}
      <NewTrainerForm
        isOpen={isNewTrainerModalOpen}
        onClose={() => setIsNewTrainerModalOpen(false)}
        onCreateTrainer={handleCreateTrainer}
      />

      {/* Edit Trainer Modal */}
      {selectedTrainer && isEditModalOpen && (
        <EditTrainerModal
          trainer={selectedTrainer}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTrainer(null);
          }}
          onUpdateTrainer={handleUpdateTrainer}
        />
      )}

      {/* Trainer Details Modal */}
      {selectedTrainer && isDetailsModalOpen && (
        <TrainerDetails
          trainer={selectedTrainer}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTrainer(null);
          }}
        />
      )}
    </div>
  );
} 