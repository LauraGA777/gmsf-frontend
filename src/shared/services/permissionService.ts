import { api } from "./api"

// ✅ SINCRONIZADO CON EL BACKEND - permissions.ts
export const PERMISSIONS = {
    // Módulos principales
    ASISTENCIAS: 'ASISTENCIAS',
    CLIENTES: 'CLIENTES',
    CONTRATOS: 'CONTRATOS',
    MEMBRESIAS: 'MEMBRESIAS',
    HORARIOS: 'HORARIOS',
    ENTRENADORES: 'ENTRENADORES',
    USUARIOS: 'USUARIOS',
    SISTEMA: 'SISTEMA',  

    // Permisos granulares para las rutas (mapean a módulos)
    // Asistencias
    REGISTER_ATTENDANCE: 'ASISTENCIAS',
    VIEW_ATTENDANCE: 'ASISTENCIAS',
    MANAGE_ATTENDANCE: 'ASISTENCIAS',

    // CONTRATOS 
    VIEW_CONTRACTS: 'CONTRATOS',
    CREATE_CONTRACTS: 'CONTRATOS',
    UPDATE_CONTRACTS: 'CONTRATOS',
    CANCEL_CONTRACTS: 'CONTRATOS',
    RENEW_CONTRACTS: 'CONTRATOS',
    MANAGE_CONTRACTS: 'CONTRATOS',

    // Clientes
    VIEW_CLIENTS: 'CLIENTES',
    CREATE_CLIENTS: 'CLIENTES',
    UPDATE_CLIENTS: 'CLIENTES',
    MANAGE_CLIENTS: 'CLIENTES',

    // Membresías
    VIEW_MEMBERSHIPS: 'MEMBRESIAS',
    CREATE_MEMBERSHIPS: 'MEMBRESIAS',
    UPDATE_MEMBERSHIPS: 'MEMBRESIAS',
    MANAGE_MEMBERSHIPS: 'MEMBRESIAS',

    // Horarios
    VIEW_SCHEDULES: 'HORARIOS',
    CREATE_SCHEDULES: 'HORARIOS',
    UPDATE_SCHEDULES: 'HORARIOS',
    MANAGE_SCHEDULES: 'HORARIOS',

    // Entrenadores
    VIEW_TRAINERS: 'ENTRENADORES',
    CREATE_TRAINERS: 'ENTRENADORES',
    UPDATE_TRAINERS: 'ENTRENADORES',
    MANAGE_TRAINERS: 'ENTRENADORES',

    // Usuarios
    VIEW_USERS: 'USUARIOS',
    CREATE_USERS: 'USUARIOS',
    UPDATE_USERS: 'USUARIOS',
    ACTIVATE_USERS: 'USUARIOS',
    DEACTIVATE_USERS: 'USUARIOS',
    DELETE_USERS: 'USUARIOS',
    MANAGE_USERS: 'USUARIOS',

    // Sistema (para roles y permisos)
    VIEW_ROLES: 'SISTEMA',
    MANAGE_ROLES: 'SISTEMA',
    ASSIGN_PERMISSIONS: 'SISTEMA',
    VIEW_PERMISSIONS: 'SISTEMA',
    MANAGE_PERMISSIONS: 'SISTEMA',
} as const;

// ✅ SINCRONIZADO CON EL BACKEND - permissions.ts
export const PRIVILEGES = {
    // Privilegios de Asistencias
    ASIST_READ: 'ASIST_READ',
    ASIST_SEARCH: 'ASIST_SEARCH',
    ASIST_CREATE: 'ASIST_CREATE',
    ASIST_DETAILS: 'ASIST_DETAILS',
    ASIST_UPDATE: 'ASIST_UPDATE',
    ASIST_DELETE: 'ASIST_DELETE',
    ASIST_STATS: 'ASIST_STATS',
    
    // Privilegios de Clientes
    CLIENT_READ: 'CLIENT_READ',
    CLIENT_DETAILS: 'CLIENT_DETAILS',
    CLIENT_SEARCH_DOC: 'CLIENT_SEARCH_DOC',
    CLIENT_CREATE: 'CLIENT_CREATE',
    CLIENT_UPDATE: 'CLIENT_UPDATE',
    CLIENT_DELETE: 'CLIENT_DELETE',
    CLIENT_BENEFICIARIES: 'CLIENT_BENEFICIARIES',

    // Privilegios de Contratos
    CONTRACT_READ: 'CONTRACT_READ',
    CONTRACT_SEARCH: 'CONTRACT_SEARCH',
    CONTRACT_CREATE: 'CONTRACT_CREATE',
    CONTRACT_DETAILS: 'CONTRACT_DETAILS',
    CONTRACT_UPDATE: 'CONTRACT_UPDATE',
    CONTRACT_DELETE: 'CONTRACT_DELETE',
    CONTRACT_CANCEL: 'CONTRACT_CANCEL',
    CONTRACT_RENEW: 'CONTRACT_RENEW',
    CONTRACT_HISTORY: 'CONTRACT_HISTORY',
    CONTRACT_ACTIVATE: 'CONTRACT_ACTIVATE',
    CONTRACT_DEACTIVATE: 'CONTRACT_DEACTIVATE',
    CONTRACT_EXPORT: 'CONTRACT_EXPORT',
    CONTRACT_STATS: 'CONTRACT_STATS',
    
    // Privilegios de Membresías
    MEMBERSHIP_READ: 'MEMBERSHIP_READ',
    MEMBERSHIP_SEARCH: 'MEMBERSHIP_SEARCH',
    MEMBERSHIP_CREATE: 'MEMBERSHIP_CREATE',
    MEMBERSHIP_UPDATE: 'MEMBERSHIP_UPDATE',
    MEMBERSHIP_DEACTIVATE: 'MEMBERSHIP_DEACTIVATE',
    MEMBERSHIP_DETAILS: 'MEMBERSHIP_DETAILS',
    MEMBERSHIP_REACTIVATE: 'MEMBERSHIP_REACTIVATE',
    
    // Privilegios de Horarios
    SCHEDULE_READ: 'SCHEDULE_READ',
    SCHEDULE_DETAILS: 'SCHEDULE_DETAILS',
    SCHEDULE_CREATE: 'SCHEDULE_CREATE',
    SCHEDULE_UPDATE: 'SCHEDULE_UPDATE',
    SCHEDULE_DELETE: 'SCHEDULE_DELETE',
    SCHEDULE_AVAILABILITY: 'SCHEDULE_AVAILABILITY',
    SCHEDULE_CLIENT_VIEW: 'SCHEDULE_CLIENT_VIEW',
    SCHEDULE_TRAINER_VIEW: 'SCHEDULE_TRAINER_VIEW',
    SCHEDULE_DAILY_VIEW: 'SCHEDULE_DAILY_VIEW',
    SCHEDULE_WEEKLY_VIEW: 'SCHEDULE_WEEKLY_VIEW',
    SCHEDULE_MONTHLY_VIEW: 'SCHEDULE_MONTHLY_VIEW',
    SCHEDULE_TRAINERS_ACTIVE: 'SCHEDULE_TRAINERS_ACTIVE',
    SCHEDULE_CLIENTS_ACTIVE: 'SCHEDULE_CLIENTS_ACTIVE',
    
    // Privilegios de Entrenadores
    TRAINER_READ: 'TRAINER_READ',
    TRAINER_CREATE: 'TRAINER_CREATE',
    TRAINER_UPDATE: 'TRAINER_UPDATE',
    TRAINER_DEACTIVATE: 'TRAINER_DEACTIVATE',
    TRAINER_DELETE: 'TRAINER_DELETE',
    TRAINER_SEARCH: 'TRAINER_SEARCH',
    TRAINER_DETAILS: 'TRAINER_DETAILS',

    // Privilegios de Usuarios
    USER_READ: 'USER_READ',
    USER_SEARCH: 'USER_SEARCH', 
    USER_DETAILS: 'USER_DETAILS',
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    USER_ACTIVATE: 'USER_ACTIVATE',
    USER_DEACTIVATE: 'USER_DEACTIVATE',
    USER_DELETE: 'USER_DELETE',
    USER_CHECK_DOCUMENT: 'USER_CHECK_DOCUMENT',
    USER_CHECK_EMAIL: 'USER_CHECK_EMAIL',
    USER_VIEW_ROLES: 'USER_VIEW_ROLES',
    USER_ASSIGN_ROLES: 'USER_ASSIGN_ROLES',
    USER_HISTORY: 'USER_HISTORY',

    // Privilegios del Sistema
    SYSTEM_VIEW_ROLES: 'SYSTEM_VIEW_ROLES',
    SYSTEM_CREATE_ROLES: 'SYSTEM_CREATE_ROLES',
    SYSTEM_UPDATE_ROLES: 'SYSTEM_UPDATE_ROLES',
    SYSTEM_DELETE_ROLES: 'SYSTEM_DELETE_ROLES',
    SYSTEM_ASSIGN_ROLES: 'SYSTEM_ASSIGN_ROLES',
    SYSTEM_VIEW_PERMISSIONS: 'SYSTEM_VIEW_PERMISSIONS',
    SYSTEM_CREATE_PERMISSIONS: 'SYSTEM_CREATE_PERMISSIONS',
    SYSTEM_UPDATE_PERMISSIONS: 'SYSTEM_UPDATE_PERMISSIONS',
    SYSTEM_DELETE_PERMISSIONS: 'SYSTEM_DELETE_PERMISSIONS',
    SYSTEM_ASSIGN_PERMISSIONS: 'SYSTEM_ASSIGN_PERMISSIONS',
    SYSTEM_VIEW_LOGS: 'SYSTEM_VIEW_LOGS',
    SYSTEM_BACKUP: 'SYSTEM_BACKUP',
    SYSTEM_RESTORE: 'SYSTEM_RESTORE',
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type PrivilegeName = typeof PRIVILEGES[keyof typeof PRIVILEGES];

// ✅ INTERFACES SINCRONIZADAS CON EL BACKEND
interface Permission {
  id: number
  nombre: string
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
  nombre: string
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
  private isLoading = false // ✅ NUEVO: Estado de carga
  private lastError: string | null = null // ✅ NUEVO: Último error

  // ✅ MAPEO SIMPLIFICADO - ELIMINAMOS FALLBACKS COMPLEJOS
  public readonly PERMISSION_MODULE_MAP = {
    "ASISTENCIAS": {
      route: "/attendance",
      component: "Attendance"
    },
    "CLIENTES": {
      route: "/clients",
      component: "Clients"
    },
    "CONTRATOS": {
      route: "/contracts",
      component: "Contracts"
    },
    "MEMBRESIAS": {
      route: "/memberships",
      component: "Memberships"
    },
    "HORARIOS": {
      route: "/schedule",
      component: "Schedule"
    },
    "ENTRENADORES": {
      route: "/trainers",
      component: "Trainers"
    },
    "USUARIOS": {
      route: "/users",
      component: "Users"
    },
    "SISTEMA": {
      route: "/roles",
      component: "System"
    },
  }

  async getUserPermissions(userId?: number): Promise<void> {
    try {
      this.isLoading = true // ✅ Iniciar carga
      this.lastError = null // ✅ Limpiar errores previos
      
      console.log("🔄 Obteniendo permisos del usuario desde backend...", userId)

      if (userId) {
        this.currentUserId = userId
      }

      // ✅ USAR EL ENDPOINT CORRECTO DEL BACKEND
      const response = await api.get<UserPermissionsResponse>("/auth/profile")

      console.log("📡 Respuesta del servidor:", response.status)
      console.log("📦 Datos recibidos:", response.data)

      // ✅ VERIFICAR FORMATO JSON (NO HTML)
      if (typeof response.data === 'string' && (response.data as string).includes('<!doctype html>')) {
        console.error("❌ API devolvió HTML en lugar de JSON - problema de configuración")
        throw new Error("Error de configuración: API devuelve HTML en lugar de JSON")
      }

      if (response.data.status !== "success") {
        console.warn("⚠️ Respuesta del servidor no exitosa")
        throw new Error("Error al obtener permisos del usuario")
      }

      const user = response.data.data.usuario
      console.log("👤 Usuario recibido del backend:", user)
      console.log("🎭 Rol del usuario:", user.rol)

      if (!user.rol) {
        console.warn("⚠️ Usuario sin rol asignado")
        this.userPermissions = []
        this.userPrivileges = []
        this.isInitialized = true
        this.isLoading = false // ✅ Finalizar carga
        return
      }

      // ✅ USAR DATOS REALES DEL BACKEND (SIN FALLBACKS)
      this.userPermissions = user.rol.permisos || []
      this.userPrivileges = user.rol.privilegios || []

      console.log("✅ Permisos extraídos del backend:", this.userPermissions)
      console.log("🔑 Privilegios extraídos del backend:", this.userPrivileges)

      this.isInitialized = true
      this.isLoading = false // ✅ Finalizar carga exitosa
      
    } catch (error) {
      console.error("❌ Error al obtener permisos del backend:", error)
      this.isLoading = false // ✅ Finalizar carga con error
      this.lastError = error instanceof Error ? error.message : "Error desconocido"

      // 🔒 SEGURIDAD: Solo aplicar fallback si tenemos un usuario válido
      if (!this.currentUserId) {
        console.error("❌ No se puede aplicar fallback sin usuario autenticado")
        this.userPermissions = []
        this.userPrivileges = []
        this.isInitialized = false
        throw new Error("No se pueden cargar permisos sin usuario autenticado")
      }

      // ✅ SIN FALLBACKS COMPLEJOS - USAR DATOS VACÍOS
      console.log("🔧 Error en backend, usando permisos vacíos")
      this.userPermissions = []
      this.userPrivileges = []
      this.isInitialized = true
      
      throw error // Re-lanzar para que el AuthContext maneje el error
    }
  }

  // ✅ NUEVOS MÉTODOS PARA ESTADOS
  getLoadingState(): boolean {
    return this.isLoading
  }

  getLastError(): string | null {
    return this.lastError
  }

  isReady(): boolean {
    return this.isInitialized && !this.isLoading
  }

  hasModuleAccess(moduleName: PermissionName): boolean {
    // 🔒 SEGURIDAD: Verificar inicialización
    if (!this.isInitialized) {
      console.log(`⏳ Permisos no inicializados para ${moduleName}`)
      return false
    }

    // 🔒 SEGURIDAD: Verificar que hay usuario autenticado
    if (!this.currentUserId) {
      console.log(`🚫 Sin usuario autenticado para verificar acceso a ${moduleName}`)
      return false
    }

    // ✅ VERIFICAR EN LOS PERMISOS REALES DEL BACKEND
    const hasPermission = this.userPermissions.some(
      (permission) => permission.codigo === moduleName && permission.estado,
    )

    console.log(`🔍 Usuario ${this.currentUserId} verificando acceso a "${moduleName}":`, hasPermission)
    
    return hasPermission
  }

  hasPrivilege(moduleName: PermissionName, privilegeName: PrivilegeName): boolean {
    // 🔒 SEGURIDAD: Verificaciones básicas
    if (!this.isInitialized) {
      console.log(`⏳ Permisos no inicializados para ${privilegeName} en ${moduleName}`)
      return false
    }

    if (!this.currentUserId) {
      console.log(`🚫 Sin usuario autenticado para verificar privilegio ${privilegeName} en ${moduleName}`)
      return false
    }

    // Primero verificar si tiene acceso al módulo
    if (!this.hasModuleAccess(moduleName)) {
      return false
    }

    // ✅ VERIFICAR EN LOS PRIVILEGIOS REALES DEL BACKEND
    const hasPrivilege = this.userPrivileges.some(
      (privilege) => privilege.codigo === privilegeName,
    )

    console.log(`🔑 Usuario ${this.currentUserId} verificando privilegio "${privilegeName}" para "${moduleName}":`, hasPrivilege)

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
  }> {
    // 🔒 SEGURIDAD: Verificaciones básicas
    if (!this.isInitialized) {
      console.log("⏳ getAccessibleModules: Permisos no inicializados")
      return []
    }

    if (!this.currentUserId) {
      console.log("🚫 getAccessibleModules: Sin usuario autenticado")
      return []
    }

    return Object.entries(this.PERMISSION_MODULE_MAP)
      .filter(([moduleName]) => this.hasModuleAccess(moduleName as PermissionName))
      .map(([moduleName, config]) => ({
        name: moduleName as PermissionName,
        route: config.route,
        component: config.component
      }))
  }

  getUserPermissionsList(): string[] {
    return this.userPermissions.filter((permission) => permission.estado).map((permission) => permission.codigo)
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
    if (!userId || userId <= 0) {
      throw new Error("ID de usuario válido requerido para inicializar permisos")
    }
    
    console.log("🚀 Inicializando permisos para usuario autenticado:", userId)
    this.currentUserId = userId
    await this.getUserPermissions(userId)
  }

  // Método de debugging para inspeccionar permisos
  debugPermissions(): void {
    console.log("🔍 === DEBUG DE PERMISOS DEL USUARIO ===")
    console.log("========================================")
    
    console.log("📊 Estado del servicio:")
    console.log(`  - Inicializado: ${this.isInitialized}`)
    console.log(`  - Cargando: ${this.isLoading}`)
    console.log(`  - Usuario actual: ${this.currentUserId}`)
    console.log(`  - Último error: ${this.lastError || "Ninguno"}`)
    
    console.log("🎭 Permisos del usuario:")
    console.log(`  - Total permisos: ${this.userPermissions.length}`)
    this.userPermissions.forEach((permission, index) => {
      console.log(`  ${index + 1}. ${permission.nombre} (${permission.codigo})`)
    })
    
    console.log("🔑 Privilegios del usuario:")
    console.log(`  - Total privilegios: ${this.userPrivileges.length}`)
    this.userPrivileges.forEach((privilege, index) => {
      console.log(`  ${index + 1}. ${privilege.nombre} (${privilege.codigo})`)
    })
    
    console.log("🎯 Verificaciones específicas:")
    const testModules = ['SISTEMA', 'USUARIOS', 'CLIENTES', 'CONTRATOS', 'MEMBRESIAS', 'ASISTENCIAS', 'HORARIOS', 'ENTRENADORES']
    testModules.forEach(module => {
      const hasAccess = this.hasModuleAccess(module as PermissionName)
      console.log(`  - ${module}: ${hasAccess ? '✅ SÍ' : '❌ NO'}`)
    })
    
    console.log("========================================")
  }
  debugModuleAccess(moduleName: PermissionName): boolean {
    console.log(`🔍 === DEBUG ACCESO A MÓDULO: ${moduleName} ===`)
    
    if (!this.isInitialized) {
      console.log(`❌ Permisos no inicializados`)
      return false
    }

    if (!this.currentUserId) {
      console.log(`❌ Sin usuario autenticado`)
      return false
    }

    console.log(`👤 Usuario ID: ${this.currentUserId}`)
    console.log(`📋 Permisos disponibles: ${this.userPermissions.length}`)
    
    // Buscar permiso exacto
    const exactPermission = this.userPermissions.find(p => p.codigo === moduleName)
    if (exactPermission) {
      console.log(`✅ Permiso encontrado: ${exactPermission.nombre} (${exactPermission.codigo})`)
      return true
    }

    // Buscar por nombre
    const namePermission = this.userPermissions.find(p => p.nombre === moduleName)
    if (namePermission) {
      console.log(`✅ Permiso encontrado por nombre: ${namePermission.nombre} (${namePermission.codigo})`)
      return true
    }

    console.log(`❌ Permiso "${moduleName}" NO encontrado`)
    console.log(`📝 Permisos disponibles:`)
    this.userPermissions.forEach(p => {
      console.log(`   - ${p.nombre} (${p.codigo})`)
    })
    
    return false
  }
}

export const permissionService = new PermissionService()
