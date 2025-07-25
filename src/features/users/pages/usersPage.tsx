import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { UserFormModal } from "../components/userFormModal";
import { UserDetailsModal } from "../components/userDetailsModal";
import { 
  Plus, 
  Search, 
  Users, 
  MoreHorizontal,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  RotateCcw,
  Power
} from "lucide-react";
import { userService } from "../services/userService";
import type { User, UserFormData } from "../types/user";
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

import { roleService } from '@/features/roles/services/roleService';
import { useDebounce } from "@/shared/hooks/useDebounce";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const itemsPerPage = 10;

  const loadUsers = useCallback(async (page: number, query = "") => {
  setIsLoading(true);
  setError(null);
  try {
    const response = query 
      ? await userService.searchUsers(query, page, itemsPerPage)
      : await userService.getUsers(page, itemsPerPage);

    // Agregar logs para debuggear
    console.log('Response completa:', response);
    console.log('Response.data:', response?.data);
    console.log('Es array response.data?', Array.isArray(response?.data));

    if (response?.data && Array.isArray(response.data)) {
      setUsers(response.data);
      setFilteredUsers(response.data);
      setTotalPages(response.totalPages || 1);
    } else {
      // Agregar más información sobre por qué falla
      console.log('La respuesta no tiene la estructura esperada');
      console.log('Tipo de response:', typeof response);
      console.log('Tipo de response.data:', typeof response?.data);
      
      setUsers([]);
      setFilteredUsers([]);
      setTotalPages(1);
    }
  } catch (err: any) {
    console.error('Error completo:', err);
  } finally {
    setIsLoading(false);
  }
}, []);
  
  useEffect(() => {
    loadUsers(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery, loadUsers]);
  
  useEffect(() => {
    // Por ahora, mostramos todos los usuarios sin filtrar localmente
    // para que funcione correctamente con la paginación del servidor
    setFilteredUsers(users);
  }, [users]);

  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        console.log('Iniciando carga de roles...');
        const roles = await roleService.getRolesForSelect();
        console.log('Roles cargados:', roles);
        setRoles(roles);
      } catch (error) {
        console.error('Error cargando roles:', error);
      }
    };
    loadRoles();
  }, []);

  const getRoleName = (id_rol: number | null | undefined) => {
    console.log('Buscando rol con ID:', id_rol);
    console.log('Roles disponibles:', roles);
    
    if (!id_rol || !Array.isArray(roles) || roles.length === 0) {
      console.log('ID de rol inválido o roles no cargados');
      return "Cargando...";
    }
    
    const rol = roles.find(r => r?.id === id_rol);
    if (!rol) {
      console.log('Rol no encontrado para ID:', id_rol);
      return "Desconocido";
    }
    return rol.nombre || "Sin nombre";
  };

  const getRoleBadge = (id_rol: number | null | undefined) => {
    console.log('ID del rol recibido:', id_rol); // Para debugging
    const roleName = getRoleName(id_rol);
    const isLoading = roleName === "Cargando...";
    
    return (
      <Badge className={`${isLoading ? 'bg-gray-50 text-gray-400' : 'bg-gray-100 text-gray-800'} hover:bg-gray-100`}>
        {roleName}
      </Badge>
    );
  };

  const getStatusBadge = (estado: boolean) => {
    return estado ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
    );
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsNewUserOpen(true);
  };
  
  const handleSaveUser = async () => {
    await loadUsers(currentPage, debouncedSearchQuery);
    setIsNewUserOpen(false);
    setEditingUser(null);
  }

  const handleCreateUser = async (data: UserFormData) => {
    try {
      await userService.createUser(data);
      await handleSaveUser();
      Swal.fire('¡Éxito!', 'Usuario creado correctamente', 'success');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const handleUpdateUser = async (data: Partial<UserFormData>) => {
    if (!editingUser) return;
    try {
      await userService.updateUser(editingUser.id, data);
      await handleSaveUser();
      Swal.fire('¡Éxito!', 'Usuario actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleToggleUserStatus = async (id: number, currentStatus: boolean) => {
    if (!id || id <= 0) {
      console.error('ID de usuario inválido:', id);
      return;
    }

    const result = await Swal.fire({
      title: currentStatus ? "¿Desactivar usuario?" : "¿Activar usuario?",
      text: currentStatus ? "¿Está seguro que desea desactivar este usuario?" : "¿Está seguro que desea activar este usuario?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: currentStatus ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        if (currentStatus) {
          await userService.deactivateUser(id);
        } else {
          await userService.activateUser(id);
        }
        await handleSaveUser(); // Recargar y refrescar
        
        Swal.fire({
          title: currentStatus ? "¡Desactivado!" : "¡Activado!",
          text: `El usuario ha sido ${currentStatus ? "desactivado" : "activado"} correctamente`,
          icon: "success",
        });
      } catch (error: any) {
        console.error('Error toggling user status:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'No se puede desactivar el usuario porque tiene contratos activos',
          icon: 'error',
          confirmButtonColor: '#000',
        });
      }
    }
  };
  
  const handleDeleteUserPermanently = async (id: number, user: User) => {
    if (!id || id <= 0) {
      console.error('ID de usuario inválido:', id);
      return;
    }

    if (!user) {
      console.error('Datos de usuario inválidos');
      return;
    }

    if (user.estado) {
      await Swal.fire({
        title: "¡Operación bloqueada!",
        text: "No se puede eliminar un usuario activo. Desactívelo primero.",
        icon: "error",
        confirmButtonColor: "#000000",
      });
      return;
    }

    const { value: motivo } = await Swal.fire({
      title: "¿Eliminar permanentemente?",
      text: "Esta acción eliminará el usuario de forma permanente y no se podrá recuperar",
      icon: "warning",
      input: "textarea",
      inputLabel: "Motivo de eliminación",
      inputPlaceholder: "Ingrese el motivo por el cual desea eliminar este usuario...",
      inputAttributes: {
        'aria-label': 'Motivo de eliminación'
      },
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, eliminar permanentemente",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return 'Debe ingresar un motivo para eliminar el usuario';
        }
        if (value.length < 10) {
          return 'El motivo debe tener al menos 10 caracteres';
        }
      }
    });

    if (motivo) {
      try {
        await userService.deleteUserPermanently(id, motivo);
        await handleSaveUser(); // Recargar y refrescar
        
        Swal.fire({
          title: "¡Eliminado permanentemente!",
          text: "El usuario ha sido eliminado de forma permanente",
          icon: "success",
        });
      } catch (error: any) {
        console.error('Error deleting user permanently:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Error al eliminar el usuario permanentemente',
          icon: 'error',
          confirmButtonColor: '#000',
        });
      }
    }
  };

  // No necesitamos paginación local porque los datos ya vienen paginados del servidor
/* 
  if (users.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando el primer usuario al sistema</p>
            <Button onClick={() => setIsNewUserOpen(true)} className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Usuario
            </Button>
          </CardContent>
        </Card>
      </div>
    ); 
  }*/

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              loadUsers(currentPage, debouncedSearchQuery);
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
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-gray-600">Gestión de usuarios del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadUsers(currentPage, debouncedSearchQuery)}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => setIsNewUserOpen(true)}
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
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
                  placeholder="Buscar por nombre, correo o documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* Filtro por estado temporalmente deshabilitado para corregir problemas de paginación */}
            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios ({filteredUsers.length})
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron usuarios</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user?.id || Math.random()}>
                      <TableCell className="font-medium">{user?.codigo || 'N/A'}</TableCell>
                      <TableCell>
                        {(user?.nombre || '') + ' ' + (user?.apellido || '')}
                      </TableCell>
                      <TableCell>{user?.correo || 'N/A'}</TableCell>
                      <TableCell>{user?.numero_documento || 'N/A'}</TableCell>
                      <TableCell>{getRoleBadge(user?.id_rol)}</TableCell>
                      <TableCell>
                        {getStatusBadge(user?.estado ?? false)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user?.id || 0, user?.estado ?? false)}>
                              {user?.estado ? (
                                <Power className="w-4 h-4 mr-2" />
                              ) : (
                                <RotateCcw className="w-4 h-4 mr-2" />
                              )}
                              {user?.estado ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                            {!user?.estado && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUserPermanently(user?.id || 0, user)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar permanentemente
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Anterior
          </Button>
          <span className="py-2 px-3 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
      />

      {/* New/Edit User Modal */}
      <UserFormModal
        isOpen={isNewUserOpen}
        onClose={() => {
          setIsNewUserOpen(false);
          setEditingUser(null);
        }}
        onSave={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
      />
    </div>
  );
}