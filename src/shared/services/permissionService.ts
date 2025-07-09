import { api } from "./api"

export type PermissionName =
  | "ASISTENCIAS"
  | "CLIENTES"
  | "MEMBRESIAS"
  | "HORARIOS"
  | "ENTRENADORES"

export type PrivilegeName = 
  // Privilegios de Asistencias
  | "ASIST_READ"
  | "ASIST_SEARCH"
  | "ASIST_CREATE"
  | "ASIST_DETAILS"
  | "ASIST_UPDATE"
  | "ASIST_DELETE"
  | "ASIST_STATS"
  // Privilegios de Clientes
  | "CLIENT_READ"
  | "CLIENT_DETAILS"
  | "CLIENT_SEARCH_DOC"
  | "CLIENT_CREATE"
  | "CLIENT_UPDATE"
  | "CLIENT_DELETE"
  | "CLIENT_BENEFICIARIES"
  // Privilegios de Membresías
  | "MEMBERSHIP_READ"
  | "MEMBERSHIP_SEARCH"
  | "MEMBERSHIP_CREATE"
  | "MEMBERSHIP_UPDATE"
  | "MEMBERSHIP_DEACTIVATE"
  | "MEMBERSHIP_DETAILS"
  | "MEMBERSHIP_REACTIVATE"
  // Privilegios de Horarios
  | "SCHEDULE_READ"
  | "SCHEDULE_DETAILS"
  | "SCHEDULE_CREATE"
  | "SCHEDULE_UPDATE"
  | "SCHEDULE_DELETE"
  | "SCHEDULE_AVAILABILITY"
  | "SCHEDULE_CLIENT_VIEW"
  | "SCHEDULE_TRAINER_VIEW"
  | "SCHEDULE_DAILY_VIEW"
  | "SCHEDULE_WEEKLY_VIEW"
  | "SCHEDULE_MONTHLY_VIEW"
  | "SCHEDULE_TRAINERS_ACTIVE"
  | "SCHEDULE_CLIENTS_ACTIVE"
  // Privilegios de Entrenadores
  | "TRAINER_READ"
  | "TRAINER_CREATE"
  | "TRAINER_UPDATE"
  | "TRAINER_DEACTIVATE"
  | "TRAINER_DELETE"
  | "TRAINER_SEARCH"
  | "TRAINER_DETAILS"

interface Permission {
  id: number
  nombre: PermissionName
  descripcion?: string
  codigo: string
  estado: boolean
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  privilegios?: Privilege[]
  roles?: any[]
}

interface Privilege {
  id: number
  nombre: PrivilegeName
  descripcion?: string
  codigo: string
  id_permiso: number
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

interface Role {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  estado: boolean
  permisos?: Permission[]
  privilegios?: Privilege[]
  usuarios?: any[]
  fecha_creacion?: Date
  fecha_actualizacion?: Date
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
    "ASISTENCIAS": {
      route: "/attendance",
      component: "Attendance",
      privileges: ["ASIST_READ", "ASIST_SEARCH", "ASIST_CREATE", "ASIST_DETAILS", "ASIST_UPDATE", "ASIST_DELETE", "ASIST_STATS"] as PrivilegeName[],
    },
    "CLIENTES": {
      route: "/clients",
      component: "Clients",
      privileges: ["CLIENT_READ", "CLIENT_DETAILS", "CLIENT_SEARCH_DOC", "CLIENT_CREATE", "CLIENT_UPDATE", "CLIENT_DELETE", "CLIENT_BENEFICIARIES"] as PrivilegeName[],
    },
    "MEMBRESIAS": {
      route: "/memberships",
      component: "Memberships",
      privileges: ["MEMBERSHIP_READ", "MEMBERSHIP_SEARCH", "MEMBERSHIP_CREATE", "MEMBERSHIP_UPDATE", "MEMBERSHIP_DEACTIVATE", "MEMBERSHIP_DETAILS", "MEMBERSHIP_REACTIVATE"] as PrivilegeName[],
    },
    "HORARIOS": {
      route: "/schedule",
      component: "Schedule",
      privileges: ["SCHEDULE_READ", "SCHEDULE_DETAILS", "SCHEDULE_CREATE", "SCHEDULE_UPDATE", "SCHEDULE_DELETE", "SCHEDULE_AVAILABILITY", "SCHEDULE_CLIENT_VIEW", "SCHEDULE_TRAINER_VIEW", "SCHEDULE_DAILY_VIEW", "SCHEDULE_WEEKLY_VIEW", "SCHEDULE_MONTHLY_VIEW", "SCHEDULE_TRAINERS_ACTIVE", "SCHEDULE_CLIENTS_ACTIVE"] as PrivilegeName[],
    },
    "ENTRENADORES": {
      route: "/trainers",
      component: "Trainers",
      privileges: ["TRAINER_READ", "TRAINER_CREATE", "TRAINER_UPDATE", "TRAINER_DEACTIVATE", "TRAINER_DELETE", "TRAINER_SEARCH", "TRAINER_DETAILS"] as PrivilegeName[],
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

    const fallbackPermissions: Record<number, {name: PermissionName, code: string}[]> = {
      1: [
        // Administrador - Todos los módulos
        { name: "ASISTENCIAS", code: "ASISTENCIAS" },
        { name: "CLIENTES", code: "CLIENTES" },
        { name: "MEMBRESIAS", code: "MEMBRESIAS" },
        { name: "HORARIOS", code: "HORARIOS" },
        { name: "ENTRENADORES", code: "ENTRENADORES" },
      ],
      2: [
        // Entrenador - Módulos limitados
        { name: "ASISTENCIAS", code: "ASISTENCIAS" },
        { name: "CLIENTES", code: "CLIENTES" },
        { name: "HORARIOS", code: "HORARIOS" },
      ],
      3: [
        // Cliente - Solo lectura
        { name: "ASISTENCIAS", code: "ASISTENCIAS" },
        { name: "MEMBRESIAS", code: "MEMBRESIAS" },
        { name: "HORARIOS", code: "HORARIOS" },
      ],
      4: [
        // Beneficiario - Similar a cliente
        { name: "ASISTENCIAS", code: "ASISTENCIAS" },
        { name: "MEMBRESIAS", code: "MEMBRESIAS" },
        { name: "HORARIOS", code: "HORARIOS" },
      ],
    }

    const permissions = fallbackPermissions[roleId] || fallbackPermissions[3] // Default a cliente

    this.userPermissions = permissions.map((permission, index) => ({
      id: index + 1,
      nombre: permission.name,
      codigo: permission.code,
      estado: true,
      descripcion: `Acceso al módulo ${permission.name}`,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    }))

    // Generar privilegios específicos según el rol y módulo
    this.userPrivileges = []
    permissions.forEach((permission, permIndex) => {
      let privileges: {name: PrivilegeName, code: string}[] = []

      // Definir privilegios según el módulo y rol
      switch (permission.name) {
        case "ASISTENCIAS":
          if (roleId === 1) { // Administrador
            privileges = [
              { name: "ASIST_READ", code: "ASIST_READ" },
              { name: "ASIST_SEARCH", code: "ASIST_SEARCH" },
              { name: "ASIST_CREATE", code: "ASIST_CREATE" },
              { name: "ASIST_DETAILS", code: "ASIST_DETAILS" },
              { name: "ASIST_UPDATE", code: "ASIST_UPDATE" },
              { name: "ASIST_DELETE", code: "ASIST_DELETE" },
              { name: "ASIST_STATS", code: "ASIST_STATS" }
            ]
          } else if (roleId === 2) { // Entrenador
            privileges = [
              { name: "ASIST_READ", code: "ASIST_READ" },
              { name: "ASIST_SEARCH", code: "ASIST_SEARCH" },
              { name: "ASIST_CREATE", code: "ASIST_CREATE" },
              { name: "ASIST_DETAILS", code: "ASIST_DETAILS" },
              { name: "ASIST_UPDATE", code: "ASIST_UPDATE" }
            ]
          } else { // Cliente/Beneficiario
            privileges = [
              { name: "ASIST_READ", code: "ASIST_READ" },
              { name: "ASIST_DETAILS", code: "ASIST_DETAILS" }
            ]
          }
          break

        case "CLIENTES":
          if (roleId === 1) { // Administrador
            privileges = [
              { name: "CLIENT_READ", code: "CLIENT_READ" },
              { name: "CLIENT_DETAILS", code: "CLIENT_DETAILS" },
              { name: "CLIENT_SEARCH_DOC", code: "CLIENT_SEARCH_DOC" },
              { name: "CLIENT_CREATE", code: "CLIENT_CREATE" },
              { name: "CLIENT_UPDATE", code: "CLIENT_UPDATE" },
              { name: "CLIENT_DELETE", code: "CLIENT_DELETE" },
              { name: "CLIENT_BENEFICIARIES", code: "CLIENT_BENEFICIARIES" }
            ]
          } else if (roleId === 2) { // Entrenador
            privileges = [
              { name: "CLIENT_READ", code: "CLIENT_READ" },
              { name: "CLIENT_DETAILS", code: "CLIENT_DETAILS" },
              { name: "CLIENT_SEARCH_DOC", code: "CLIENT_SEARCH_DOC" }
            ]
          }
          break

        case "MEMBRESIAS":
          if (roleId === 1) { // Administrador
            privileges = [
              { name: "MEMBERSHIP_READ", code: "MEMBERSHIP_READ" },
              { name: "MEMBERSHIP_SEARCH", code: "MEMBERSHIP_SEARCH" },
              { name: "MEMBERSHIP_CREATE", code: "MEMBERSHIP_CREATE" },
              { name: "MEMBERSHIP_UPDATE", code: "MEMBERSHIP_UPDATE" },
              { name: "MEMBERSHIP_DEACTIVATE", code: "MEMBERSHIP_DEACTIVATE" },
              { name: "MEMBERSHIP_DETAILS", code: "MEMBERSHIP_DETAILS" },
              { name: "MEMBERSHIP_REACTIVATE", code: "MEMBERSHIP_REACTIVATE" }
            ]
          } else { // Cliente/Beneficiario
            privileges = [
              { name: "MEMBERSHIP_READ", code: "MEMBERSHIP_READ" },
              { name: "MEMBERSHIP_DETAILS", code: "MEMBERSHIP_DETAILS" }
            ]
          }
          break

        case "HORARIOS":
          if (roleId === 1) { // Administrador
            privileges = [
              { name: "SCHEDULE_READ", code: "SCHEDULE_READ" },
              { name: "SCHEDULE_DETAILS", code: "SCHEDULE_DETAILS" },
              { name: "SCHEDULE_CREATE", code: "SCHEDULE_CREATE" },
              { name: "SCHEDULE_UPDATE", code: "SCHEDULE_UPDATE" },
              { name: "SCHEDULE_DELETE", code: "SCHEDULE_DELETE" },
              { name: "SCHEDULE_AVAILABILITY", code: "SCHEDULE_AVAILABILITY" },
              { name: "SCHEDULE_CLIENT_VIEW", code: "SCHEDULE_CLIENT_VIEW" },
              { name: "SCHEDULE_TRAINER_VIEW", code: "SCHEDULE_TRAINER_VIEW" },
              { name: "SCHEDULE_DAILY_VIEW", code: "SCHEDULE_DAILY_VIEW" },
              { name: "SCHEDULE_WEEKLY_VIEW", code: "SCHEDULE_WEEKLY_VIEW" },
              { name: "SCHEDULE_MONTHLY_VIEW", code: "SCHEDULE_MONTHLY_VIEW" },
              { name: "SCHEDULE_TRAINERS_ACTIVE", code: "SCHEDULE_TRAINERS_ACTIVE" },
              { name: "SCHEDULE_CLIENTS_ACTIVE", code: "SCHEDULE_CLIENTS_ACTIVE" }
            ]
          } else if (roleId === 2) { // Entrenador
            privileges = [
              { name: "SCHEDULE_READ", code: "SCHEDULE_READ" },
              { name: "SCHEDULE_DETAILS", code: "SCHEDULE_DETAILS" },
              { name: "SCHEDULE_TRAINER_VIEW", code: "SCHEDULE_TRAINER_VIEW" },
              { name: "SCHEDULE_DAILY_VIEW", code: "SCHEDULE_DAILY_VIEW" },
              { name: "SCHEDULE_WEEKLY_VIEW", code: "SCHEDULE_WEEKLY_VIEW" }
            ]
          } else { // Cliente/Beneficiario
            privileges = [
              { name: "SCHEDULE_READ", code: "SCHEDULE_READ" },
              { name: "SCHEDULE_CLIENT_VIEW", code: "SCHEDULE_CLIENT_VIEW" },
              { name: "SCHEDULE_DAILY_VIEW", code: "SCHEDULE_DAILY_VIEW" }
            ]
          }
          break

        case "ENTRENADORES":
          if (roleId === 1) { // Solo administrador
            privileges = [
              { name: "TRAINER_READ", code: "TRAINER_READ" },
              { name: "TRAINER_CREATE", code: "TRAINER_CREATE" },
              { name: "TRAINER_UPDATE", code: "TRAINER_UPDATE" },
              { name: "TRAINER_DEACTIVATE", code: "TRAINER_DEACTIVATE" },
              { name: "TRAINER_DELETE", code: "TRAINER_DELETE" },
              { name: "TRAINER_SEARCH", code: "TRAINER_SEARCH" },
              { name: "TRAINER_DETAILS", code: "TRAINER_DETAILS" }
            ]
          }
          break
      }

      // Agregar privilegios a la lista
      privileges.forEach((privilegio, privIndex) => {
        this.userPrivileges.push({
          id: permIndex * 20 + privIndex + 1, // Más espacio para privilegios
          nombre: privilegio.name,
          codigo: privilegio.code,
          descripcion: `${privilegio.name} en ${permission.name}`,
          id_permiso: permIndex + 1,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
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
