// Utilidad para debugging de roles
// Puedes usar esto en la consola del navegador

export const createRoleDebugger = (authContext: any) => {
  return {
    // Diagnosticar estado general
    diagnose: () => {
      authContext.diagnoseRoleStatus()
    },
    
    // Verificar si un rol específico viene de BD o fallback
    checkRoleSource: (roleId: number) => {
      const role = authContext.roles.find((r: any) => r.id === roleId)
      if (!role) {
        console.error(`❌ Rol ${roleId} no encontrado`)
        return null
      }
      
      const source = role.source || 'unknown'
      console.log(`🔍 Rol ${role.nombre} (ID: ${roleId}) - Origen: ${source}`)
      
      if (source === 'fallback') {
        console.warn("⚠️ PROBLEMA: Este rol viene del fallback, debería ser de BD")
      }
      
      return { role, source }
    },
    
    // Verificar usuario actual
    checkCurrentUser: () => {
      if (!authContext.user) {
        console.log("❌ No hay usuario logueado")
        return null
      }
      
      const userRole = authContext.roles.find((r: any) => r.id === authContext.user.id_rol)
      const roleSource = userRole ? (userRole.source || 'unknown') : 'not-found'
      
      console.log("👤 Usuario actual:", {
        nombre: authContext.user.nombre,
        id_rol: authContext.user.id_rol,
        roleName: authContext.user.roleName,
        roleSource: authContext.user.roleSource || 'unknown'
      })
      
      if (roleSource === 'fallback') {
        console.warn("⚠️ PROBLEMA: El usuario actual tiene un rol fallback")
      }
      
      return { user: authContext.user, userRole, roleSource }
    },
    
    // Forzar recarga de roles
    reloadRoles: async () => {
      console.log("🔄 Forzando recarga de roles...")
      try {
        await authContext.loadRoles()
        console.log("✅ Roles recargados exitosamente")
        authContext.diagnoseRoleStatus()
      } catch (error) {
        console.error("❌ Error recargando roles:", error)
      }
    },
    
    // Mostrar todos los roles disponibles
    listRoles: () => {
      console.log("📋 Roles disponibles:")
      authContext.roles.forEach((role: any) => {
        const source = role.source || 'unknown'
        console.log(`  - ${role.nombre} (ID: ${role.id}) - Origen: ${source}`)
      })
    }
  }
}

// Función para agregar el debugger al window global
export const installRoleDebugger = (authContext: any) => {
  if (typeof window !== 'undefined') {
    (window as any).roleDebugger = createRoleDebugger(authContext)
    console.log("🛠️ Role Debugger instalado! Usa 'roleDebugger' en la consola para debugging")
    console.log("📝 Comandos disponibles:")
    console.log("  - roleDebugger.diagnose() - Diagnóstico completo")
    console.log("  - roleDebugger.checkRoleSource(id) - Verificar origen de un rol")
    console.log("  - roleDebugger.checkCurrentUser() - Verificar usuario actual")
    console.log("  - roleDebugger.reloadRoles() - Recargar roles")
    console.log("  - roleDebugger.listRoles() - Listar todos los roles")
  }
}
