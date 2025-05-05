import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import {
  AlertCircle,
  Save,
  X,
  Users,
  Shield,
  Dumbbell,
  UserPlus,
  CreditCard,
  User,
  FileText,
  CalendarRange,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import Swal from "sweetalert2"
import type { Role } from "@/shared/types/role"

interface RoleModalProps {
  isOpen: boolean
  role?: Role
  onSave: (role: Omit<Role, "id">) => void
  onClose: () => void
  title: string
}

interface Permission {
  id: string
  name: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

interface Module {
  id: string
  name: string
  icon: React.ReactNode
  permissions: Permission[]
}

export function RoleModal({ isOpen, role, onSave, onClose, title }: RoleModalProps) {
  const [name, setName] = useState(role?.name || "")
  const [description, setDescription] = useState(role?.description || "")
  const [status, setStatus] = useState(role?.status === "Activo")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Define modules with permissions
  const [modules, setModules] = useState<Module[]>([
    {
      id: "roles",
      name: "Gestión de roles",
      icon: <Shield className="h-4 w-4 text-gray-600" />,
      permissions: [{ id: "roles", name: "Roles", create: false, read: false, update: false, delete: false }],
    },
    {
      id: "trainers",
      name: "Gestión de entrenadores",
      icon: <Dumbbell className="h-4 w-4 text-gray-600" />,
      permissions: [{ id: "trainers", name: "Entrenadores", create: false, read: false, update: false, delete: false }],
    },
    {
      id: "services",
      name: "Gestión de servicios",
      icon: <FileText className="h-4 w-4 text-gray-600" />,
      permissions: [{ id: "services", name: "Servicios", create: false, read: false, update: false, delete: false }],
    },
    {
      id: "beneficiaries",
      name: "Gestión de beneficiarios",
      icon: <UserPlus className="h-4 w-4 text-gray-600" />,
      permissions: [
        { id: "beneficiaries", name: "Beneficiarios", create: false, read: false, update: false, delete: false },
      ],
    },
    {
      id: "memberships",
      name: "Gestión de membresías",
      icon: <CreditCard className="h-4 w-4 text-gray-600" />,
      permissions: [
        { id: "memberships", name: "Membresías", create: false, read: false, update: false, delete: false },
      ],
    },
    {
      id: "clients",
      name: "Gestión de clientes",
      icon: <Users className="h-4 w-4 text-gray-600" />,
      permissions: [{ id: "clients", name: "Clientes", create: false, read: false, update: false, delete: false }],
    },
    {
      id: "contracts",
      name: "Gestión de contratos por membresías",
      icon: <CalendarRange className="h-4 w-4 text-gray-600" />,
      permissions: [{ id: "contracts", name: "Contratos", create: false, read: false, update: false, delete: false }],
    },
  ])

  // Initialize permissions if editing an existing role
  useEffect(() => {
    if (role && role.permissions) {
      const updatedModules = [...modules]

      // For each module in our state
      updatedModules.forEach((module) => {
        // Find corresponding permissions in the role
        module.permissions.forEach((permission) => {
          const existingPermission = role.permissions?.find((p) => p.id === permission.id)
          if (existingPermission) {
            permission.create = existingPermission.create
            permission.read = existingPermission.read
            permission.update = existingPermission.update
            permission.delete = existingPermission.delete
          }
        })
      })

      setModules(updatedModules)
    }
  }, [role])

  // Modifica el useEffect que reinicia el formulario
  useEffect(() => {
    if (role) {
      // Si estamos editando, carga los datos del rol
      setName(role.name || "")
      setDescription(role.description || "")
      setStatus(role.status === "Activo")
      // Inicializa los permisos si existen
      if (role.permissions) {
        const updatedModules = [...modules]
        updatedModules.forEach((module) => {
          module.permissions.forEach((permission) => {
            const existingPermission = role.permissions?.find((p) => p.id === permission.id)
            if (existingPermission) {
              permission.create = existingPermission.create
              permission.read = existingPermission.read
              permission.update = existingPermission.update
              permission.delete = existingPermission.delete
            }
          })
        })
        setModules(updatedModules)
      }
    } else {
      // Si estamos creando, reinicia completamente el formulario
      setName("")
      setDescription("")
      setStatus(true)
      // Reinicia todos los permisos a false
      const resetModules = modules.map((module) => ({
        ...module,
        permissions: module.permissions.map((permission) => ({
          ...permission,
          create: false,
          read: false,
          update: false,
          delete: false,
        })),
      }))
      setModules(resetModules)
    }
    setErrors({})
  }, [role, isOpen]) // Añade isOpen como dependencia para que se reinicie al abrir el modal

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "El nombre del rol es obligatorio"
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos obligatorios",
        icon: "error",
        confirmButtonColor: "#000",
        timer: 3000,
        timerProgressBar: true,
      })
      return
    }

    setIsProcessing(true)

    // Extract permissions from modules
    const permissions = modules.flatMap((module) =>
      module.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        create: permission.create,
        read: permission.read,
        update: permission.update,
        delete: permission.delete,
      })),
    )

    // Create role object
    const roleData: Omit<Role, "id"> = {
      name,
      description,
      status: status ? "Activo" : "Inactivo",
      permissions,
      createdAt: role?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    // Simulate API call delay
    setTimeout(() => {
      onSave(roleData)
      setIsProcessing(false)

      Swal.fire({
        title: role ? "Rol actualizado" : "Rol creado",
        text: role ? "El rol ha sido actualizado exitosamente" : "El rol ha sido creado exitosamente",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 2000,
        timerProgressBar: true,
      })
    }, 600)
  }

  // Toggle all permissions for a specific module
  const toggleAllModulePermissions = (moduleIndex: number, value: boolean) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].permissions.forEach((permission) => {
      permission.create = value
      permission.read = value
      permission.update = value
      permission.delete = value
    })
    setModules(updatedModules)
  }

  // Toggle a specific permission type for all permissions in a module
  const togglePermissionTypeForModule = (
    moduleIndex: number,
    type: "create" | "read" | "update" | "delete",
    value: boolean,
  ) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].permissions.forEach((permission) => {
      permission[type] = value
    })
    setModules(updatedModules)
  }

  // Toggle a specific permission
  const togglePermission = (
    moduleIndex: number,
    permissionIndex: number,
    type: "create" | "read" | "update" | "delete",
  ) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].permissions[permissionIndex][type] =
      !updatedModules[moduleIndex].permissions[permissionIndex][type]
    setModules(updatedModules)
  }

  // Check if all permissions of a specific type are enabled for a module
  const areAllPermissionsOfTypeEnabled = (
    moduleIndex: number,
    type: "create" | "read" | "update" | "delete",
  ): boolean => {
    return modules[moduleIndex].permissions.every((permission) => permission[type])
  }

  // Check if all permissions are enabled for a module
  const areAllPermissionsEnabled = (moduleIndex: number): boolean => {
    return modules[moduleIndex].permissions.every(
      (permission) => permission.create && permission.read && permission.update && permission.delete,
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="permissions">Permisos</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nombre <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={cn("pl-9 h-9", errors.name && "border-red-500")}
                        placeholder="Nombre del rol"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Descripción <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={cn("min-h-24", errors.description && "border-red-500")}
                      placeholder="Descripción detallada del rol y sus responsabilidades"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Estado
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="status" checked={status} onCheckedChange={setStatus} />
                      <span className={cn("text-sm", status ? "text-green-600" : "text-red-600")}>
                        {status ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                  <p className="text-sm text-gray-700 mb-2">Configure los permisos para cada módulo del sistema:</p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-5 list-disc">
                    <li>
                      Marque <strong>Ver</strong> para permitir acceso de solo lectura
                    </li>
                    <li>
                      Marque <strong>Crear</strong>, <strong>Editar</strong> o <strong>Eliminar</strong> para permitir
                      esas acciones
                    </li>
                    <li>Use los selectores de "Todos" para activar/desactivar todos los permisos de un módulo</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {module.icon}
                          <h3 className="font-medium text-sm">{module.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`module-${module.id}-all`}
                            checked={areAllPermissionsEnabled(moduleIndex)}
                            onCheckedChange={(checked) => toggleAllModulePermissions(moduleIndex, checked)}
                            size="sm"
                          />
                          <Label htmlFor={`module-${module.id}-all`} className="text-xs font-medium">
                            Todos
                          </Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs border-t pt-2">
                        <div className="flex justify-center items-center">
                          <div className="flex flex-col items-center">
                            <Label className="mb-1 text-xs">Ver</Label>
                            <Switch
                              id={`module-${module.id}-read-all`}
                              checked={areAllPermissionsOfTypeEnabled(moduleIndex, "read")}
                              onCheckedChange={(checked) => togglePermissionTypeForModule(moduleIndex, "read", checked)}
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <div className="flex flex-col items-center">
                            <Label className="mb-1 text-xs">Crear</Label>
                            <Switch
                              id={`module-${module.id}-create-all`}
                              checked={areAllPermissionsOfTypeEnabled(moduleIndex, "create")}
                              onCheckedChange={(checked) =>
                                togglePermissionTypeForModule(moduleIndex, "create", checked)
                              }
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <div className="flex flex-col items-center">
                            <Label className="mb-1 text-xs">Editar</Label>
                            <Switch
                              id={`module-${module.id}-update-all`}
                              checked={areAllPermissionsOfTypeEnabled(moduleIndex, "update")}
                              onCheckedChange={(checked) =>
                                togglePermissionTypeForModule(moduleIndex, "update", checked)
                              }
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <div className="flex flex-col items-center">
                            <Label className="mb-1 text-xs">Eliminar</Label>
                            <Switch
                              id={`module-${module.id}-delete-all`}
                              checked={areAllPermissionsOfTypeEnabled(moduleIndex, "delete")}
                              onCheckedChange={(checked) =>
                                togglePermissionTypeForModule(moduleIndex, "delete", checked)
                              }
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose} size="sm">
                Cancelar
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800" disabled={isProcessing} size="sm">
                {isProcessing ? (
                  <>Procesando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {role ? "Actualizar" : "Guardar"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
