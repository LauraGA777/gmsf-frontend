import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/shared/contexts/authContext"
import { permissionService, type PermissionName, type PrivilegeName } from "@/shared/services/permissionService"

// ✅ Tipo para el estado de permisos
interface PermissionsState {
  isLoading: boolean
  isReady: boolean
  lastError: string | null
  accessibleModules: PermissionName[]
  userPermissions: string[]
  version: number // Para forzar re-renders
}

export function usePermissions() {
    const { isAuthenticated, user } = useAuth()
    
    // ✅ Estado reactivo para permisos
    const [permissionsState, setPermissionsState] = useState<PermissionsState>({
        isLoading: true,
        isReady: false,
        lastError: null,
        accessibleModules: [],
        userPermissions: [],
        version: 0
    })

    // ✅ Función para actualizar el estado de permisos
    const updatePermissionsState = useCallback(() => {
        const newState: PermissionsState = {
            isLoading: permissionService.getLoadingState(),
            isReady: permissionService.isReady(),
            lastError: permissionService.getLastError(),
            accessibleModules: permissionService.isReady() ? permissionService.getAccessibleModules() : [],
            userPermissions: permissionService.isReady() ? permissionService.getUserPermissionsList() : [],
            version: Date.now() // Timestamp para forzar re-renders
        }

        setPermissionsState(prevState => {
            // Solo actualizar si realmente hay cambios
            if (
                prevState.isLoading !== newState.isLoading ||
                prevState.isReady !== newState.isReady ||
                prevState.lastError !== newState.lastError ||
                JSON.stringify(prevState.accessibleModules) !== JSON.stringify(newState.accessibleModules) ||
                JSON.stringify(prevState.userPermissions) !== JSON.stringify(newState.userPermissions)
            ) {
                return newState
            }
            return prevState
        })
    }, [])

    // ✅ Función para refrescar permisos manualmente
    const refreshPermissions = useCallback(async () => {
        if (!isAuthenticated || !user?.id_rol) {
            return
        }

        try {
            setPermissionsState(prev => ({ ...prev, isLoading: true }))
            
            // Recargar permisos desde el servidor
            await permissionService.initializePermissions(user.id_rol)
            
            // Actualizar estado local
            updatePermissionsState()
        } catch (error) {
            setPermissionsState(prev => ({ 
                ...prev, 
                isLoading: false, 
                lastError: 'Error al refrescar permisos' 
            }))
        }
    }, [isAuthenticated, user?.id_rol, updatePermissionsState])

    // ✅ Efecto para suscribirse a cambios del servicio de permisos
    useEffect(() => {
        // Función que se ejecutará cuando cambien los permisos
        const handlePermissionsChange = () => {
            updatePermissionsState()
        }

        // Agregar listener al servicio de permisos (necesitas implementar esto en el servicio)
        if (typeof permissionService.addChangeListener === 'function') {
            permissionService.addChangeListener(handlePermissionsChange)
        }

        // Actualizar estado inicial
        updatePermissionsState()

        // Cleanup: remover listener
        return () => {
            if (typeof permissionService.removeChangeListener === 'function') {
                permissionService.removeChangeListener(handlePermissionsChange)
            }
        }
    }, [updatePermissionsState])

    // ✅ Efecto para reaccionar a cambios en el usuario
    useEffect(() => {
        if (isAuthenticated && user?.id_rol) {
            refreshPermissions()
        } else {
            // Limpiar permisos si no hay usuario
            setPermissionsState({
                isLoading: false,
                isReady: false,
                lastError: null,
                accessibleModules: [],
                userPermissions: [],
                version: Date.now()
            })
        }
    }, [isAuthenticated, user?.id_rol, refreshPermissions])

    // ✅ Efecto para polling periódico (opcional)
    useEffect(() => {
        if (!isAuthenticated || !user?.id_rol) return

        // Verificar cambios cada 5 minutos
        const interval = setInterval(() => {
            refreshPermissions()
        }, 5 * 60 * 1000) // 5 minutos

        return () => clearInterval(interval)
    }, [isAuthenticated, user?.id_rol, refreshPermissions])

    // ✅ Funciones reactivas de permisos
    const hasModuleAccess = useCallback((moduleName: PermissionName): boolean => {
        // 🔒 SEGURIDAD: Usuario debe estar autenticado
        if (!isAuthenticated || !user) {
            return false
        }

        // 🔒 SEGURIDAD: Usuario debe tener rol válido
        if (!user.id_rol) {
            return false
        }

        // 🔒 SEGURIDAD: Aplicación debe estar inicializada Y lista
        if (!permissionsState.isReady) {
            return false
        }

        // Verificar usando el servicio de permisos
        return permissionService.hasModuleAccess(moduleName)
    }, [isAuthenticated, user, permissionsState.isReady, permissionsState.version])

    const hasPrivilege = useCallback((moduleName: PermissionName, privilegeName: PrivilegeName): boolean => {
        // 🔒 SEGURIDAD: Verificaciones básicas
        if (!isAuthenticated || !user || !user.id_rol || !permissionsState.isReady) {
            return false
        }

        return permissionService.hasPrivilege(moduleName, privilegeName)
    }, [isAuthenticated, user, permissionsState.isReady, permissionsState.version])

    const hasAnyPrivilege = useCallback((moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        if (!isAuthenticated || !user || !user.id_rol || !permissionsState.isReady) {
            return false
        }

        return permissionService.hasAnyPrivilege(moduleName, privileges)
    }, [isAuthenticated, user, permissionsState.isReady, permissionsState.version])

    const hasAllPrivileges = useCallback((moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        if (!isAuthenticated || !user || !user.id_rol || !permissionsState.isReady) {
            return false
        }

        return permissionService.hasAllPrivileges(moduleName, privileges)
    }, [isAuthenticated, user, permissionsState.isReady, permissionsState.version])

    // ✅ Función para verificar si los permisos han cambiado
    const checkForPermissionChanges = useCallback(async () => {
        if (!isAuthenticated || !user?.id_rol) return false

        try {
            // Obtener permisos actuales del servidor
            const currentPermissions = await permissionService.fetchUserPermissions(user.id_rol)
            const localPermissions = permissionService.getUserPermissionsList()

            // Comparar si han cambiado
            const hasChanged = JSON.stringify(currentPermissions) !== JSON.stringify(localPermissions)
            
            if (hasChanged) {
                await refreshPermissions()
                return true
            }
            
            return false
        } catch (error) {
            return false
        }
    }, [isAuthenticated, user?.id_rol, refreshPermissions])

    return {
        // ✅ Funciones de permisos reactivas
        hasModuleAccess,
        hasPrivilege,
        hasAnyPrivilege,
        hasAllPrivileges,
        
        // ✅ Estados reactivos
        isLoading: permissionsState.isLoading,
        isReady: permissionsState.isReady,
        lastError: permissionsState.lastError,
        
        // ✅ Datos de permisos reactivos
        accessibleModules: permissionsState.accessibleModules,
        userPermissions: permissionsState.userPermissions,
        
        // ✅ Funciones de control
        refreshPermissions,
        checkForPermissionChanges,
        
        // ✅ Métodos adicionales (ahora reactivos)
        getAccessibleModules: () => permissionsState.accessibleModules,
        getUserPermissions: () => permissionsState.userPermissions,
        
        // ✅ Información de estado
        permissionsVersion: permissionsState.version,
        hasPermissionsLoaded: permissionsState.isReady && !permissionsState.isLoading,
    }
}

// ✅ Hook adicional para componentes que solo necesitan saber si hay cambios
export function usePermissionsWatcher() {
    const { permissionsVersion, refreshPermissions, checkForPermissionChanges } = usePermissions()
    
    // Efecto para detectar cambios
    useEffect(() => {
        const watchChanges = async () => {
            await checkForPermissionChanges()
        }
        
        // Verificar cambios cada 30 segundos
        const interval = setInterval(watchChanges, 30 * 1000)
        
        return () => clearInterval(interval)
    }, [checkForPermissionChanges])
    
    return {
        permissionsVersion,
        refreshPermissions,
        checkForPermissionChanges
    }
}