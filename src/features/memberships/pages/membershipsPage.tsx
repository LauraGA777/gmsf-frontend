import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { 
  Plus, 
  Search, 
  DollarSign, 
  Calendar,
  MoreHorizontal,
  RefreshCw,
  Edit,
  Eye,
  RotateCcw,
  Power,
  Activity,
} from "lucide-react";
import { Separator } from "@/shared/components/ui/separator"
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useGym } from "@/shared/contexts/gymContext";
import { membershipService } from "@/features/memberships/services/membership.service";
import type { Membership } from "@/shared/types";
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

// Componente del formulario de membresía
function MembershipForm({ 
  membership, 
  onSave, 
  onCancel 
}: { 
  membership?: Membership;
  onSave: (data: Partial<Membership>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Membership>>({
    nombre: membership?.nombre || '',
    descripcion: membership?.descripcion || '',
    precio: membership?.precio || 0,
    dias_acceso: membership?.dias_acceso || 1,
    vigencia_dias: membership?.vigencia_dias || 30,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = membershipService.validateMembershipData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving membership:', error);
      setErrors(['Error al guardar la membresía']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <ul className="text-red-600 text-sm">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nombre de la Membresía</label>
        <Input
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Ej: Membresía Premium"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg resize-none"
          rows={3}
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Describe los beneficios de esta membresía..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio ($)</label>
          <Input
            type="text"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={formData.precio === 0 ? '' : formData.precio}
            onChange={(e) => {
              const value = e.target.value;
              // Solo permitir números y un punto decimal
              if (/^\d*\.?\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, precio: value === '' ? 0 : Number(value) }));
              }
            }}
            placeholder="Ingrese el precio"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Días de Acceso</label>
          <Input
            type="text"
            inputMode="numeric"
            min="1"
            value={formData.dias_acceso === 0 ? '' : formData.dias_acceso}
            onChange={(e) => {
              const value = e.target.value;
              // Solo permitir números enteros
              if (/^\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, dias_acceso: value === '' ? 0 : Number(value) }));
              }
            }}
            placeholder="Ingrese los días de acceso"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Días de Vigencia Total</label>
        <Input
          type="text"
          inputMode="numeric"
          min="1"
          value={formData.vigencia_dias === 0 ? '' : formData.vigencia_dias}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setFormData(prev => ({ ...prev, vigencia_dias: value === '' ? 0 : Number(value) }));
            }
          }}
          placeholder="Ingrese los días de vigencia"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Debe ser mayor o igual a los días de acceso
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : (membership ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
}

export function MembershipsPage() {
  const {
    memberships,
    membershipsLoading,
    refreshMemberships,
    contracts
  } = useGym();

  const [filteredMemberships, setFilteredMemberships] = useState<Membership[]>([]);
  const [isNewMembershipOpen, setIsNewMembershipOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    filterMemberships();
  }, [memberships, searchTerm, statusFilter]);

  const filterMemberships = () => {
    let filtered = [...memberships];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(membership => 
        membership.nombre.toLowerCase().includes(term) ||
        membership.codigo.toLowerCase().includes(term) ||
        membership.descripcion?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(membership => membership.estado === isActive);
    }

    setFilteredMemberships(filtered);
  };

  const getStatusBadge = (estado: boolean) => {
    return estado ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">Activa</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900">Inactiva</Badge>
    );
  };

  const getActiveContracts = (membershipId: string) => {
    return contracts.filter(c => 
      Number(c.id_membresia) === Number(membershipId) && c.estado === 'Activo'
    ).length;
  };

  const handleViewDetails = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsDetailsOpen(true);
  };

  const handleEditMembership = (membership: Membership) => {
    setEditingMembership(membership);
    setIsNewMembershipOpen(true);
  };

  const handleCreateMembership = async (data: Partial<Membership>) => {
    try {
      await membershipService.createMembership(data);
      await refreshMemberships();
      setIsNewMembershipOpen(false);
      setEditingMembership(null);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Membresía creada correctamente',
        icon: 'success',
        confirmButtonColor: '#000',
      });
    } catch (error) {
      console.error('Error creating membership:', error);
      throw error;
    }
  };

  const handleUpdateMembership = async (data: Partial<Membership>) => {
    if (!editingMembership) return;
    
    try {
      await membershipService.updateMembership(editingMembership.id, data);
      await refreshMemberships();
      setIsNewMembershipOpen(false);
      setEditingMembership(null);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Membresía actualizada correctamente',
        icon: 'success',
        confirmButtonColor: '#000',
      });
    } catch (error) {
      console.error('Error updating membership:', error);
      throw error;
    }
  };

  const handleToggleMembershipStatus = async (membership: Membership) => {
    try {
      const action = membership.estado ? 'desactivar' : 'reactivar';
      const result = await Swal.fire({
        title: `¿Está seguro de ${action} esta membresía?`,
        text: membership.estado ? 
          'Al desactivar la membresía, no se podrán crear nuevos contratos con ella.' :
          'Al reactivar la membresía, estará disponible para nuevos contratos.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Sí, ${action}`,
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        try {
          if (membership.estado) {
            await membershipService.deactivateMembership(membership.id);
          } else {
            await membershipService.reactivateMembership(membership.id);
          }
          
          // Actualizar la lista completa
          await refreshMemberships();
          
          Swal.fire({
            title: '¡Éxito!',
            text: `Membresía ${action}da correctamente`,
            icon: 'success',
            confirmButtonColor: '#000',
          });
        } catch (error: any) {
          if (error.message?.includes('contratos activos')) {
            Swal.fire({
              title: 'No se puede desactivar',
              text: error.message,
              icon: 'warning',
              confirmButtonColor: '#000',
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: error.message || 'Error al cambiar el estado de la membresía',
              icon: 'error',
              confirmButtonColor: '#000',
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error inesperado:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error inesperado',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    }
  };

  const MembershipActionsMenu = ({ membership }: { membership: Membership }) => {

    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleViewDetails(membership)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEditMembership(membership)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleMembershipStatus(membership)}>
            {membership.estado ? (
              <>
                <Power className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivar
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              refreshMemberships();
            }}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Membresías</h1>
          <p className="text-gray-600">Gestión de planes de membresía</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshMemberships}
            disabled={membershipsLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${membershipsLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => setIsNewMembershipOpen(true)}
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Membresía
          </Button>
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
                  placeholder="Buscar por nombre, código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Memberships Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Lista de Membresías ({filteredMemberships.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {membershipsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acceso/Vigencia</TableHead>
                  <TableHead>Contratos Activos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron membresías</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMemberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        {membership.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {membership.nombre}
                          </span>
                          <span className="text-sm text-gray-500 line-clamp-1">
                            {membership.descripcion}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          ${membership.precio.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {membership.dias_acceso} días acceso
                          </span>
                          <span className="text-xs text-gray-500">
                            {membership.vigencia_dias} días vigencia
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900">
                          {getActiveContracts(membership.id)} activos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(membership.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <MembershipActionsMenu membership={membership} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New/Edit Membership Modal */}
      <Dialog open={isNewMembershipOpen} onOpenChange={setIsNewMembershipOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingMembership ? 'Editar Membresía' : 'Nueva Membresía'}
            </DialogTitle>
          </DialogHeader>
          <MembershipForm
            membership={editingMembership || undefined}
            onSave={editingMembership ? handleUpdateMembership : handleCreateMembership}
            onCancel={() => {
              setIsNewMembershipOpen(false);
              setEditingMembership(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Membership Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Detalles de la Membresía
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedMembership && (
            <div className="space-y-6">
              {/* Header with membership info */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedMembership.nombre}
                  </h2>
                  <p className="text-sm text-gray-500">Código: {selectedMembership.codigo}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusBadge(selectedMembership.estado)}
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {getActiveContracts(selectedMembership.id)} contratos activos
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
                <p className="text-gray-700">{selectedMembership.descripcion}</p>
              </div>

              <Separator />

              {/* Pricing and Duration */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios y Duración</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Precio</p>
                      <p className="text-xl font-bold text-green-600">
                        ${selectedMembership.precio.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Días de Acceso</p>
                      <p className="text-lg font-semibold">{selectedMembership.dias_acceso} días</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Vigencia Total</p>
                      <p className="text-lg font-semibold">{selectedMembership.vigencia_dias} días</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* System Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Fecha de Creación</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedMembership.fecha_creacion), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
} 