import { api } from "./api"

// ✅ NUEVO SERVICIO SINCRONIZADO CON EL BACKEND
export interface RoleWithPermissions {
    id: number
    codigo: string
    nombre: string
    descripcion?: string
    estado: boolean
    permisos?: Permission[]
    privilegios?: Privilege[]
    fecha_creacion?: Date
    fecha_actualizacion?: Date
}

export interface Permission {
    id: number
    nombre: string
    descripcion?: string
    codigo: string
    estado: boolean
}

export interface Privilege {
    id: number
    nombre: string
    descripcion?: string
    codigo: string
    id_permiso?: number
}

export interface ApiResponse<T> {
    status: string
    message?: string
    data: T
}

export interface PaginatedResponse<T> {
    total: number
    pagina: number
    limite: number
    total_paginas: number
    roles?: T[]
    data?: T[]
}

export const roleService = {
    // ✅ OBTENER ROLES CON PAGINACIÓN
    getRoles: async (pagina = 1, limite = 10): Promise<PaginatedResponse<RoleWithPermissions>> => {
        try {
            console.log(`🔍 Fetching roles: pagina=${pagina}, limite=${limite}`)
            const response = await api.get<ApiResponse<PaginatedResponse<RoleWithPermissions>>>(
                `/roles?pagina=${pagina}&limite=${limite}`
            )

            console.log('📡 Roles API response:', response.data)

            if (response.data.status === 'success') {
                return response.data.data
            }

            throw new Error(response.data.message || 'Error al obtener roles')
        } catch (error) {
            console.error('❌ Error in roleService.getRoles:', error)
            throw error
        }
    },

    // ✅ OBTENER ROL CON PERMISOS Y PRIVILEGIOS
    getRoleWithPermissions: async (id: number): Promise<RoleWithPermissions> => {
        try {
            console.log(`🔍 Fetching role with permissions: id=${id}`)
            const response = await api.get<ApiResponse<{ role: RoleWithPermissions }>>(
                `/roles/${id}/permissions`
            )

            console.log('📡 Role permissions API response:', response.data)

            if (response.data.status === 'success') {
                return response.data.data.role
            }

            throw new Error(response.data.message || 'Error al obtener rol con permisos')
        } catch (error) {
            console.error('❌ Error in roleService.getRoleWithPermissions:', error)
            throw error
        }
    },

    // ✅ OBTENER PERMISOS Y PRIVILEGIOS DISPONIBLES
    getPermissionsAndPrivileges: async (): Promise<{
        permisos: Permission[]
        privilegios: Privilege[]
    }> => {
        try {
            console.log('🔍 Fetching available permissions and privileges')
            const response = await api.get<ApiResponse<{
                permisos: Permission[]
                privilegios: Privilege[]
            }>>('/roles/permissions-privileges')

            console.log('📡 Permissions API response:', response.data)

            if (response.data.status === 'success') {
                return response.data.data
            }

            throw new Error(response.data.message || 'Error al obtener permisos y privilegios')
        } catch (error) {
            console.error('❌ Error in roleService.getPermissionsAndPrivileges:', error)
            throw error
        }
    },

    // ✅ CREAR NUEVO ROL
    createRole: async (roleData: {
        nombre: string
        descripcion?: string
        estado: boolean
        permisos: number[]
        privilegios: number[]
    }): Promise<RoleWithPermissions> => {
        try {
            console.log('🔍 Creating new role:', roleData)
            const response = await api.post<ApiResponse<{ role: RoleWithPermissions }>>(
                '/roles',
                roleData
            )

            console.log('📡 Create role API response:', response.data)

            if (response.data.status === 'success') {
                return response.data.data.role
            }

            throw new Error(response.data.message || 'Error al crear rol')
        } catch (error) {
            console.error('❌ Error in roleService.createRole:', error)
            throw error
        }
    },

    // ✅ ACTUALIZAR ROL
    updateRole: async (id: number, roleData: {
        nombre?: string
        descripcion?: string
        estado?: boolean
        permisos?: number[]
        privilegios?: number[]
    }): Promise<RoleWithPermissions> => {
        try {
            console.log(`🔍 Updating role ${id}:`, roleData)
            const response = await api.put<ApiResponse<{ role: RoleWithPermissions }>>(
                `/roles/${id}`,
                roleData
            )

            console.log('📡 Update role API response:', response.data)

            if (response.data.status === 'success') {
                return response.data.data.role
            }

            throw new Error(response.data.message || 'Error al actualizar rol')
        } catch (error) {
            console.error('❌ Error in roleService.updateRole:', error)
            throw error
        }
    },

    // ✅ DESACTIVAR ROL
    deactivateRole: async (id: number): Promise<RoleWithPermissions> => {
        try {
            console.log(`🔍 Deactivating role: id=${id}`)
            const response = await api.patch<ApiResponse<{ role: RoleWithPermissions }>>(
                `/roles/${id}/deactivate`
            )

            console.log('📡 Deactivate role API response:', response.data)

            if (response.data.status === 'success') {
                return response.data.data.role
            }

            throw new Error(response.data.message || 'Error al desactivar rol')
        } catch (error) {
            console.error('❌ Error in roleService.deactivateRole:', error)
            throw error
        }
    },

    // ✅ ELIMINAR ROL
    deleteRole: async (id: number): Promise<void> => {
        try {
            console.log(`🔍 Deleting role: id=${id}`)
            const response = await api.delete<ApiResponse<any>>(`/roles/${id}`)

            console.log('📡 Delete role API response:', response.data)

            if (response.data.status !== 'success') {
                throw new Error(response.data.message || 'Error al eliminar rol')
            }
        } catch (error) {
            console.error('❌ Error in roleService.deleteRole:', error)
            throw error
        }
    },

    // ✅ BUSCAR ROLES
    searchRoles: async (query: string): Promise<RoleWithPermissions[]> => {
        try {
            console.log(`🔍 Searching roles: query=${query}`)
            const response = await api.get<ApiResponse<{ roles: RoleWithPermissions[] }>>(
                `/roles/search?q=${encodeURIComponent(query)}`
            )

            console.log('📡 Search roles API response:', response.data)

            if (response.data.status === 'success') {
                return response.data.data.roles
            }

            throw new Error(response.data.message || 'Error al buscar roles')
        } catch (error) {
            console.error('❌ Error in roleService.searchRoles:', error)
            throw error
        }
    }
}
