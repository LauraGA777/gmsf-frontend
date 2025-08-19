import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './authContext';
import { permissionService, type PermissionName, type PrivilegeName } from '@/shared/services/permissionService';

// ✅ Interface para el estado del contexto
interface PermissionsContextState {
    // Estados de carga
    isLoading: boolean;
    isReady: boolean;
    lastError: string | null;

    // Datos de permisos
    accessibleModules: PermissionName[];
    userPermissions: string[];
    permissionsVersion: number;

    // Funciones de verificación
    hasModuleAccess: (moduleName: PermissionName) => boolean;
    hasPrivilege: (moduleName: PermissionName, privilegeName: PrivilegeName) => boolean;
    hasAnyPrivilege: (moduleName: PermissionName, privileges: PrivilegeName[]) => boolean;
    hasAllPrivileges: (moduleName: PermissionName, privileges: PrivilegeName[]) => boolean;

    // Funciones de control
    refreshPermissions: () => Promise<void>;
    checkForChanges: () => Promise<boolean>;

    // Funciones de información
    getAccessibleModules: () => PermissionName[];
    getUserPermissions: () => string[];

    // Estado de debugging
    getDebugInfo: () => any;
}

// ✅ Valor por defecto del contexto
const defaultContextValue: PermissionsContextState = {
    isLoading: true,
    isReady: false,
    lastError: null,
    accessibleModules: [],
    userPermissions: [],
    permissionsVersion: 0,
    hasModuleAccess: () => false,
    hasPrivilege: () => false,
    hasAnyPrivilege: () => false,
    hasAllPrivileges: () => false,
    refreshPermissions: async () => { },
    checkForChanges: async () => false,
    getAccessibleModules: () => [],
    getUserPermissions: () => [],
    getDebugInfo: () => ({})
};

// ✅ Crear el contexto
const PermissionsContext = createContext<PermissionsContextState>(defaultContextValue);

// ✅ Interface para las props del provider
interface PermissionsProviderProps {
    children: ReactNode;
    enablePolling?: boolean;
    pollingInterval?: number;
    enableDebugLogs?: boolean;
}

// ✅ Provider del contexto de permisos
export function PermissionsProvider({
    children,
    enablePolling = true,
    pollingInterval = 60000, // 1 minuto por defecto
    enableDebugLogs = false
}: PermissionsProviderProps) {
    // Estados del contexto de autenticación
    const { isAuthenticated, user, logout } = useAuth();

    // Estados locales del provider
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const [accessibleModules, setAccessibleModules] = useState<PermissionName[]>([]);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [permissionsVersion, setPermissionsVersion] = useState(0);
    const [pollingTimer, setPollingTimer] = useState<NodeJS.Timeout | null>(null);

    // ✅ Función para actualizar el estado desde el servicio
    const updateStateFromService = useCallback(() => {
        setIsLoading(permissionService.getLoadingState());
        setIsReady(permissionService.isReady());
        setLastError(permissionService.getLastError());

        if (permissionService.isReady()) {
            const modules = permissionService.getAccessibleModules();
            const permissions = permissionService.getUserPermissionsList();

            setAccessibleModules(modules);
            setUserPermissions(permissions);
            setPermissionsVersion(Date.now());

            if (enableDebugLogs) {
            }
        } else {
            setAccessibleModules([]);
            setUserPermissions([]);
        }
    }, [enableDebugLogs]);

    // ✅ Función para manejar cambios en permisos
    const handlePermissionsChange = useCallback(() => {
        if (enableDebugLogs) {
        }
        updateStateFromService();
    }, [updateStateFromService, enableDebugLogs]);

    // ✅ Función para inicializar permisos
    const initializePermissions = useCallback(async () => {
        if (!isAuthenticated || !user?.id_rol) {
            if (enableDebugLogs) {}

            permissionService.clearPermissions();
            setIsLoading(false);
            setIsReady(false);
            setLastError(null);
            setAccessibleModules([]);
            setUserPermissions([]);
            setPermissionsVersion(Date.now());
            return;
        }

        try {
            if (enableDebugLogs) {}

            setIsLoading(true);
            setLastError(null);

            // Inicializar permisos en el servicio
            await permissionService.initializePermissions(user.id_rol);

            // Actualizar estado local
            updateStateFromService();

            if (enableDebugLogs) {}

        } catch (error: any) {
            setLastError(error.message || 'Error al cargar permisos');
            setIsLoading(false);
            setIsReady(false);

            // Si es error de autenticación, hacer logout
            if (error.message?.includes('autenticación') || error.message?.includes('token')) {
                logout();
            }
        }
    }, [isAuthenticated, user, updateStateFromService, enableDebugLogs, logout]);

    // ✅ Función para refrescar permisos manualmente
    const refreshPermissions = useCallback(async () => {
        if (!isAuthenticated || !user?.id_rol) {
            throw new Error('No hay usuario autenticado para refrescar permisos');
        }

        try {
            if (enableDebugLogs) {
            }

            setIsLoading(true);
            setLastError(null);

            await permissionService.refreshPermissions();
            updateStateFromService();

            if (enableDebugLogs) {
            }

        } catch (error: any) {
            setLastError(error.message || 'Error al refrescar permisos');
            setIsLoading(false);
            throw error;
        }
    }, [isAuthenticated, user, updateStateFromService, enableDebugLogs]);

    // ✅ Función para verificar cambios en permisos
    const checkForChanges = useCallback(async (): Promise<boolean> => {
        if (!isAuthenticated || !user?.id_rol) {
            return false;
        }

        try {
            if (enableDebugLogs) {}

            // Obtener permisos actuales del servidor
            const serverPermissions = await permissionService.fetchUserPermissions(user.id_rol);
            const localPermissions = permissionService.getUserPermissionsList();

            // Comparar permisos
            const hasChanged = JSON.stringify(serverPermissions.sort()) !== JSON.stringify(localPermissions.sort());

            if (hasChanged) {
                if (enableDebugLogs) {}
                await refreshPermissions();
                return true;
            }

            return false;

        } catch (error: any) {
            return false;
        }
    }, [isAuthenticated, user, refreshPermissions, enableDebugLogs]);

    // ✅ Funciones de verificación (delegadas al servicio)
    const hasModuleAccess = useCallback((moduleName: PermissionName): boolean => {
        return permissionService.hasModuleAccess(moduleName);
    }, [permissionsVersion]); // Dependency en version para forzar re-evaluación

    const hasPrivilege = useCallback((moduleName: PermissionName, privilegeName: PrivilegeName): boolean => {
        return permissionService.hasPrivilege(moduleName, privilegeName);
    }, [permissionsVersion]);

    const hasAnyPrivilege = useCallback((moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        return permissionService.hasAnyPrivilege(moduleName, privileges);
    }, [permissionsVersion]);

    const hasAllPrivileges = useCallback((moduleName: PermissionName, privileges: PrivilegeName[]): boolean => {
        return permissionService.hasAllPrivileges(moduleName, privileges);
    }, [permissionsVersion]);

    // ✅ Funciones de información
    const getAccessibleModules = useCallback((): PermissionName[] => {
        return permissionService.getAccessibleModules();
    }, [permissionsVersion]);

    const getUserPermissionsCallback = useCallback((): string[] => {
        return permissionService.getUserPermissionsList();
    }, [permissionsVersion]);

    const getDebugInfo = useCallback(() => {
        return {
            context: {
                isLoading,
                isReady,
                lastError,
                accessibleModulesCount: accessibleModules.length,
                userPermissionsCount: userPermissions.length,
                permissionsVersion,
                enablePolling,
                pollingInterval,
                hasPollingTimer: !!pollingTimer
            },
            service: permissionService.getDebugInfo(),
            user: {
                isAuthenticated,
                userId: user?.id,
                roleId: user?.id_rol,
                userName: user?.nombre
            }
        };
    }, [
        isLoading,
        isReady,
        lastError,
        accessibleModules.length,
        userPermissions.length,
        permissionsVersion,
        enablePolling,
        pollingInterval,
        pollingTimer,
        isAuthenticated,
        user
    ]);

    // ✅ Efecto para inicializar permisos cuando cambia el usuario
    useEffect(() => {
        initializePermissions();
    }, [initializePermissions]);

    // ✅ Efecto para registrar listener de cambios
    useEffect(() => {
        // Registrar listener en el servicio
        permissionService.addChangeListener(handlePermissionsChange);

        // Cleanup: remover listener
        return () => {
            permissionService.removeChangeListener(handlePermissionsChange);
        };
    }, [handlePermissionsChange]);

    // ✅ Efecto para polling (verificación periódica)
    useEffect(() => {
        if (!enablePolling || !isAuthenticated || !user?.id_rol) {
            return;
        }

        // Limpiar timer anterior si existe
        if (pollingTimer) {
            clearInterval(pollingTimer);
        }

        // Crear nuevo timer
        const timer = setInterval(async () => {
            try {
                if (enableDebugLogs) {}
                await checkForChanges();
            } catch (error) {}
        }, pollingInterval);

        setPollingTimer(timer);

        // Cleanup: limpiar timer
        return () => {
            clearInterval(timer);
            setPollingTimer(null);
        };
    }, [enablePolling, pollingInterval, isAuthenticated, user?.id_rol, checkForChanges, enableDebugLogs]);

    // ✅ Efecto para limpiar al desmontar
    useEffect(() => {
        return () => {
            if (pollingTimer) {
                clearInterval(pollingTimer);
            }
            // No limpiar el servicio aquí para mantener estado entre montajes
        };
    }, [pollingTimer]);

    // ✅ Valor del contexto
    const contextValue: PermissionsContextState = {
        // Estados
        isLoading,
        isReady,
        lastError,
        accessibleModules,
        userPermissions,
        permissionsVersion,

        // Funciones de verificación
        hasModuleAccess,
        hasPrivilege,
        hasAnyPrivilege,
        hasAllPrivileges,

        // Funciones de control
        refreshPermissions,
        checkForChanges,

        // Funciones de información
        getAccessibleModules,
        getUserPermissions: getUserPermissionsCallback,
        getDebugInfo
    };

    return (
        <PermissionsContext.Provider value={contextValue}>
            {children}
        </PermissionsContext.Provider>
    );
}

// ✅ Hook para usar el contexto de permisos
export function usePermissionsContext(): PermissionsContextState {
    const context = useContext(PermissionsContext);

    if (!context) {
        throw new Error('usePermissionsContext debe ser usado dentro de un PermissionsProvider');
    }

    return context;
}

// ✅ Hook simplificado para verificaciones rápidas
export function usePermissionCheck() {
    const { hasModuleAccess, hasPrivilege, hasAnyPrivilege, hasAllPrivileges, isReady } = usePermissionsContext();

    return {
        hasModuleAccess,
        hasPrivilege,
        hasAnyPrivilege,
        hasAllPrivileges,
        isReady
    };
}

// ✅ Hook para debugging
export function usePermissionsDebug() {
    const { getDebugInfo, refreshPermissions, checkForChanges } = usePermissionsContext();

    return {
        getDebugInfo,
        refreshPermissions,
        checkForChanges,
        logDebugInfo: () => {}
    };
}

// ✅ HOC para componentes que requieren permisos específicos
export function withPermissions<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    requiredModule: PermissionName,
    requiredPrivileges?: PrivilegeName[]
) {
    return function PermissionWrappedComponent(props: P) {
        const { hasModuleAccess, hasAllPrivileges, isReady, isLoading } = usePermissionsContext();

        // Mostrar loading mientras se cargan los permisos
        if (isLoading || !isReady) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verificando permisos...</p>
                    </div>
                </div>
            );
        }

        // Verificar acceso al módulo
        if (!hasModuleAccess(requiredModule)) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">🚫</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
                        <p className="text-gray-600">No tienes permisos para acceder a este módulo.</p>
                    </div>
                </div>
            );
        }

        // Verificar privilegios específicos si se requieren
        if (requiredPrivileges && !hasAllPrivileges(requiredModule, requiredPrivileges)) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Privilegios Insuficientes</h3>
                        <p className="text-gray-600">No tienes los privilegios necesarios para esta funcionalidad.</p>
                    </div>
                </div>
            );
        }

        // Renderizar componente si tiene permisos
        return <WrappedComponent {...props} />;
    };
}

// ✅ Exportaciones adicionales
export type { PermissionsContextState, PermissionsProviderProps };
export { PermissionsContext };