import { api } from "./api"

export type PermissionName =
  | "Panel de control"
  | "Gestión de roles"
  | "Gestión de usuarios"
  | "Gestión de entrenadores"
  | "Gestión de servicios"
  | "Gestión de clientes"
  | "Gestión de contratos"
  | "Gestión de membresías"
  | "Control de asistencia"

export type PrivilegeName = "Crear" | "Leer" | "Actualizar" | "Eliminar"

interface Permission {
  id: number
  nombre: PermissionName
  estado: boolean
}

interface Privilege {
  id: number
  nombre: PrivilegeName
  id_permiso: number
}

interface Role {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  estado: boolean
  permisos?: Permission[]
  privilegios?: Privilege[]
}

interface User {
  id: number
  nombre: string
  correo: string
  id_rol: number
  rol?: Role
}

interface UserPermissionsResponse {
  status: string
  data: {
    usuario: User
  }
}

class PermissionService {
  private userPermissions: Permission[] = []
  private userPrivileges: Privilege[] = []
  private isInitialized = false
  private currentUserId: number | null = null

  // Mapeo de permisos a módulos del frontend
  public readonly PERMISSION_MODULE_MAP = {
    "Panel de control": {
      route: "/dashboard",
      component: "Dashboard",
      privileges: ["Leer"] as PrivilegeName[],
    },
    "Gestión de roles": {
      route: "/roles",
      component: "Roles",
      privileges: ["Crear", "Leer", "Actualizar", "Eliminar"] as PrivilegeName[],
    },
    "Gestión de usuarios": {
      route: "/users",
      component: "Users",
      privileges: ["Crear", "Leer", "Actualizar", "Eliminar"] as PrivilegeName[],
    },
    "Gestión de entrenadores": {
      route: "/trainers",
      component: "Trainers",
      privileges: ["Crear", "Leer", "Actualizar", "Eliminar"] as PrivilegeName[],
    },
    "Gestión de servicios": {
      route: "/services",
      component: "Services",
      privileges: ["Crear", "Leer", "Actualizar", "Eliminar"] as PrivilegeName[],
    },
    "Gestión de clientes": {
      route: "/clients",
      component: "Clients",
      privileges: ["Crear", "Leer", "Actualizar", "Eliminar"] as PrivilegeName[],
    },
    "Gestión de contratos": {
      route: "/contracts",
      component: "Contracts",
      privileges: ["Crear", "Leer", "Actualizar", "Eliminar"] as PrivilegeName[],
    },
    "Gestión de membresías": {
      route: "/memberships",
      component: "Memberships",
      privileges: ["Crear", "Leer", "Actualizar", "Eliminar"] as PrivilegeName[],
    },
    "Control de asistencia": {
      route: "/attendance",
      component: "Attendance",
      privileges: ["Crear", "Leer", "Actualizar"] as PrivilegeName[],
    },
  }

  async getUserPermissions(userId?: number): Promise<void> {
    try {
      console.log("🔄 Obteniendo permisos del usuario...", userId)

      // Si tenemos un userId específico, usarlo para el fallback
      if (userId) {
        this.currentUserId = userId
      }

      const response = await api.get<UserPermissionsResponse>("/auth/profile")

      console.log("📡 Respuesta del servidor:", response.status)
      console.log("📦 Datos recibidos:", response.data)

      if (response.data.status !== "success") {
        throw new Error("Error al obtener permisos del usuario")
      }

      const user = response.data.data.usuario
      console.log("👤 Usuario:", user)
      console.log("🎭 Rol del usuario:", user.rol)

      if (!user.rol || !user.rol.permisos || user.rol.permisos.length === 0) {
        console.warn("⚠️ Usuario sin rol asignado o sin permisos, aplicando fallback")

        // FALLBACK: Asignar permisos básicos según id_rol
        const roleId = user.id_rol || this.currentUserId
        if (roleId) {
          console.log("🔧 Aplicando fallback de permisos para id_rol:", roleId)
          this.applyFallbackPermissions(roleId)
        } else {
          this.userPermissions = []
          this.userPrivileges = []
        }

        this.isInitialized = true
        return
      }

      // Extraer permisos del rol
      this.userPermissions = user.rol.permisos || []
      this.userPrivileges = user.rol.privilegios || []

      console.log("✅ Permisos extraídos:", this.userPermissions)
      console.log("🔑 Privilegios extraídos:", this.userPrivileges)

      this.isInitialized = true
    } catch (error) {
      console.error("❌ Error al obtener permisos:", error)

      // FALLBACK CRÍTICO: Si falla la API, usar permisos por defecto
      console.log("🔧 Aplicando fallback crítico de permisos")
      const roleId = this.currentUserId || 3 // Default a cliente si no hay información
      this.applyFallbackPermissions(roleId)

      this.isInitialized = true
      // No lanzar error para que la aplicación siga funcionando
    }
  }

  // FALLBACK TEMPORAL mientras se arregla el backend
  private applyFallbackPermissions(roleId: number): void {
    console.log("🔧 Aplicando permisos fallback para rol:", roleId)

    const fallbackPermissions: Record<number, PermissionName[]> = {
      1: [
        // Administrador
        "Panel de control",
        "Gestión de roles",
        "Gestión de usuarios",
        "Gestión de entrenadores",
        "Gestión de servicios",
        "Gestión de clientes",
        "Gestión de contratos",
        "Gestión de membresías",
        "Control de asistencia",
      ],
      2: [
        // Entrenador
        "Panel de control",
        "Gestión de clientes",
        "Gestión de contratos",
        "Gestión de membresías",
        "Control de asistencia",
      ],
      3: [
        // Cliente
        "Panel de control",
        "Gestión de membresías",
        "Control de asistencia",
      ],
      4: [
        // Beneficiario
        "Panel de control",
        "Gestión de membresías",
        "Control de asistencia",
      ],
    }

    const permissions = fallbackPermissions[roleId] || fallbackPermissions[3] // Default a cliente

    this.userPermissions = permissions.map((nombre, index) => ({
      id: index + 1,
      nombre,
      estado: true,
    }))

    // Generar privilegios básicos
    this.userPrivileges = []
    permissions.forEach((permiso, permIndex) => {
      const privileges =
        roleId === 1
          ? ["Crear", "Leer", "Actualizar", "Eliminar"]
          : roleId === 2
            ? ["Crear", "Leer", "Actualizar"]
            : ["Leer"]

      privileges.forEach((privilegio, privIndex) => {
        this.userPrivileges.push({
          id: permIndex * 4 + privIndex + 1,
          nombre: privilegio as PrivilegeName,
          id_permiso: permIndex + 1,
        })
      })
    })

    console.log("🔧 Permisos fallback aplicados:", this.userPermissions)
    console.log("🔧 Privilegios fallback aplicados:", this.userPrivileges)
  }

  hasModuleAccess(moduleName: PermissionName): boolean {
    if (!this.isInitialized) {
      console.log(`⏳ Permisos no inicializados para ${moduleName}`)
      return false
    }

    const hasPermission = this.userPermissions.some(
      (permission) => permission.nombre === moduleName && permission.estado,
    )

    console.log(`🔍 Verificando acceso a "${moduleName}":`, hasPermission)
    if (!hasPermission) {
      console.log(
        `📋 Permisos disponibles:`,
        this.userPermissions.map((p) => p.nombre),
      )
    }

    return hasPermission
  }

  hasPrivilege(moduleName: PermissionName, privilegeName: PrivilegeName): boolean {
    if (!this.isInitialized) {
      return false
    }

    // Primero verificar si tiene acceso al módulo
    if (!this.hasModuleAccess(moduleName)) {
      return false
    }

    // Buscar el permiso correspondiente
    const permission = this.userPermissions.find((p) => p.nombre === moduleName && p.estado)

    if (!permission) {
      return false
    }

    // Verificar si tiene el privilegio específico para este permiso
    const hasPrivilege = this.userPrivileges.some(
      (privilege) => privilege.id_permiso === permission.id && privilege.nombre === privilegeName,
    )

    console.log(`🔑 Verificando privilegio "${privilegeName}" para "${moduleName}":`, hasPrivilege)

    return hasPrivilege
  }

  hasAnyPrivilege(moduleName: PermissionName, privileges: PrivilegeName[]): boolean {
    return privileges.some((privilege) => this.hasPrivilege(moduleName, privilege))
  }

  hasAllPrivileges(moduleName: PermissionName, privileges: PrivilegeName[]): boolean {
    return privileges.every((privilege) => this.hasPrivilege(moduleName, privilege))
  }

  getAccessibleModules(): Array<{
    name: PermissionName
    route: string
    component: string
    privileges: PrivilegeName[]
  }> {
    if (!this.isInitialized) {
      return []
    }

    return Object.entries(this.PERMISSION_MODULE_MAP)
      .filter(([moduleName]) => this.hasModuleAccess(moduleName as PermissionName))
      .map(([moduleName, config]) => ({
        name: moduleName as PermissionName,
        route: config.route,
        component: config.component,
        privileges: config.privileges,
      }))
  }

  getUserPermissionsList(): PermissionName[] {
    return this.userPermissions.filter((permission) => permission.estado).map((permission) => permission.nombre)
  }

  clearPermissions(): void {
    this.userPermissions = []
    this.userPrivileges = []
    this.isInitialized = false
    this.currentUserId = null
    console.log("🧹 Permisos limpiados")
  }

  // Método para forzar inicialización con ID de usuario
  async initializeWithUserId(userId: number): Promise<void> {
    this.currentUserId = userId
    await this.getUserPermissions(userId)
  }
}

export const permissionService = new PermissionService()
