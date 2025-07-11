import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Plus, Search, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/shared/components/ui/use-toast";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { PERMISSIONS, PRIVILEGES } from "@/shared/services/permissionService";
import { trainerService } from "../services/trainer.service";
import type { Trainer } from "@/shared/types/trainer";
import { TrainersTable } from "../components/trainersTable";
import { NewTrainerForm, CreateTrainerFormValues } from "../components/newTrainerForm";
import { EditTrainerModal, UpdateTrainerFormValues } from "../components/editTrainerModal";
import { TrainerDetails } from "../components/trainerDetails";
import Swal from "sweetalert2";

export function TrainersPage() {
  const { toast } = useToast();
  const { hasPrivilege } = usePermissions();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    setError(null);
    try {
      const params: any = {
        pagina: page,
        limite: limit,
        orden: 'nombre',
        direccion: 'ASC',
      };
      if (searchTerm) params.q = searchTerm;
      if (statusFilter !== "all") params.estado = statusFilter === 'true';
      
      const response = await trainerService.getTrainers(params);
      setTrainers(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (err) {
      setError("Error al cargar los entrenadores.");
      toast({ title: "Error", description: "No se pudieron cargar los entrenadores.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [canViewTrainers, searchTerm, statusFilter, toast]);

  useEffect(() => {
    fetchTrainers(pagination.page, pagination.limit);
  }, [fetchTrainers, pagination.page, pagination.limit]);

  const handleCreateTrainer = async (data: CreateTrainerFormValues) => {
    try {
      await trainerService.createTrainer(data);
      toast({ title: "¡Éxito!", description: "Entrenador creado correctamente." });
      fetchTrainers(); // Recargar la lista
      setIsNewTrainerModalOpen(false);
    } catch (error: any) {
      console.error("Error al crear entrenador:", error);
      toast({ title: "Error", description: error.response?.data?.message || "No se pudo crear el entrenador.", variant: "destructive" });
      throw error;
    }
  };

  const handleUpdateTrainer = async (id: number, data: UpdateTrainerFormValues) => {
    try {
      await trainerService.updateTrainer(id, data);
      toast({ title: "¡Éxito!", description: "Entrenador actualizado correctamente." });
      fetchTrainers();
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
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "No, cancelar",
    });

    if (result.isConfirmed) {
      try {
        if (trainer.estado) {
          await trainerService.deactivateTrainer(trainer.id);
        } else {
          await trainerService.activateTrainer(trainer.id);
        }
        toast({ title: "¡Éxito!", description: `Entrenador ${actionText}do correctamente.` });
        fetchTrainers();
      } catch (error: any) {
        toast({ title: "Error", description: error.response?.data?.message || `No se pudo ${actionText} el entrenador.`, variant: "destructive" });
      }
    }
  };

  const handleDeleteTrainer = async (id: number) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción es permanente y eliminará al usuario asociado. No se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await trainerService.deleteTrainer(id);
            toast({ title: '¡Éxito!', description: 'Entrenador eliminado permanentemente.' });
            fetchTrainers();
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo eliminar el entrenador.', variant: 'destructive' });
        }
    }
  };


  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const openDetailsModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsDetailsModalOpen(true);
  };
  
  const openEditModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsEditModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Entrenadores</h1>
          <p className="text-gray-600">Gestión de entrenadores del gimnasio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchTrainers()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {canCreateTrainers && (
            <Button onClick={() => setIsNewTrainerModalOpen(true)} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Entrenador
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, documento, especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <TrainersTable
            trainers={trainers}
            isLoading={isLoading}
            onViewDetails={openDetailsModal}
            onEdit={openEditModal}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteTrainer}
            pagination={pagination}
            onPageChange={handlePageChange}
            permissions={{ canUpdateTrainers, canDeleteTrainers, canChangeStatus }}
        />
      </div>

      {isNewTrainerModalOpen && (
        <NewTrainerForm
          isOpen={isNewTrainerModalOpen}
          onClose={() => setIsNewTrainerModalOpen(false)}
          onCreateTrainer={handleCreateTrainer}
        />
      )}

      {isEditModalOpen && selectedTrainer && (
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

      {isDetailsModalOpen && selectedTrainer && (
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