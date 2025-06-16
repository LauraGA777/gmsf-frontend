"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { AlertCircle, Save, Shield, User, CheckSquare, Square, Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import Swal from "sweetalert2"
import type { Role, Permission, PermissionSelection } from "@/shared/types/role"
import { roleService } from "../services/roleService"

interface RoleModalProps {
  isOpen: boolean
  role?: Role
  onSave: (role: Omit<Role, "id">, permissions: PermissionSelection[]) => void
  onClose: () => void
  title: string
}

export function RoleModal({ isOpen, role, onSave, onClose, title }: RoleModalProps) {
  const [name, setName] = useState(role?.name || "")
  const [description, setDescription] = useState(role?.description || "")
  const [status, setStatus] = useState(role?.status === "Activo")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  // Estados para permisos
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionSelection[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)

  // Cargar permisos disponibles
  useEffect(() => {
    if (isOpen) {
      loadPermissions()
    }
  }, [isOpen])

  // Inicializar formulario cuando cambia el rol
  useEffect(() => {
    if (role) {
      setName(role.name || "")
      setDescription(role.description || "")
      setStatus(role.status === "Activo")
    } else {
      setName("")
      setDescription("")
      setStatus(true)
    }
    setErrors({})
  }, [role, isOpen])

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true)
      const permissions = await roleService.getPermissionsAndPrivileges()
      setAvailablePermissions(permissions)

      // Convertir a formato de selección
      const permissionSelection = roleService.convertToPermissionSelection(
        permissions,
        role?.permisos,
        role?.privilegios,
      )
      setSelectedPermissions(permissionSelection)
    } catch (error) {
      console.error("Error loading permissions:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los permisos disponibles",
        icon: "error",
        confirmButtonColor: "#000",
      })
    } finally {
      setLoadingPermissions(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "El nombre del rol es obligatorio"
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    // Validar que al menos un privilegio esté seleccionado
    const hasSelectedPrivileges = selectedPermissions.some((permission) =>
      permission.privileges.some((privilege) => privilege.selected),
    )

    if (!hasSelectedPrivileges) {
      newErrors.permissions = "Debe seleccionar al menos un privilegio"
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

    // Create role object
    const roleData: Omit<Role, "id"> = {
      codigo: "", // Se genera en el backend
      nombre: name,
      name,
      descripcion: description,
      description,
      estado: status,
      status: status ? "Activo" : "Inactivo",
      isActive: status,
      permisos: [],
      privilegios: [],
      permissions: [],
      createdAt: role?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    // Simulate API call delay
    setTimeout(() => {
      onSave(roleData, selectedPermissions)
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

  // Toggle all privileges for a permission
  const toggleAllPermissionPrivileges = (permissionIndex: number, value: boolean) => {
    const updated = [...selectedPermissions]
    updated[permissionIndex].privileges.forEach((privilege) => {
      privilege.selected = value
    })
    setSelectedPermissions(updated)
  }

  // Toggle a specific privilege
  const togglePrivilege = (permissionIndex: number, privilegeIndex: number) => {
    const updated = [...selectedPermissions]
    updated[permissionIndex].privileges[privilegeIndex].selected =
      !updated[permissionIndex].privileges[privilegeIndex].selected
    setSelectedPermissions(updated)
  }

  // Check if all privileges are selected for a permission
  const areAllPrivilegesSelected = (permissionIndex: number): boolean => {
    return selectedPermissions[permissionIndex]?.privileges.every((privilege) => privilege.selected) || false
  }

  // Check if any privilege is selected for a permission
  const hasSelectedPrivileges = (permissionIndex: number): boolean => {
    return selectedPermissions[permissionIndex]?.privileges.some((privilege) => privilege.selected) || false
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
              {loadingPermissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                    <p className="text-sm text-gray-700 mb-2">Configure los permisos para cada módulo del sistema:</p>
                    <ul className="text-xs text-gray-600 space-y-1 ml-5 list-disc">
                      <li>Seleccione los módulos a los que tendrá acceso este rol</li>
                      <li>Para cada módulo, elija las acciones permitidas</li>
                      <li>Use "Todos" para seleccionar/deseleccionar todas las acciones de un módulo</li>
                    </ul>
                  </div>

                  {errors.permissions && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.permissions}
                    </p>
                  )}

                  <div className="space-y-3">
                    {selectedPermissions.map((permission, permissionIndex) => (
                      <Card key={permission.permissionId} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-600" />
                              {permission.permissionName}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`permission-${permission.permissionId}-all`}
                                checked={areAllPrivilegesSelected(permissionIndex)}
                                onCheckedChange={(checked) => toggleAllPermissionPrivileges(permissionIndex, checked)}
                                size="sm"
                              />
                              <Label
                                htmlFor={`permission-${permission.permissionId}-all`}
                                className="text-xs font-medium"
                              >
                                Todos
                              </Label>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {permission.privileges.map((privilege, privilegeIndex) => (
                              <div key={privilege.id} className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => togglePrivilege(permissionIndex, privilegeIndex)}
                                  className="flex items-center space-x-2 text-sm hover:bg-gray-50 p-1 rounded"
                                >
                                  {privilege.selected ? (
                                    <CheckSquare className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span
                                    className={cn(
                                      "capitalize",
                                      privilege.selected ? "text-blue-600 font-medium" : "text-gray-600",
                                    )}
                                  >
                                    {privilege.name}
                                  </span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800" disabled={isProcessing || loadingPermissions}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {role ? "Actualizar" : "Guardar"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
