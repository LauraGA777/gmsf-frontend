import type { Role } from "../types/role"

// Ampliando los datos de prueba para la paginación
export const generateMockRoles = (): Role[] => {
  const baseRoles = [
    {
      id: "1",
      name: "Administrador",
      description: "Acceso completo al sistema",
      permissions: ["create", "read", "update", "delete", "manage_users", "manage_roles"],
      createdAt: "2023-01-15",
      updatedAt: "2023-01-15",
      userCount: 3,
    },
    {
      id: "2",
      name: "Editor",
      description: "Puede editar contenido pero no eliminarlo",
      permissions: ["read", "update", "manage_trainings"],
      createdAt: "2023-02-20",
      updatedAt: "2023-02-20",
      userCount: 8,
    },
    {
      id: "3",
      name: "Visualizador",
      description: "Acceso de solo lectura",
      permissions: ["read", "read_own"],
      createdAt: "2023-03-10",
      updatedAt: "2023-03-10",
      userCount: 12,
    },
  ]

  // Generar roles adicionales para probar la paginación
  const additionalRoles: Role[] = []
  const roleTypes = [
    "Gerente",
    "Supervisor",
    "Asistente",
    "Recepcionista",
    "Instructor",
    "Contador",
    "Analista",
    "Coordinador",
  ]
  const descriptions = [
    "Gestión de personal y recursos",
    "Supervisión de operaciones diarias",
    "Apoyo administrativo general",
    "Atención al cliente y agenda",
    "Dirección de actividades físicas",
    "Gestión financiera y contable",
    "Análisis de datos y reportes",
    "Coordinación de eventos y actividades",
  ]

  for (let i = 0; i < 15; i++) {
    const roleTypeIndex = i % roleTypes.length
    const descIndex = i % descriptions.length
    const date = new Date()
    date.setMonth(date.getMonth() - (i % 12))
    date.setDate(date.getDate() - (i % 28))

    additionalRoles.push({
      id: `${i + 4}`,
      name: `${roleTypes[roleTypeIndex]} ${i + 1}`,
      description: descriptions[descIndex],
      permissions: ["read", ...(i % 3 === 0 ? ["create"] : []), ...(i % 2 === 0 ? ["update"] : [])],
      createdAt: date.toISOString().split("T")[0],
      updatedAt: date.toISOString().split("T")[0],
      userCount: Math.floor(Math.random() * 20),
    })
  }

  return [...baseRoles, ...additionalRoles]
}

export const mockRoles = generateMockRoles()
