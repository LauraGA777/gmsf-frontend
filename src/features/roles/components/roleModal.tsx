"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Badge } from "@/shared/components/ui/badge"
import { Loader2, Shield, Settings } from "lucide-react"
import Swal from "sweetalert2"
import type { Role, RoleFormData, PermissionSelection } from "@/shared/types/role"
import { roleService } from "../services/roleService"

interface RoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSuccess: () => void
}

export function RoleModal({ open, onOpenChange, role, onSuccess }: RoleModalProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    nombre: "",
    name: "",
    descripcion: "",
    description: "",
    estado: true,
    isActive: true,
    status: "Activo",
    privileges: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("info")
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)
  const [permissions, setPermissions] = useState<PermissionSelection[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre,
        name: role.nombre,
        descripcion: role.descripcion || "",
        description: role.descripcion || "",
        estado: role.estado,
        isActive: role.estado,
        status: role.estado ? "Activo" : "Inactivo",
        privileges: [],
      })
    } else {
      setFormData({
        nombre: "",
        name: "",
        descripcion: "",
        description: "",
        estado: true,
        isActive: true,
        status: "Activo",
        privileges: [],
      })
    }
    setErrors({})
    setActiveTab("info")
    
    if (open) {
      loadPermissions()
    }
  }, [role, open])

  const loadPermissions = async () => {
    try {
      setIsLoadingPermissions(true)
      
      if (role) {
        // Al editar, primero cargamos todos los permisos disponibles
        const allPermissions = await roleService.getPermissionsAndPrivileges()
        
        // Luego obtenemos los permisos específicos del rol para marcar los seleccionados
        const { permissions: rolePermissions } = await roleService.getRoleWithPermissions(role.id)
        
        // Crear un Set con los IDs de privilegios seleccionados para búsqueda rápida
        const selectedPrivilegeIds = new Set(
          rolePermissions.flatMap(p => p.privileges.filter(priv => priv.selected).map(priv => priv.id))
        )
        
        // Marcar los privilegios seleccionados en todos los permisos
        const permissionsWithSelection = allPermissions.map(permission => ({
          ...permission,
          privileges: permission.privileges.map(privilege => ({
            ...privilege,
            selected: selectedPrivilegeIds.has(privilege.id)
          }))
        }))
        
        setPermissions(permissionsWithSelection)
        
        // Actualizar el formulario con los privilegios seleccionados
        setFormData(prev => ({
          ...prev,
          privileges: Array.from(selectedPrivilegeIds)
        }))
      } else {
        // Si estamos creando un rol, usar el endpoint general
        const permissionSelections = await roleService.getPermissionsAndPrivileges()
        setPermissions(permissionSelections)
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los permisos",
        icon: "error",
        confirmButtonColor: "#000"
      })
    } finally {
      setIsLoadingPermissions(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.descripcion?.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    if (!formData.privileges || formData.privileges.length === 0) {
      newErrors.privileges = "Debe seleccionar al menos un privilegio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (errors.privileges) {
        setActiveTab("permisos")
      }
      return
    }

    try {
      setIsSubmitting(true)
      
      // Actualizar los permisos con las selecciones del formulario
      const updatedPermissions = permissions.map(permission => ({
        ...permission,
        privileges: permission.privileges.map(privilege => ({
          ...privilege,
          selected: formData.privileges?.includes(privilege.id) || false
        }))
      }))

      if (role) {
        await roleService.updateRoleWithPermissions(role, updatedPermissions)
        Swal.fire({
          title: "Rol actualizado",
          text: "El rol se ha actualizado correctamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 2000,
          timerProgressBar: true
        })
      } else {
        await roleService.createRoleWithPermissions(formData, updatedPermissions)
        Swal.fire({
          title: "Rol creado",
          text: "El rol se ha creado correctamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 2000,
          timerProgressBar: true
        })
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Ha ocurrido un error",
        icon: "error",
        confirmButtonColor: "#000"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrivilegeChange = (privilegeId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      privileges: checked
        ? [...(prev.privileges || []), privilegeId]
        : (prev.privileges || []).filter((id) => id !== privilegeId),
    }))

    if (errors.privileges) {
      setErrors((prev) => ({ ...prev, privileges: "" }))
    }
  }

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    const permission = permissions.find((p) => p.permissionId === permissionId)
    if (!permission || !permission.privileges) return

    const privilegeIds = permission.privileges.map((p) => p.id)

    setFormData((prev) => ({
      ...prev,
      privileges: checked
        ? [...new Set([...(prev.privileges || []), ...privilegeIds])]
        : (prev.privileges || []).filter((id) => !privilegeIds.includes(id)),
    }))
  }

  const isPermissionSelected = (permissionId: number) => {
    const permission = permissions.find((p) => p.permissionId === permissionId)
    if (!permission || !permission.privileges) return false

    return permission.privileges.every((p) => formData.privileges?.includes(p.id))
  }

  const isPermissionPartiallySelected = (permissionId: number) => {
    const permission = permissions.find((p) => p.permissionId === permissionId)
    if (!permission || !permission.privileges) return false

    const selectedCount = permission.privileges.filter((p) => formData.privileges?.includes(p.id)).length
    return selectedCount > 0 && selectedCount < permission.privileges.length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {role ? "Editar Rol" : "Crear Nuevo Rol"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Información
            </TabsTrigger>
            <TabsTrigger value="permisos" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permisos
              {formData.privileges && formData.privileges.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {formData.privileges.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Rol *</Label>
                  <Input
                    id="name"
                    value={formData.nombre}
                    onChange={(e) => {
                      setFormData((prev) => ({ 
                        ...prev, 
                        nombre: e.target.value,
                        name: e.target.value 
                      }))
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                    }}
                    placeholder="Ej: Administrador, Recepcionista, Entrenador"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.descripcion}
                    onChange={(e) => {
                      setFormData((prev) => ({ 
                        ...prev, 
                        descripcion: e.target.value,
                        description: e.target.value 
                      }))
                      if (errors.description) setErrors((prev) => ({ ...prev, description: "" }))
                    }}
                    placeholder="Describe las responsabilidades y alcance de este rol"
                    className={errors.description ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: checked,
                        estado: checked,
                        status: checked ? "Activo" : "Inactivo",
                      }))
                    }
                  />
                  <Label htmlFor="isActive">Rol {formData.status}</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permisos" className="space-y-4">
              {isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando permisos...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {role && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Editando rol: {role.nombre}</h4>
                      <p className="text-sm text-blue-700">
                        Se muestran todos los permisos disponibles. Los que tienen el badge "Asignado" son los que actualmente tiene este rol.
                        Puedes seleccionar o deseleccionar cualquier privilegio para modificar los permisos del rol.
                      </p>
                    </div>
                  )}
                  
                  {errors.privileges && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errors.privileges}</p>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {permissions.map((permission) => (
                      <Card key={permission.permissionId}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.permissionId}`}
                              checked={isPermissionSelected(permission.permissionId)}
                              onCheckedChange={(checked) => handlePermissionToggle(permission.permissionId, checked as boolean)}
                              className={
                                isPermissionPartiallySelected(permission.permissionId) ? "data-[state=checked]:bg-orange-500" : ""
                              }
                            />
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {permission.permissionName}
                                {permission.module && (
                                  <Badge variant="outline" className="text-xs">
                                    {permission.module}
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-sm">{permission.permissionDescription}</CardDescription>
                            </div>
                            <Badge variant="outline">
                              {permission.privileges?.filter((p) => formData.privileges?.includes(p.id)).length || 0} /{" "}
                              {permission.privileges?.length || 0}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {permission.privileges?.map((privilege) => (
                              <div key={privilege.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`privilege-${privilege.id}`}
                                  checked={formData.privileges?.includes(privilege.id) || false}
                                  onCheckedChange={(checked) => handlePrivilegeChange(privilege.id, checked as boolean)}
                                />
                                <Label
                                  htmlFor={`privilege-${privilege.id}`}
                                  className="text-sm font-normal cursor-pointer flex-1"
                                >
                                  {privilege.name}
                                </Label>
                                {role && privilege.selected && (
                                  <Badge variant="secondary" className="text-xs">
                                    Asignado
                                  </Badge>
                                )}
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
          </div>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {formData.privileges && formData.privileges.length > 0 && (
              <span>
                {formData.privileges.length} privilegio{formData.privileges.length > 1 ? 's' : ''} seleccionado{formData.privileges.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {role ? "Actualizar" : "Crear"} Rol
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}