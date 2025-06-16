"use client"

import { useState, useEffect } from "react"
import { permissionService, type PermissionName, type PrivilegeName } from "@/shared/services/permissionService"
import { useAuth } from "@/shared/contexts/authContext"

export function usePermissions() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()

    useEffect(() => {
        const loadPermissions = async () => {
            if (!isAuthenticated || !user) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                console.log("🔍 Cargando permisos para usuario:", user)

                await permissionService.getUserPermissions()

                console.log("✅ Permisos cargados exitosamente")
            } catch (err) {
                console.error("❌ Error al cargar permisos:", err)
                setError(err instanceof Error ? err.message : "Error desconocido")
            } finally {
                setIsLoading(false)
            }
        }

        loadPermissions()
    }, [isAuthenticated, user])

    const hasModuleAccess = (moduleName: PermissionName): boolean => {
        if (isLoading || !isAuthenticated) {
            console.log(`🔒 Acceso denegado a ${moduleName}: cargando o no autenticado`)
            return false
        }

        // Fallback temporal para admin (id_rol = 1)
        if (user?.id_rol === 1) {
            console.log(`👑 Acceso de admin concedido a ${moduleName}`)
            return true
        }

        const hasAccess = permissionService.hasModuleAccess(moduleName)
        console.log(`🔍 Verificando acceso a ${moduleName}:`, hasAccess)

        return hasAccess
    }

    const hasPrivilege = (moduleName: PermissionName, privilegeName: PrivilegeName): boolean => {
        if (isLoading || !isAuthenticated) return false

        // Fallback temporal para admin (id_rol = 1)
        if (user?.id_rol === 1) {
            return true
        }

        return permissionService.hasPrivilege(moduleName, privilegeName)
    }

    const hasAnyPrivilege = (moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        if (isLoading || !isAuthenticated) return false

        // Fallback temporal para admin (id_rol = 1)
        if (user?.id_rol === 1) {
            return true
        }

        return permissionService.hasAnyPrivilege(moduleName, privileges)
    }

    const hasAllPrivileges = (moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        if (isLoading || !isAuthenticated) return false

        // Fallback temporal para admin (id_rol = 1)
        if (user?.id_rol === 1) {
            return true
        }

        return permissionService.hasAllPrivileges(moduleName, privileges)
    }

    const getAccessibleModules = () => {
        if (isLoading || !isAuthenticated) return []

        // Fallback temporal para admin (id_rol = 1)
        if (user?.id_rol === 1) {
            return Object.entries(permissionService.PERMISSION_MODULE_MAP || {}).map(([name, config]) => ({
                name: name as PermissionName,
                route: config.route,
                component: config.component,
                privileges: config.privileges as PrivilegeName[],
            }))
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
