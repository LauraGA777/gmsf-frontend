import { useAuth } from "@/shared/contexts/authContext"
import { permissionService, type PermissionName, type PrivilegeName } from "@/shared/services/permissionService"

export function usePermissions() {
    const { isAuthenticated, user, isInitialized } = useAuth()
    
    // ✅ NUEVOS ESTADOS DE CARGA
    const isLoading = permissionService.getLoadingState()
    const lastError = permissionService.getLastError()
    const isReady = permissionService.isReady()

    const hasModuleAccess = (moduleName: PermissionName): boolean => {
        // 🔒 SEGURIDAD: Usuario debe estar autenticado
        if (!isAuthenticated || !user) {
            console.log(`🚫 Acceso denegado a ${moduleName}: usuario no autenticado`)
            return false
        }

        // 🔒 SEGURIDAD: Usuario debe tener rol válido
        if (!user.id_rol) {
            console.log(`🚫 Acceso denegado a ${moduleName}: usuario sin rol`)
            return false
        }

        // 🔒 SEGURIDAD: Aplicación debe estar inicializada Y lista
        if (!isReady) {
            console.log(`🚫 Acceso denegado a ${moduleName}: aplicación inicializando o cargando permisos`)
            return false
        }

        // Verificar usando el servicio de permisos
        return permissionService.hasModuleAccess(moduleName)
    }

    const hasPrivilege = (moduleName: PermissionName, privilegeName: PrivilegeName): boolean => {
        // 🔒 SEGURIDAD: Verificaciones básicas
        if (!isAuthenticated || !user || !user.id_rol || !isReady) {
            return false
        }

        return permissionService.hasPrivilege(moduleName, privilegeName)
    }

    const hasAnyPrivilege = (moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        if (!isAuthenticated || !user || !user.id_rol || !isReady) {
            return false
        }

        return permissionService.hasAnyPrivilege(moduleName, privileges)
    }

    const hasAllPrivileges = (moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        if (!isAuthenticated || !user || !user.id_rol || !isReady) {
            return false
        }

        return permissionService.hasAllPrivileges(moduleName, privileges)
    }

    return {
        hasModuleAccess,
        hasPrivilege,
        hasAnyPrivilege,
        hasAllPrivileges,
        isLoading, // ✅ NUEVO: Estado de carga de permisos
        isReady,   // ✅ NUEVO: Si los permisos están listos
        lastError, // ✅ NUEVO: Último error de permisos
        // Métodos adicionales
        getAccessibleModules: () => isReady ? permissionService.getAccessibleModules() : [],
        getUserPermissions: () => isReady ? permissionService.getUserPermissionsList() : [],
    }
}
