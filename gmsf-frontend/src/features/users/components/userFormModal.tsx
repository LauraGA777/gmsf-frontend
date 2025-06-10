import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import Swal from "sweetalert2"
import type { User, UserFormData } from "../types/user"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: UserFormData) => void
  user?: User | null
  existingUsers: User[]
}

export function UserFormModal({ isOpen, onClose, onSave, user, existingUsers }: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    tipo_documento: "",
    numero_documento: "",
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    id_rol: 0,
    fecha_nacimiento: "",
    telefono: "",
    direccion: "",
    genero: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        tipo_documento: user.tipo_documento,
        numero_documento: user.numero_documento,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        contrasena: "",
        confirmarContrasena: "",
        id_rol: user.id_rol,
        fecha_nacimiento: user.fecha_nacimiento,
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        genero: user.genero || ""
      })
    } else {
      setFormData({
        tipo_documento: "",
        numero_documento: "",
        nombre: "",
        apellido: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        id_rol: 0,
        fecha_nacimiento: "",
        telefono: "",
        direccion: "",
        genero: ""
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validación del código (solo para nuevos usuarios)
    if (!user && !formData.codigo) {
      newErrors.codigo = "El código es requerido"
    } else if (!user && !/^U\d{3}$/.test(formData.codigo || '')) {
      newErrors.codigo = "El código debe seguir el formato U seguido de 3 dígitos (ej: U001)"
    }

    // Validación del teléfono
    if (formData.telefono && !/^\d{7,15}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe tener entre 7 y 15 dígitos"
    }

    // Validación del género
    if (formData.genero && !['M', 'F', 'O'].includes(formData.genero)) {
      newErrors.genero = "El género debe ser M, F u O"
    }

    // Validación del tipo de documento
    if (formData.tipo_documento && !['CC', 'CE', 'TI', 'PP', 'DIE'].includes(formData.tipo_documento)) {
      newErrors.tipo_documento = "Tipo de documento inválido"
    }

    // Validación del número de documento
    if (formData.numero_documento && (formData.numero_documento.length < 5 || formData.numero_documento.length > 20)) {
      newErrors.numero_documento = "El número de documento debe tener entre 5 y 20 caracteres"
    }

    // Validación de la fecha de nacimiento
    if (formData.fecha_nacimiento) {
      const birthDate = new Date(formData.fecha_nacimiento)
      if (isNaN(birthDate.getTime())) {
        newErrors.fecha_nacimiento = "Fecha de nacimiento inválida"
      }
    }

    // Validación del correo
    if (formData.correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo)) {
        newErrors.correo = "Formato de correo inválido"
      }
    }

    // Validación de nombre y apellido
    if (formData.nombre && formData.nombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres"
    }
    if (formData.apellido && formData.apellido.length < 3) {
      newErrors.apellido = "El apellido debe tener al menos 3 caracteres"
    }

    // Validación del rol
    if (formData.id_rol && ![1, 2, 3, 4].includes(formData.id_rol)) {
      newErrors.id_rol = "Rol inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Solo enviamos el código y los campos que tienen valor
      const userDataToSend = {
        codigo: user?.codigo,
        ...Object.fromEntries(
          Object.entries(formData)
            .filter(([key, value]) => {
              // Solo incluimos campos que tienen valor y no son el código o confirmarContrasena
              return value !== "" && value !== 0 && key !== 'codigo' && key !== 'confirmarContrasena';
            })
        )
      };

      onSave(userDataToSend)

      await Swal.fire({
        title: "¡Éxito!",
        text: "Usuario actualizado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })

      onClose()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al actualizar el usuario",
        icon: "error",
        confirmButtonColor: "#000000",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {user ? "Editar Usuario" : "Registrar Usuario"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código (solo para nuevos usuarios) */}
          {!user && (
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                placeholder="Ej: U001"
              />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>}
            </div>
          )}

          {/* Document Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Select
                value={formData.tipo_documento}
                onValueChange={(value) => handleInputChange("tipo_documento", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  <SelectItem value="PP">Pasaporte</SelectItem>
                  <SelectItem value="DIE">Documento de Identidad Extranjero</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_documento && <p className="text-red-500 text-xs mt-1">{errors.tipo_documento}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número de Documento</Label>
              <Input
                id="numero_documento"
                value={formData.numero_documento}
                onChange={(e) => handleInputChange("numero_documento", e.target.value)}
                placeholder="Ingrese el número de documento"
              />
              {errors.numero_documento && <p className="text-red-500 text-sm">{errors.numero_documento}</p>}
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => handleInputChange("fecha_nacimiento", e.target.value)}
              />
              {errors.fecha_nacimiento && <p className="text-red-500 text-sm">{errors.fecha_nacimiento}</p>}
            </div>
          )}

          {/* Name Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ingrese nombre"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                placeholder="Ingrese apellido"
              />
              {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => handleInputChange("correo", e.target.value)}
              placeholder="ejemplo@correo.com"
            />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
          </div>

          {/* Optional Fields */}
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              placeholder="Ingrese número de teléfono"
            />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
              placeholder="Ingrese dirección completa"
            />
          </div>

          {/* Role, Birth Date and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="id_rol">Rol</Label>
              <Select 
                value={formData.id_rol ? formData.id_rol.toString() : ""} 
                onValueChange={(value) => handleInputChange("id_rol", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Administrador</SelectItem>
                  <SelectItem value="2">Entrenador</SelectItem>
                  <SelectItem value="3">Cliente</SelectItem>
                  <SelectItem value="4">Beneficiario</SelectItem>
                </SelectContent>
              </Select>
              {errors.id_rol && <p className="text-red-500 text-xs mt-1">{errors.id_rol}</p>}
            </div>

            <div>
              <Label htmlFor="genero">Género</Label>
              <Select value={formData.genero} onValueChange={(value) => handleInputChange("genero", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="O">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.genero && <p className="text-red-500 text-xs mt-1">{errors.genero}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-black hover:bg-gray-800">
              {isSubmitting ? "Guardando..." : user ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
