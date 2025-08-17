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
  ASIST_CLIENT_INFO: 'ASIST_CLIENT_INFO',
  ASIST_CLIENT_STATS: 'ASIST_CLIENT_STATS',
  ASIST_CLIENT_HISTORY: 'ASIST_CLIENT_HISTORY',

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

  // Privilegios de Entrenadores
  TRAINER_READ: 'TRAINER_READ',
  TRAINER_CREATE: 'TRAINER_CREATE',
  TRAINER_UPDATE: 'TRAINER_UPDATE',
  TRAINER_DELETE: 'TRAINER_DELETE',
  TRAINER_ACTIVATE: 'TRAINER_ACTIVATE',
  TRAINER_DEACTIVATE: 'TRAINER_DEACTIVATE',
  TRAINER_SEARCH: 'TRAINER_SEARCH',

  // Privilegios de Membresías
  MEMBERSHIP_READ: 'MEMBERSHIP_READ',
  MEMBERSHIP_SEARCH: 'MEMBERSHIP_SEARCH',
  MEMBERSHIP_CREATE: 'MEMBERSHIP_CREATE',
  MEMBERSHIP_UPDATE: 'MEMBERSHIP_UPDATE',
  MEMBERSHIP_DEACTIVATE: 'MEMBERSHIP_DEACTIVATE',
  MEMBERSHIP_DETAILS: 'MEMBERSHIP_DETAILS',
  MEMBERSHIP_REACTIVATE: 'MEMBERSHIP_REACTIVATE',
  MEMBERSHIP_MY_VIEW: 'MEMBERSHIP_MY_VIEW',
  MEMBERSHIP_MY_HISTORY: 'MEMBERSHIP_MY_HISTORY',
  MEMBERSHIP_MY_BENEFITS: 'MEMBERSHIP_MY_BENEFITS',


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

// Grupos de permisos por rol
export const PERMISSION_GROUPS = {
  ADMIN_PERMISSIONS: [
    PERMISSIONS.ASISTENCIAS,
    PERMISSIONS.CLIENTES,
    PERMISSIONS.CONTRATOS,
    PERMISSIONS.MEMBRESIAS,
    PERMISSIONS.HORARIOS,
    PERMISSIONS.ENTRENADORES,
    PERMISSIONS.USUARIOS,
    PERMISSIONS.SISTEMA
  ],

  TRAINER_PERMISSIONS: [
    PERMISSIONS.ASISTENCIAS,
    PERMISSIONS.CLIENTES,
    PERMISSIONS.HORARIOS
  ],

  CLIENT_PERMISSIONS: [
    PERMISSIONS.ASISTENCIAS,
    PERMISSIONS.CONTRATOS,
    PERMISSIONS.HORARIOS,
    PERMISSIONS.MEMBRESIAS // ✅ Agregado para que los clientes vean "Mi Membresía"
  ],

  BENEFICIARY_PERMISSIONS: [
    PERMISSIONS.ASISTENCIAS,
    PERMISSIONS.CONTRATOS,
    PERMISSIONS.HORARIOS,
    PERMISSIONS.MEMBRESIAS // ✅ Agregado para que los beneficiarios vean "Mi Membresía"
  ]
};

// Grupos de privilegios por rol (mantener los existentes)
export const PRIVILEGE_GROUPS = {
  ADMIN_PRIVILEGES: [
    // Todos los privilegios de asistencias
    PRIVILEGES.ASIST_READ,
    PRIVILEGES.ASIST_SEARCH,
    PRIVILEGES.ASIST_CREATE,
    PRIVILEGES.ASIST_DETAILS,
    PRIVILEGES.ASIST_UPDATE,
    PRIVILEGES.ASIST_DELETE,
    PRIVILEGES.ASIST_STATS,
    PRIVILEGES.ASIST_CLIENT_INFO,
    PRIVILEGES.ASIST_CLIENT_STATS,
    PRIVILEGES.ASIST_CLIENT_HISTORY,
    // Todos los privilegios de clientes
    PRIVILEGES.CLIENT_READ,
    PRIVILEGES.CLIENT_DETAILS,
    PRIVILEGES.CLIENT_SEARCH_DOC,
    PRIVILEGES.CLIENT_CREATE,
    PRIVILEGES.CLIENT_UPDATE,
    PRIVILEGES.CLIENT_DELETE,
    PRIVILEGES.CLIENT_BENEFICIARIES,
    // TODOS los privilegios de contratos
    PRIVILEGES.CONTRACT_READ,
    PRIVILEGES.CONTRACT_SEARCH,
    PRIVILEGES.CONTRACT_CREATE,
    PRIVILEGES.CONTRACT_DETAILS,
    PRIVILEGES.CONTRACT_UPDATE,
    PRIVILEGES.CONTRACT_DELETE,
    PRIVILEGES.CONTRACT_CANCEL,
    PRIVILEGES.CONTRACT_RENEW,
    PRIVILEGES.CONTRACT_HISTORY,
    PRIVILEGES.CONTRACT_ACTIVATE,
    PRIVILEGES.CONTRACT_DEACTIVATE,
    PRIVILEGES.CONTRACT_EXPORT,
    PRIVILEGES.CONTRACT_STATS,
    // Todos los privilegios de membresías
    PRIVILEGES.MEMBERSHIP_READ,
    PRIVILEGES.MEMBERSHIP_SEARCH,
    PRIVILEGES.MEMBERSHIP_CREATE,
    PRIVILEGES.MEMBERSHIP_UPDATE,
    PRIVILEGES.MEMBERSHIP_DEACTIVATE,
    PRIVILEGES.MEMBERSHIP_DETAILS,
    PRIVILEGES.MEMBERSHIP_REACTIVATE,
    // Todos los privilegios de horarios
    PRIVILEGES.SCHEDULE_READ,
    PRIVILEGES.SCHEDULE_DETAILS,
    PRIVILEGES.SCHEDULE_CREATE,
    PRIVILEGES.SCHEDULE_UPDATE,
    PRIVILEGES.SCHEDULE_DELETE,
    PRIVILEGES.SCHEDULE_AVAILABILITY,
    PRIVILEGES.SCHEDULE_CLIENT_VIEW,
    PRIVILEGES.SCHEDULE_TRAINER_VIEW,
    PRIVILEGES.SCHEDULE_DAILY_VIEW,
    PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
    PRIVILEGES.SCHEDULE_MONTHLY_VIEW,
    PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
    PRIVILEGES.SCHEDULE_CLIENTS_ACTIVE,
    // Todos los privilegios de entrenadores
    PRIVILEGES.TRAINER_READ,
    PRIVILEGES.TRAINER_CREATE,
    PRIVILEGES.TRAINER_UPDATE,
    PRIVILEGES.TRAINER_ACTIVATE,
    PRIVILEGES.TRAINER_DEACTIVATE,
    PRIVILEGES.TRAINER_DELETE,
    PRIVILEGES.TRAINER_SEARCH,
    // Usuarios (acceso completo)
    PRIVILEGES.USER_READ,
    PRIVILEGES.USER_SEARCH,
    PRIVILEGES.USER_DETAILS,
    PRIVILEGES.USER_CREATE,
    PRIVILEGES.USER_UPDATE,
    PRIVILEGES.USER_ACTIVATE,
    PRIVILEGES.USER_DEACTIVATE,
    PRIVILEGES.USER_DELETE,
    PRIVILEGES.USER_CHECK_DOCUMENT,
    PRIVILEGES.USER_CHECK_EMAIL,
    PRIVILEGES.USER_VIEW_ROLES,
    PRIVILEGES.USER_ASSIGN_ROLES,
    PRIVILEGES.USER_HISTORY,
    // Privilegios del sistema
    PRIVILEGES.SYSTEM_VIEW_ROLES,
    PRIVILEGES.SYSTEM_CREATE_ROLES,
    PRIVILEGES.SYSTEM_UPDATE_ROLES,
    PRIVILEGES.SYSTEM_DELETE_ROLES,
    PRIVILEGES.SYSTEM_ASSIGN_ROLES,
    PRIVILEGES.SYSTEM_VIEW_PERMISSIONS,
    PRIVILEGES.SYSTEM_CREATE_PERMISSIONS,
    PRIVILEGES.SYSTEM_UPDATE_PERMISSIONS,
    PRIVILEGES.SYSTEM_DELETE_PERMISSIONS,
    PRIVILEGES.SYSTEM_ASSIGN_PERMISSIONS,
    PRIVILEGES.SYSTEM_VIEW_LOGS,
    PRIVILEGES.SYSTEM_BACKUP,
    PRIVILEGES.SYSTEM_RESTORE,
    PRIVILEGES.SYSTEM_MAINTENANCE
  ],

  TRAINER_PRIVILEGES: [
    // Asistencias
    PRIVILEGES.ASIST_READ,
    PRIVILEGES.ASIST_SEARCH,
    PRIVILEGES.ASIST_CREATE,
    PRIVILEGES.ASIST_DETAILS,
    PRIVILEGES.ASIST_STATS,
    // Clientes (solo lectura)
    PRIVILEGES.CLIENT_READ,
    PRIVILEGES.CLIENT_DETAILS,
    PRIVILEGES.CLIENT_SEARCH_DOC,
    PRIVILEGES.CLIENT_BENEFICIARIES,
    // CONTRATOS para entrenadores (solo lectura)
    PRIVILEGES.CONTRACT_READ,
    PRIVILEGES.CONTRACT_SEARCH,
    PRIVILEGES.CONTRACT_DETAILS,
    PRIVILEGES.CONTRACT_HISTORY,
    PRIVILEGES.CONTRACT_STATS,
    // Horarios (gestión completa)
    PRIVILEGES.SCHEDULE_READ,
    PRIVILEGES.SCHEDULE_DETAILS,
    PRIVILEGES.SCHEDULE_CREATE,
    PRIVILEGES.SCHEDULE_UPDATE,
    PRIVILEGES.SCHEDULE_AVAILABILITY,
    PRIVILEGES.SCHEDULE_TRAINER_VIEW,
    PRIVILEGES.SCHEDULE_DAILY_VIEW,
    PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
    PRIVILEGES.SCHEDULE_MONTHLY_VIEW,
    PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE
  ],

  CLIENT_PRIVILEGES: [
    // Asistencias (solo lectura propia)
    PRIVILEGES.ASIST_READ,
    PRIVILEGES.ASIST_DETAILS,
    PRIVILEGES.ASIST_CLIENT_INFO,
    PRIVILEGES.ASIST_CLIENT_STATS,
    PRIVILEGES.ASIST_CLIENT_HISTORY,
    // CONTRATOS para clientes (solo sus propios contratos)
    PRIVILEGES.CONTRACT_READ,
    PRIVILEGES.CONTRACT_DETAILS,
    PRIVILEGES.CONTRACT_HISTORY,
    // ✅ MEMBRESÍAS para clientes (solo sus propias membresías)
    PRIVILEGES.MEMBERSHIP_READ,
    PRIVILEGES.MEMBERSHIP_MY_VIEW,
    PRIVILEGES.MEMBERSHIP_MY_HISTORY,
    PRIVILEGES.MEMBERSHIP_MY_BENEFITS,
    // Horarios (solo consulta)
    PRIVILEGES.SCHEDULE_READ,
    PRIVILEGES.SCHEDULE_DETAILS,
    PRIVILEGES.SCHEDULE_AVAILABILITY,
    PRIVILEGES.SCHEDULE_CLIENT_VIEW,
    PRIVILEGES.SCHEDULE_DAILY_VIEW,
    PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
  ],

  BENEFICIARY_PRIVILEGES: [
    // Mismos privilegios que Cliente
    PRIVILEGES.ASIST_READ,
    PRIVILEGES.ASIST_DETAILS,
    PRIVILEGES.ASIST_CLIENT_INFO,
    PRIVILEGES.ASIST_CLIENT_STATS,
    PRIVILEGES.ASIST_CLIENT_HISTORY,
    // CONTRATOS para clientes (solo sus propios contratos)
    PRIVILEGES.CONTRACT_READ,
    PRIVILEGES.CONTRACT_DETAILS,
    PRIVILEGES.CONTRACT_HISTORY,
    // ✅ MEMBRESÍAS para beneficiarios (solo sus propias membresías)
    PRIVILEGES.MEMBERSHIP_READ,
    PRIVILEGES.MEMBERSHIP_MY_VIEW,
    PRIVILEGES.MEMBERSHIP_MY_HISTORY,
    PRIVILEGES.MEMBERSHIP_MY_BENEFITS,
    // Horarios (solo consulta)
    PRIVILEGES.SCHEDULE_READ,
    PRIVILEGES.SCHEDULE_DETAILS,
    PRIVILEGES.SCHEDULE_AVAILABILITY,
    PRIVILEGES.SCHEDULE_CLIENT_VIEW,
    PRIVILEGES.SCHEDULE_TRAINER_VIEW,
    PRIVILEGES.SCHEDULE_DAILY_VIEW,
    PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
    PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
  ]
};

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

// ✅ NUEVO: Tipo para callbacks de cambios
type PermissionChangeCallback = () => void;

class PermissionService {
  private userPermissions: Permission[] = []
  private userPrivileges: Privilege[] = []
  private isInitialized = false
  private currentUserId: number | null = null
  private isLoading = false
  private lastError: string | null = null

  // ✅ NUEVO: Sistema de listeners para reactividad
  private changeListeners: PermissionChangeCallback[] = []
  private lastPermissionsHash: string = ''
  private pollInterval: NodeJS.Timeout | null = null

  // ✅ MAPEO SIMPLIFICADO
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

  // ✅ NUEVO: Gestión de listeners para reactividad
  addChangeListener(callback: PermissionChangeCallback): void {
    this.changeListeners.push(callback)
    console.log('📡 Listener agregado, total:', this.changeListeners.length)
  }

  removeChangeListener(callback: PermissionChangeCallback): void {
    const index = this.changeListeners.indexOf(callback)
    if (index > -1) {
      this.changeListeners.splice(index, 1)
      console.log('📡 Listener removido, total:', this.changeListeners.length)
    }
  }

  // ✅ NUEVO: Notificar cambios a todos los listeners
  private notifyChange(): void {
    console.log('📢 Notificando cambios a', this.changeListeners.length, 'listeners')
    this.changeListeners.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('❌ Error en listener de permisos:', error)
      }
    })
  }

  // ✅ NUEVO: Obtener permisos del servidor (para comparación)
  async fetchUserPermissions(roleId: number): Promise<string[]> {
    try {
      const response = await api.get<{ data?: string[] }>(`/auth/permissions/${roleId}`)
      return response.data.data || []
    } catch (error) {
      console.error('❌ Error al obtener permisos del servidor:', error)
      throw error
    }
  }

  // ✅ NUEVO: Inicializar permisos (método público para el hook)
  async initializePermissions(roleId: number): Promise<void> {
    try {
      console.log('🚀 Inicializando permisos para rol:', roleId)
      
      this.isLoading = true
      this.lastError = null
      
      // Obtener permisos usando el método existente pero con roleId
      await this.getUserPermissionsByRole(roleId)
      
      // Calcular hash de permisos para detectar cambios
      this.updatePermissionsHash()
      
      // Iniciar polling si no está activo
      this.startPermissionsPolling()
      
      // Notificar cambios
      this.notifyChange()
      
      console.log('✅ Permisos inicializados correctamente')
    } catch (error) {
      console.error('❌ Error al inicializar permisos:', error)
      this.lastError = error instanceof Error ? error.message : 'Error desconocido'
      this.isLoading = false
      throw error
    }
  }

  // ✅ NUEVO: Método para obtener permisos por rol (separado del original)
  private async getUserPermissionsByRole(roleId: number): Promise<void> {
    try {
      console.log("🔄 Obteniendo permisos para rol:", roleId)

      this.currentUserId = this.currentUserId || 1 // Usar ID actual o temporal

      // ✅ APLICAR PERMISOS BASADOS EN GRUPOS (FRONTEND)
      let permissions: PermissionName[] = []
      let privileges: PrivilegeName[] = []

      switch (roleId) {
        case 1: // ADMIN
          permissions = PERMISSION_GROUPS.ADMIN_PERMISSIONS
          privileges = PRIVILEGE_GROUPS.ADMIN_PRIVILEGES
          break
        case 2: // TRAINER
          permissions = PERMISSION_GROUPS.TRAINER_PERMISSIONS
          privileges = PRIVILEGE_GROUPS.TRAINER_PRIVILEGES
          break
        case 3: // CLIENT
          permissions = PERMISSION_GROUPS.CLIENT_PERMISSIONS
          privileges = PRIVILEGE_GROUPS.CLIENT_PRIVILEGES
          break
        case 4: // BENEFICIARY
          permissions = PERMISSION_GROUPS.BENEFICIARY_PERMISSIONS
          privileges = PRIVILEGE_GROUPS.BENEFICIARY_PRIVILEGES
          break
        default:
          console.warn("⚠️ Rol desconocido:", roleId)
          permissions = []
          privileges = []
          break
      }

      // ✅ MAPEAR A OBJETOS PERMISSION/PRIVILEGE
      this.userPermissions = permissions.map((permissionCode, index) => ({
        id: index + 1,
        codigo: permissionCode,
        nombre: permissionCode,
        estado: true,
        descripcion: `Permiso para ${permissionCode}`,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      } as Permission))

      this.userPrivileges = privileges.map((privilegeCode, index) => ({
        id: index + 1,
        codigo: privilegeCode,
        nombre: privilegeCode,
        id_permiso: Math.floor(index / 10) + 1,
        descripcion: `Privilegio para ${privilegeCode}`,
        fecha_creacion: new Date(),
      } as Privilege))

      console.log("✅ Permisos aplicados:", this.userPermissions.length)
      console.log("🔑 Privilegios aplicados:", this.userPrivileges.length)

      this.isInitialized = true
      this.isLoading = false

    } catch (error) {
      console.error("❌ Error al obtener permisos por rol:", error)
      this.isLoading = false
      this.lastError = error instanceof Error ? error.message : "Error desconocido"
      throw error
    }
  }

  // ✅ NUEVO: Actualizar hash de permisos para detectar cambios
  private updatePermissionsHash(): void {
    const permissionsData = {
      permissions: this.userPermissions.map(p => ({ id: p.id, codigo: p.codigo, estado: p.estado })),
      privileges: this.userPrivileges.map(p => ({ id: p.id, codigo: p.codigo }))
    }
    this.lastPermissionsHash = JSON.stringify(permissionsData)
  }

  // ✅ NUEVO: Verificar si los permisos han cambiado
  private hasPermissionsChanged(): boolean {
    const currentHash = JSON.stringify({
      permissions: this.userPermissions.map(p => ({ id: p.id, codigo: p.codigo, estado: p.estado })),
      privileges: this.userPrivileges.map(p => ({ id: p.id, codigo: p.codigo }))
    })
    
    const changed = currentHash !== this.lastPermissionsHash
    if (changed) {
      console.log('🔄 Detectados cambios en permisos')
      this.lastPermissionsHash = currentHash
    }
    
    return changed
  }

  // ✅ NUEVO: Iniciar polling para detectar cambios
  private startPermissionsPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    // Polling cada 30 segundos para detectar cambios
    this.pollInterval = setInterval(async () => {
      if (!this.currentUserId || !this.isInitialized) return

      try {
        // Simular verificación de cambios (puedes implementar llamada al backend aquí)
        const shouldRefresh = Math.random() < 0.1 // 10% probabilidad para testing
        
        if (shouldRefresh && this.hasPermissionsChanged()) {
          console.log('🔄 Polling detectó cambios, notificando...')
          this.notifyChange()
        }
      } catch (error) {
        console.error('❌ Error en polling de permisos:', error)
      }
    }, 30000) // 30 segundos
  }

  // ✅ NUEVO: Detener polling
  private stopPermissionsPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
      console.log('⏹️ Polling de permisos detenido')
    }
  }

  // ✅ MÉTODO ORIGINAL ACTUALIZADO
  async getUserPermissions(userId?: number): Promise<void> {
    try {
      this.isLoading = true
      this.lastError = null

      console.log("🔄 Obteniendo permisos del usuario desde backend...", userId)

      if (userId) {
        this.currentUserId = userId
      }

      // ✅ USAR EL ENDPOINT CORRECTO DEL BACKEND
      const response = await api.get<UserPermissionsResponse>("/auth/profile")

      console.log("📡 Respuesta del servidor:", response.status)
      console.log("📦 Datos recibidos:", response.data)

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
        this.isLoading = false
        return
      }

      // Usar el nuevo método para obtener permisos por rol
      await this.getUserPermissionsByRole(user.id_rol)
      
      // Actualizar hash y notificar cambios
      this.updatePermissionsHash()
      this.notifyChange()

    } catch (error) {
      console.error("❌ Error al obtener permisos del backend:", error)
      this.isLoading = false
      this.lastError = error instanceof Error ? error.message : "Error desconocido"

      if (!this.currentUserId) {
        console.error("❌ No se puede aplicar fallback sin usuario autenticado")
        this.userPermissions = []
        this.userPrivileges = []
        this.isInitialized = false
        throw new Error("No se pueden cargar permisos sin usuario autenticado")
      }

      console.log("🔧 Error en backend, usando permisos vacíos")
      this.userPermissions = []
      this.userPrivileges = []
      this.isInitialized = true

      throw error
    }
  }

  // ✅ MÉTODOS DE ESTADO (existentes)
  getLoadingState(): boolean {
    return this.isLoading
  }

  getLastError(): string | null {
    return this.lastError
  }

  isReady(): boolean {
    return this.isInitialized && !this.isLoading
  }

  // ✅ MÉTODOS DE VERIFICACIÓN (existentes)
  hasModuleAccess(moduleName: PermissionName): boolean {
    if (!this.isInitialized) {
      console.log(`⏳ Permisos no inicializados para ${moduleName}`)
      return false
    }

    if (!this.currentUserId) {
      console.log(`🚫 Sin usuario autenticado para verificar acceso a ${moduleName}`)
      return false
    }

    const hasPermission = this.userPermissions.some(
      (permission) => permission.codigo === moduleName && permission.estado,
    )

    console.log(`🔍 Usuario ${this.currentUserId} verificando acceso a "${moduleName}":`, hasPermission)

    return hasPermission
  }

  hasPrivilege(moduleName: PermissionName, privilegeName: PrivilegeName): boolean {
    if (!this.isInitialized) {
      console.log(`⏳ Permisos no inicializados para ${privilegeName} en ${moduleName}`)
      return false
    }

    if (!this.currentUserId) {
      console.log(`🚫 Sin usuario autenticado para verificar privilegio ${privilegeName} en ${moduleName}`)
      return false
    }

    if (!this.hasModuleAccess(moduleName)) {
      return false
    }

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

  // ✅ NUEVO: Método reactivo para obtener módulos accesibles
  getAccessibleModules(): PermissionName[] {
    if (!this.isInitialized) {
      console.log("⏳ getAccessibleModules: Permisos no inicializados")
      return []
    }

    if (!this.currentUserId) {
      console.log("🚫 getAccessibleModules: Sin usuario autenticado")
      return []
    }

    const accessibleModules = Object.keys(this.PERMISSION_MODULE_MAP)
      .filter(moduleName => this.hasModuleAccess(moduleName as PermissionName))
      .map(moduleName => moduleName as PermissionName)

    console.log('📋 Módulos accesibles:', accessibleModules)
    
    return accessibleModules
  }

  getUserPermissionsList(): string[] {
    return this.userPermissions.filter((permission) => permission.estado).map((permission) => permission.codigo)
  }

  // ✅ MÉTODO ACTUALIZADO: Limpiar permisos y detener polling
  clearPermissions(): void {
    this.userPermissions = []
    this.userPrivileges = []
    this.isInitialized = false
    this.currentUserId = null
    this.lastPermissionsHash = ''
    
    // Detener polling
    this.stopPermissionsPolling()
    
    // Limpiar listeners
    this.changeListeners = []
    
    console.log("🧹 Permisos y listeners limpiados")
  }

  // ✅ MÉTODO ACTUALIZADO: Inicializar con ID de usuario
  async initializeWithUserId(userId: number): Promise<void> {
    if (!userId || userId <= 0) {
      throw new Error("ID de usuario válido requerido para inicializar permisos")
    }

    console.log("🚀 Inicializando permisos para usuario autenticado:", userId)
    this.currentUserId = userId
    await this.getUserPermissions(userId)
  }

  // ✅ NUEVO: Método para refrescar permisos manualmente
  async refreshPermissions(): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('No hay usuario autenticado para refrescar permisos')
    }

    console.log('🔄 Refrescando permisos manualmente...')
    await this.getUserPermissions(this.currentUserId)
  }

  // ✅ NUEVO: Método para debugging
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      lastError: this.lastError,
      currentUserId: this.currentUserId,
      permissionsCount: this.userPermissions.length,
      privilegesCount: this.userPrivileges.length,
      listenersCount: this.changeListeners.length,
      hasPolling: !!this.pollInterval,
      lastPermissionsHash: this.lastPermissionsHash.substring(0, 50) + '...'
    }
  }
}

export const permissionService = new PermissionService()
