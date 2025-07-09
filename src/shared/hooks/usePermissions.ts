import { useState, useEffect } from "react"
import { permissionService, type PermissionName, type PrivilegeName } from "@/shared/services/permissionService"
import { useAuth } from "@/shared/contexts/authContext"

export function usePermissions() {
    const [isLoading, setIsLoading] = useState(false) // Cambiar a false por defecto
    const [error] = useState<string | null>(null) // Mantener para compatibilidad
    const { user, isAuthenticated, isInitialized } = useAuth()

    // ❌ REMOVIDO: No más carga automática de permisos aquí
    // La carga de permisos debe ser manejada exclusivamente por el AuthContext
    // cuando el usuario se autentica correctamente

    // Solo configurar el estado de carga basado en la autenticación
    useEffect(() => {
        if (!isInitialized) {
            setIsLoading(true)
            return
        }

        setIsLoading(false)
        
        if (!isAuthenticated || !user) {
            // Usuario no autenticado: limpiar cualquier permiso residual
            console.log("🚫 Usuario no autenticado, limpiando permisos...")
            // No necesitamos hacer nada aquí, los métodos ya verifican autenticación
        } else {
            console.log("� Usuario autenticado, permisos disponibles:", user.id_rol)
        }
    }, [isAuthenticated, user, isInitialized])

    const hasModuleAccess = (moduleName: PermissionName): boolean => {
        // 🔒 SEGURIDAD: Usuario debe estar autenticado
        if (!isAuthenticated || !user) {
            console.log(`� Acceso denegado a ${moduleName}: usuario no autenticado`)
            return false
        }

        // 🔒 SEGURIDAD: Usuario debe tener rol válido
        if (!user.id_rol) {
            console.log(`� Acceso denegado a ${moduleName}: usuario sin rol`)
            return false
        }

        // 🔒 SEGURIDAD: Aplicación debe estar inicializada
        if (!isInitialized) {
            console.log(`🚫 Acceso denegado a ${moduleName}: aplicación inicializando`)
            return false
        }

        // Verificar usando el servicio de permisos
        const hasAccess = permissionService.hasModuleAccess(moduleName)
        
        console.log(`🔍 Verificando acceso de usuario ${user.id} (rol: ${user.id_rol}) a ${moduleName}: ${hasAccess}`)

        return hasAccess
    }

    const hasPrivilege = (moduleName: PermissionName, privilegeName: PrivilegeName): boolean => {
        // 🔒 SEGURIDAD: Verificaciones básicas
        if (!isAuthenticated || !user || !user.id_rol || !isInitialized) {
            console.log(`🚫 Privilegio ${privilegeName} en ${moduleName} denegado: usuario no válido`)
            return false
        }

        return permissionService.hasPrivilege(moduleName, privilegeName)
    }

    const hasAnyPrivilege = (moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        // 🔒 SEGURIDAD: Verificaciones básicas
        if (!isAuthenticated || !user || !user.id_rol || !isInitialized) {
            return false
        }

        return permissionService.hasAnyPrivilege(moduleName, privileges)
    }

    const hasAllPrivileges = (moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        // 🔒 SEGURIDAD: Verificaciones básicas
        if (!isAuthenticated || !user || !user.id_rol || !isInitialized) {
            return false
        }

        return permissionService.hasAllPrivileges(moduleName, privileges)
    }

    const getAccessibleModules = () => {
        // 🔒 SEGURIDAD: Verificaciones básicas
        if (!isAuthenticated || !user || !user.id_rol || !isInitialized) {
            console.log("🚫 getAccessibleModules: usuario no válido")
            return []
        }

        return permissionService.getAccessibleModules()
    }

    return {
        isLoading,
        error,
        hasModuleAccess,
        hasPrivilege,
        hasAnyPrivilege,
        hasAllPrivileges,
        getAccessibleModules,
    }
}
