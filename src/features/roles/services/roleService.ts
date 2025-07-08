import { useState, useEffect } from "react"
import type {
  Role, 
  Permission, 
  IRole,
  IPermission,
  IPrivilege,
  IModulo,
  RolesResponse,
  PermissionsResponse,
  RoleFormData,
  ApiResponse,
  RoleResponse,
  PermissionSelection,
  RoleWithPermissionsResponse
} from "@/shared/types/role"

const API_BASE_URL = "https://gmsf-backend.vercel.app/roles"

// Función para transformar IRole a Role (backend a frontend)
const transformRole = (iRole: IRole): Role => ({
  ...iRole,
  name: iRole.nombre,
  description: iRole.descripcion || "",
  status: iRole.estado ? "Activo" : "Inactivo",
  isActive: iRole.estado,
  permissions: iRole.permisos?.map(transformPermission),
})

// Función para transformar IPermission a Permission
const transformPermission = (iPermission: IPermission): Permission => ({
  ...iPermission,
  privileges: iPermission.privilegios?.map((privilege) => ({
    ...privilege,
    selected: false,
  })),
})

export function useRoles(page = 1, limit = 10, search = "") {
  const [data, setData] = useState<{
    roles: Role[]
    total: number
    pagina: number
    limite: number
    total_paginas: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pagina: page.toString(),
        limite: limit.toString(),
        ...(search && { busqueda: search }),
      })

      const response = await fetch(`${API_BASE_URL}?${params}`)
      if (!response.ok) throw new Error("Error al cargar los roles")

      const result: ApiResponse<RolesResponse> = await response.json()

      if (result.status === "success" && result.data) {
        const transformedRoles = result.data.roles.map(transformRole)
        setData({
          roles: transformedRoles,
          total: result.data.total,
          pagina: result.data.pagina,
          limite: result.data.limite,
          total_paginas: result.data.total_paginas,
        })
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [page, limit, search])

  return { data, loading, error, refetch: fetchRoles }
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/permisos`)
        if (!response.ok) throw new Error("Error al cargar los permisos")

        const result: ApiResponse<PermissionsResponse> = await response.json()

        if (result.status === "success" && result.data) {
          const transformedPermissions = result.data.permisos.map(transformPermission)
          setPermissions(transformedPermissions)
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  return { permissions, loading, error }
}

export function useRoleMutations() {
  const [loading, setLoading] = useState(false)

  const createRole = async (data: RoleFormData): Promise<Role> => {
    setLoading(true)
    try {
      // Transformar datos del frontend al formato del backend
      const backendData = {
        nombre: data.name,
        descripcion: data.description,
        estado: data.isActive,
        privilegios: data.privileges || [],
      }

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      })

      if (!response.ok) throw new Error("Error al crear el rol")

      const result: ApiResponse<RoleResponse> = await response.json()
      if (result.status === "success" && result.data) {
        return transformRole(result.data.role)
      }
      throw new Error(result.message || "Error al crear el rol")
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (id: number, data: RoleFormData): Promise<Role> => {
    setLoading(true)
    try {
      const backendData = {
        nombre: data.name,
        descripcion: data.description,
        estado: data.isActive,
        privilegios: data.privileges || [],
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      })

      if (!response.ok) throw new Error("Error al actualizar el rol")

      const result: ApiResponse<RoleResponse> = await response.json()
      if (result.status === "success" && result.data) {
        return transformRole(result.data.role)
      }
      throw new Error(result.message || "Error al actualizar el rol")
    } finally {
      setLoading(false)
    }
  }

  const deleteRole = async (id: number): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar el rol")

      const result: ApiResponse<any> = await response.json()
      if (result.status !== "success") {
        throw new Error(result.message || "Error al eliminar el rol")
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleRoleStatus = async (id: number, estado: boolean): Promise<Role> => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })

      if (!response.ok) throw new Error("Error al cambiar el estado del rol")

      const result: ApiResponse<RoleResponse> = await response.json()
      if (result.status === "success" && result.data) {
        return transformRole(result.data.role)
      }
      throw new Error(result.message || "Error al cambiar el estado del rol")
    } finally {
      setLoading(false)
    }
  }

  return { createRole, updateRole, deleteRole, toggleRoleStatus, loading }
}

// Servicio tradicional para uso en contextos y utilidades
class RoleService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        },
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) throw new Error("No autorizado. Por favor, inicie sesión nuevamente.")
        if (response.status === 403) throw new Error("No tiene permisos para realizar esta acción.")
        throw new Error(data.message || `Error del servidor: ${response.status}`)
      }

      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Error de conexión. Verifique su conexión a internet.")
      }
      throw error
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const data = await this.makeRequest(`${API_BASE_URL}`)
      return data.data?.roles?.map((role: IRole) => transformRole(role)) || []
    } catch (error) {
      console.error("Error fetching roles:", error)
      throw error
    }
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    try {
      const data = await this.makeRequest(`${API_BASE_URL}/${id}`)
      return data.data?.role ? transformRole(data.data.role) : undefined
    } catch (error) {
      console.error("Error fetching role by id:", error)
      throw error
    }
  }

  async getRoleWithPermissions(id: number): Promise<{ role: Role; permissions: PermissionSelection[] }> {
    try {
      const data = await this.makeRequest(`${API_BASE_URL}/${id}/permissions`)
      const response: RoleWithPermissionsResponse = data.data
      
      // Transformar el rol
      const role = transformRole(response.rol)
      
      // Transformar los módulos a PermissionSelection[]
      const permissions: PermissionSelection[] = []
      
      response.modulos.forEach(modulo => {
        // Agregar permisos del módulo
        modulo.permisos.forEach(permiso => {
          permissions.push({
            permissionId: permiso.id,
            permissionName: permiso.nombre,
            permissionCode: permiso.codigo,
            permissionDescription: permiso.descripcion,
            module: modulo.nombre,
            privileges: permiso.privilegios?.map(privilegio => ({
              id: privilegio.id,
              name: privilegio.nombre,
              code: privilegio.codigo,
              selected: true // Ya están asignados al rol
            })) || []
          })
        })
        
        // Agregar privilegios directos del módulo (sin permiso padre)
        if (modulo.privilegios && modulo.privilegios.length > 0) {
          // Buscar si ya existe un permiso para este módulo
          let modulePermission = permissions.find(p => p.module === modulo.nombre && p.permissionId === 0)
          
          if (!modulePermission) {
            // Crear un permiso virtual para los privilegios directos
            modulePermission = {
              permissionId: 0, // ID especial para privilegios directos
              permissionName: `Privilegios de ${modulo.nombre}`,
              permissionCode: `privilegios_${modulo.nombre.toLowerCase().replace(/\s/g, '_')}`,
              permissionDescription: `Privilegios directos del módulo ${modulo.nombre}`,
              module: modulo.nombre,
              privileges: []
            }
            permissions.push(modulePermission)
          }
          
          // Agregar privilegios directos
          modulo.privilegios.forEach(privilegio => {
            modulePermission!.privileges.push({
              id: privilegio.id,
              name: privilegio.nombre,
              code: privilegio.codigo,
              selected: true // Ya están asignados al rol
            })
          })
        }
      })
      
      return { role, permissions }
    } catch (error) {
      console.error("Error fetching role with permissions:", error)
      throw error
    }
  }

  async getPermissionsAndPrivileges(): Promise<PermissionSelection[]> {
    try {
      const data = await this.makeRequest(`${API_BASE_URL}/permissions-privileges`)
      
      // Verificar si el backend devuelve datos con módulos
      if (data.data?.modulos) {
        // Estructura con módulos
        const modulos: IModulo[] = data.data.modulos
        const permissionSelections: PermissionSelection[] = []
        
        modulos.forEach(modulo => {
          modulo.permisos.forEach(permiso => {
            permissionSelections.push({
              permissionId: permiso.id,
              permissionName: permiso.nombre,
              permissionCode: permiso.codigo,
              permissionDescription: permiso.descripcion,
              module: modulo.nombre, // Usar el nombre del módulo directamente
              privileges: permiso.privilegios?.map(privilegio => ({
                id: privilegio.id,
                name: privilegio.nombre,
                code: privilegio.codigo,
                selected: false
              })) || []
            })
          })
        })
        
        return permissionSelections
      } else {
        // Estructura legacy sin módulos
        const permissions = data.data?.permisos || []
        
        return permissions.map((permiso: IPermission) => ({
          permissionId: permiso.id,
          permissionName: permiso.nombre,
          permissionCode: permiso.codigo,
          permissionDescription: permiso.descripcion,
          module: this.extractModuleFromPermission(permiso), // Extraer módulo del permiso
          privileges: permiso.privilegios?.map(privilegio => ({
            id: privilegio.id,
            name: privilegio.nombre,
            code: privilegio.codigo,
            selected: false
          })) || []
        }))
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
      throw error
    }
  }

  // Método para extraer el módulo del permiso basado en su código o nombre
  private extractModuleFromPermission(permiso: IPermission): string {
    const name = permiso.nombre.toLowerCase()
    const code = permiso.codigo.toLowerCase()
    
    // Mapeo de módulos basado en patrones comunes
    if (name.includes('usuario') || code.includes('user')) return 'Gestión de Usuarios'
    if (name.includes('rol') || code.includes('role')) return 'Gestión de Roles'
    if (name.includes('cliente') || code.includes('client')) return 'Gestión de Clientes'
    if (name.includes('entrenador') || code.includes('trainer')) return 'Gestión de Entrenadores'
    if (name.includes('servicio') || code.includes('service')) return 'Gestión de Servicios'
    if (name.includes('contrato') || code.includes('contract')) return 'Gestión de Contratos'
    if (name.includes('membresia') || code.includes('membership')) return 'Gestión de Membresías'
    if (name.includes('asistencia') || code.includes('attendance')) return 'Control de Asistencia'
    if (name.includes('dashboard') || code.includes('dashboard')) return 'Panel de Control'
    if (name.includes('horario') || code.includes('schedule')) return 'Gestión de Horarios'
    
    return 'Sistema General' // Módulo por defecto
  }

  // Método para aplicar selecciones existentes
  applyExistingSelections(permissions: PermissionSelection[], existingPrivileges?: IPrivilege[]): PermissionSelection[] {
    if (!existingPrivileges || existingPrivileges.length === 0) {
      return permissions
    }

    return permissions.map(permission => ({
      ...permission,
      privileges: permission.privileges.map(privilege => ({
        ...privilege,
        selected: existingPrivileges.some(existing => existing.id === privilege.id)
      }))
    }))
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    try {
      const backendData = {
        nombre: roleData.name || roleData.nombre,
        descripcion: roleData.description || roleData.descripcion,
        estado: roleData.isActive ?? roleData.estado ?? true,
        privilegios: roleData.privilegios?.map(p => p.id) || []
      }

      const data = await this.makeRequest(`${API_BASE_URL}`, {
        method: "POST",
        body: JSON.stringify(backendData)
      })
      
      return transformRole(data.data.role)
    } catch (error) {
      console.error("Error creating role:", error)
      throw error
    }
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<Role> {
    try {
      const backendData = {
        nombre: roleData.name || roleData.nombre,
        descripcion: roleData.description || roleData.descripcion,
        estado: roleData.isActive ?? roleData.estado,
        privilegios: roleData.privilegios?.map(p => p.id) || []
      }

      const data = await this.makeRequest(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(backendData)
      })
      
      return transformRole(data.data.role)
    } catch (error) {
      console.error("Error updating role:", error)
      throw error
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      await this.makeRequest(`${API_BASE_URL}/${id}`, {
        method: "DELETE"
      })
    } catch (error) {
      console.error("Error deleting role:", error)
      throw error
    }
  }

  async toggleRoleStatus(id: number, estado: boolean): Promise<Role> {
    try {
      const data = await this.makeRequest(`${API_BASE_URL}/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado })
      })
      
      return transformRole(data.data.role)
    } catch (error) {
      console.error("Error toggling role status:", error)
      throw error
    }
  }

  async getRolesForSelect(): Promise<{ id: number; nombre: string }[]> {
    try {
      const roles = await this.getRoles()
      return roles
        .filter(role => role.estado)
        .map(role => ({
          id: role.id,
          nombre: role.nombre
        }))
    } catch (error) {
      console.error("Error fetching roles for select:", error)
      throw error
    }
  }

  // Métodos compatibles con el modal existente
  async createRoleWithPermissions(formData: any, permissions: PermissionSelection[]): Promise<Role> {
    try {
      const selectedPrivileges = permissions
        .flatMap(p => p.privileges.filter(priv => priv.selected))
        .map(priv => priv.id)

      const roleData = {
        nombre: formData.nombre || formData.name,
        descripcion: formData.descripcion || formData.description,
        estado: formData.estado ?? formData.isActive ?? true,
        privilegios: selectedPrivileges
      }

      const data = await this.makeRequest(`${API_BASE_URL}`, {
        method: "POST",
        body: JSON.stringify(roleData)
      })
      
      return transformRole(data.data.role)
    } catch (error) {
      console.error("Error creating role:", error)
      throw error
    }
  }

  async updateRoleWithPermissions(role: Role, permissions: PermissionSelection[]): Promise<Role> {
    try {
      const selectedPrivileges = permissions
        .flatMap(p => p.privileges.filter(priv => priv.selected))
        .map(priv => priv.id)

      const roleData = {
        nombre: role.nombre || role.name,
        descripcion: role.descripcion || role.description,
        estado: role.estado ?? role.isActive,
        privilegios: selectedPrivileges
      }

      const data = await this.makeRequest(`${API_BASE_URL}/${role.id}`, {
        method: "PUT",
        body: JSON.stringify(roleData)
      })
      
      return transformRole(data.data.role)
    } catch (error) {
      console.error("Error updating role:", error)
      throw error
    }
  }
}

// Exportar instancia del servicio
export const roleService = new RoleService()