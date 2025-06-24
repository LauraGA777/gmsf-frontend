import type { Role, Permission, PermissionSelection } from "@/shared/types/role"

const API_BASE_URL = "https://gmsf-backend.vercel.app"

// Mapear datos del backend al formato del frontend
const mapRoleToDisplayData = (role: any): Role => {
  console.log("Mapping role data:", role)

  const mapped: Role = {
    // Campos del backend
    id: role.id,
    codigo: role.codigo,
    nombre: role.nombre,
    descripcion: role.descripcion || "",
    estado: role.estado,
    permisos: role.permisos || [],
    privilegios: role.privilegios || [],
    createdAt: new Date(role.createdAt),
    updatedAt: new Date(role.updatedAt),

    // Campos para compatibilidad con el frontend actual
    name: role.nombre,
    description: role.descripcion || "",
    status: role.estado ? "Activo" : "Inactivo",
    isActive: role.estado,
    permissions: role.permisos || [],
    createdBy: "Admin", // El backend no incluye este campo
    userCount: 0, // Se puede obtener de otra consulta si es necesario
  }

  console.log("Mapped role:", mapped)
  return mapped
}

// Mapear datos del frontend al formato del backend
const mapRoleToBackendData = (role: Omit<Role, "id">, selectedPermissions: PermissionSelection[]): any => {
  // Extraer IDs de permisos seleccionados
  const permisos = selectedPermissions
    .filter((p) => p.privileges.some((priv) => priv.selected))
    .map((p) => p.permissionId)

  // Extraer IDs de privilegios seleccionados
  const privilegios = selectedPermissions.flatMap((p) =>
    p.privileges.filter((priv) => priv.selected).map((priv) => priv.id),
  )

  console.log("Mapped permissions:", permisos)
  console.log("Mapped privileges:", privilegios)

  return {
    nombre: role.name || role.nombre,
    descripcion: role.description || role.descripcion,
    estado: role.status === "Activo" || role.isActive || role.estado,
    permisos,
    privilegios,
  }
}

class RoleService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken")
    console.log("Getting auth token:", token ? "Token found" : "No token found")

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      console.log(`Making request to: ${url}`, options)

      const authHeaders = this.getAuthHeaders()
      console.log("Request headers:", authHeaders)

      const response = await fetch(url, {
        headers: {
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      })

      console.log(`Response status: ${response.status}`)
      console.log(`Response ok: ${response.ok}`)

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error(`Error parsing server response: ${parseError.message}`)
      }

      console.log(`Response from ${url}:`, data)

      if (!response.ok) {
        console.error(`HTTP Error ${response.status}:`, data)

        // Handle specific authentication errors
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicie sesión nuevamente.")
        }

        if (response.status === 403) {
          throw new Error("No tiene permisos para realizar esta acción.")
        }

        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`Detailed error in request to ${url}:`, error)

      // Provide more specific error messages
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error("No se pudo conectar al servidor. Verifique la URL o su conexión.")
      }

      throw error
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      console.log("Fetching roles from API...")

      // Check if user is authenticated
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.warn("No access token found")
        throw new Error("No está autenticado. Por favor, inicie sesión.")
      }

      const data = await this.makeRequest(`${API_BASE_URL}/roles`)

      console.log("Full API response:", data)
      console.log("Response status:", data.status)
      console.log("Response data:", data.data)

      // Handle different possible response structures
      if (data.status === "success") {
        // Check if roles are in data.roles or data.data.roles
        const rolesArray = data.data?.roles || data.roles || []
        console.log("Roles array:", rolesArray)

        if (Array.isArray(rolesArray)) {
          return rolesArray.map(mapRoleToDisplayData)
        } else {
          console.warn("Roles is not an array:", rolesArray)
          return []
        }
      } else {
        console.warn("API response status is not success:", data.status)
        return []
      }
    } catch (error) {
      console.error("Detailed error in getRoles:", error)

      // Check if it's an authentication error
      if (error.message.includes("No autorizado") || error.message.includes("No se proporcionó token")) {
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
      }

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Error de conexión. Verifique su conexión a internet.")
      }

      // Check if it's a CORS error
      if (error instanceof TypeError && error.message.includes("CORS")) {
        throw new Error("Error de CORS. El servidor no permite el acceso desde este dominio.")
      }

      throw new Error(`Error al cargar los roles: ${error.message}`)
    }
  }

  async getRoleById(id: string): Promise<Role | undefined> {
    try {
      const data = await this.makeRequest(`${API_BASE_URL}/roles/${id}`)

      if (data.status === "success" && data.data?.role) {
        return mapRoleToDisplayData(data.data.role)
      }

      return undefined
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error)

      if (error.message.includes("No autorizado")) {
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
      }

      throw new Error("Error al cargar el rol")
    }
  }

  async createRole(roleData: Omit<Role, "id">, selectedPermissions: PermissionSelection[]): Promise<Role> {
    try {
      const backendData = mapRoleToBackendData(roleData, selectedPermissions)
      console.log("Creating role with data:", backendData)

      const data = await this.makeRequest(`${API_BASE_URL}/roles`, {
        method: "POST",
        body: JSON.stringify(backendData),
      })

      if (data.status === "success" && data.data?.role) {
        return mapRoleToDisplayData(data.data.role)
      }

      throw new Error(data.message || "Error al crear el rol")
    } catch (error) {
      console.error("Error creating role:", error)

      if (error.message.includes("No autorizado")) {
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
      }

      throw error
    }
  }

  async updateRole(role: Role, selectedPermissions: PermissionSelection[]): Promise<Role> {
    try {
      const backendData = mapRoleToBackendData(role, selectedPermissions)
      console.log(`Updating role ${role.id} with data:`, backendData)

      const data = await this.makeRequest(`${API_BASE_URL}/roles/${role.id}`, {
        method: "PUT",
        body: JSON.stringify(backendData),
      })

      if (data.status === "success" && data.data?.role) {
        return mapRoleToDisplayData(data.data.role)
      }

      throw new Error(data.message || "Error al actualizar el rol")
    } catch (error) {
      console.error(`Error updating role ${role.id}:`, error)

      if (error.message.includes("No autorizado")) {
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
      }

      throw error
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      console.log(`Deleting role ${id}`)

      const data = await this.makeRequest(`${API_BASE_URL}/roles/${id}`, {
        method: "DELETE",
      })

      if (data.status !== "success") {
        throw new Error(data.message || "Error al eliminar el rol")
      }
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error)

      if (error.message.includes("No autorizado")) {
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
      }

      throw error
    }
  }

  async searchRoles(query: string): Promise<Role[]> {
    try {
      const data = await this.makeRequest(`${API_BASE_URL}/roles/search?q=${encodeURIComponent(query)}`)

      if (data.status === "success" && data.data?.roles) {
        return data.data.roles.map(mapRoleToDisplayData)
      }

      return []
    } catch (error) {
      console.error("Error searching roles:", error)

      if (error.message.includes("No autorizado")) {
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
      }

      throw new Error("Error al buscar roles")
    }
  }

  async getPermissionsAndPrivileges(): Promise<Permission[]> {
    try {
      console.log("Fetching permissions and privileges...")

      // Usar la ruta correcta del backend
      const data = await this.makeRequest(`${API_BASE_URL}/roles/permissions`)

      console.log("Permissions response:", data)

      if (data.status === "success" && data.data?.permisos) {
        console.log("Found permissions:", data.data.permisos)
        return data.data.permisos
      }

      console.warn("No permissions found in response")
      return []
    } catch (error) {
      console.error("Error fetching permissions and privileges:", error)

      if (error.message.includes("No autorizado")) {
        throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
      }

      throw new Error("Error al cargar permisos y privilegios")
    }
  }

  async toggleRoleStatus(id: string): Promise<Role> {
    try {
      // Primero obtenemos el rol actual
      const currentRole = await this.getRoleById(id)
      if (!currentRole) {
        throw new Error("Rol no encontrado")
      }

      // Para cambiar estado, necesitamos los permisos actuales
      const currentPermissions: PermissionSelection[] =
        currentRole.permisos?.map((permission) => ({
          permissionId: permission.id,
          permissionName: permission.nombre,
          privileges:
            permission.privilegios?.map((privilege) => ({
              id: privilege.id,
              name: privilege.nombre,
              selected: currentRole.privilegios?.some((p) => p.id === privilege.id) || false,
            })) || [],
        })) || []

      // Cambiamos el estado
      const updatedRole = {
        ...currentRole,
        estado: !currentRole.estado,
        status: currentRole.estado ? "Inactivo" : "Activo",
        isActive: !currentRole.estado,
      }

      return await this.updateRole(updatedRole, currentPermissions)
    } catch (error) {
      console.error(`Error toggling role status ${id}:`, error)
      throw error
    }
  }

  // Convertir permisos del backend a formato de selección del frontend
  convertToPermissionSelection(
    permissions: Permission[],
    rolePermissions?: Permission[],
    rolePrivileges?: any[],
  ): PermissionSelection[] {
    return permissions.map((permission) => ({
      permissionId: permission.id,
      permissionName: permission.nombre,
      privileges:
        permission.privilegios?.map((privilege) => ({
          id: privilege.id,
          name: privilege.nombre,
          selected: rolePrivileges?.some((rp) => rp.id === privilege.id) || false,
        })) || [],
    }))
  }

  // Nueva función para obtener usuarios por rol
  async getUsersByRole(roleId: number): Promise<any[]> {
    try {
      console.log(`Fetching users for role ${roleId}`)

      // Usar el endpoint de usuarios con filtro por rol
      const data = await this.makeRequest(`${API_BASE_URL}/users?id_rol=${roleId}`)

      console.log("Users response:", data)

      if (data.status === "success" || data.data) {
        // Manejar diferentes estructuras de respuesta
        const users = data.data?.usuarios || data.data || data.users || []
        console.log("Found users:", users)
        return Array.isArray(users) ? users : []
      }

      return []
    } catch (error) {
      console.error(`Error fetching users for role ${roleId}:`, error)
      return []
    }
  }

  // Nueva función para obtener roles para el select
  async getRolesForSelect(): Promise<{ id: number; nombre: string }[]> {
    try {
      console.log("Fetching roles for select dropdown...")

      const data = await this.makeRequest(`${API_BASE_URL}/roles`)

      if (data.status === "success") {
        const rolesArray = data.data?.roles || data.roles || []
        
        // Filtrar solo roles activos y mapear solo los campos necesarios
        return rolesArray
          .filter((role: any) => role.estado)
          .map((role: any) => ({
            id: role.id,
            nombre: role.nombre
          }));
      }

      console.warn("No roles found or invalid response format")
      return []
    } catch (error) {
      console.error("Error fetching roles for select:", error)
      throw new Error("Error al cargar los roles disponibles")
    }
  }
}

export const roleService = new RoleService()
