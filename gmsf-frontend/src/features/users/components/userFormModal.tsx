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
    tipoDocumento: "",
    numeroDocumento: "",
    nombre: "",
    apellido: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
    rol: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        contraseña: "",
        confirmarContraseña: "",
        rol: user.rol,
        fechaNacimiento: user.fechaNacimiento,
        telefono: user.telefono || "",
        direccion: user.direccion || "",
      })
    } else {
      setFormData({
        tipoDocumento: "",
        numeroDocumento: "",
        nombre: "",
        apellido: "",
        correo: "",
        contraseña: "",
        confirmarContraseña: "",
        rol: "",
        fechaNacimiento: "",
        telefono: "",
        direccion: "",
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.tipoDocumento) newErrors.tipoDocumento = "Tipo de documento es requerido"
    if (!formData.numeroDocumento) newErrors.numeroDocumento = "Número de documento es requerido"
    if (!formData.nombre || formData.nombre.length < 3) newErrors.nombre = "Nombre debe tener al menos 3 caracteres"
    if (!formData.apellido || formData.apellido.length < 3)
      newErrors.apellido = "Apellido debe tener al menos 3 caracteres"
    if (!formData.correo) newErrors.correo = "Correo es requerido"
    if (!formData.rol) newErrors.rol = "Rol es requerido"
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Fecha de nacimiento es requerida"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.correo && !emailRegex.test(formData.correo)) {
      newErrors.correo = "Formato de correo inválido"
    }

    // Check unique email
    const emailExists = existingUsers.some((u) => u.correo === formData.correo && (!user || u.id !== user.id))
    if (emailExists) {
      newErrors.correo = "Correo ya registrado"
    }

    // Check unique document
    const documentExists = existingUsers.some(
      (u) => u.numeroDocumento === formData.numeroDocumento && (!user || u.id !== user.id),
    )
    if (documentExists) {
      newErrors.numeroDocumento = "Número de documento ya registrado"
    }

    // Password validation (only for new users or when changing password)
    if (!user || formData.contraseña) {
      if (!formData.contraseña) newErrors.contraseña = "Contraseña es requerida"
      if (!formData.confirmarContraseña) newErrors.confirmarContraseña = "Confirmar contraseña es requerida"
      if (formData.contraseña !== formData.confirmarContraseña) {
        newErrors.confirmarContraseña = "Las contraseñas no coinciden"
      }
    }

    // Age validation for trainers
    if (formData.rol === "Entrenador" && formData.fechaNacimiento) {
      const birthDate = new Date(formData.fechaNacimiento)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 18) {
        newErrors.fechaNacimiento = "Los entrenadores deben ser mayores de 18 años"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      onSave(formData)

      await Swal.fire({
        title: "¡Éxito!",
        text: `Usuario ${user ? "actualizado" : "registrado"} correctamente`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })

      onClose()
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al guardar el usuario",
        icon: "error",
        confirmButtonColor: "#000000",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
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
          {/* Document Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
              <Select
                value={formData.tipoDocumento}
                onValueChange={(value) => handleInputChange("tipoDocumento", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  <SelectItem value="TE">Tarjeta de Extranjería</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoDocumento && <p className="text-red-500 text-xs mt-1">{errors.tipoDocumento}</p>}
            </div>

            <div>
              <Label htmlFor="numeroDocumento">Número de Documento *</Label>
              <Input
                id="numeroDocumento"
                type="text"
                value={formData.numeroDocumento}
                onChange={(e) => handleInputChange("numeroDocumento", e.target.value)}
                placeholder="Ingrese número de documento"
              />
              {errors.numeroDocumento && <p className="text-red-500 text-xs mt-1">{errors.numeroDocumento}</p>}
            </div>
          </div>

          {/* Name Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ingrese nombre"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <Label htmlFor="apellido">Apellido *</Label>
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
            <Label htmlFor="correo">Correo Electrónico *</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => handleInputChange("correo", e.target.value)}
              placeholder="ejemplo@correo.com"
            />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
          </div>

          {/* Password Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contraseña">
                Contraseña {!user && "*"}
                {user && <span className="text-xs text-gray-500">(dejar vacío para mantener actual)</span>}
              </Label>
              <Input
                id="contraseña"
                type="password"
                value={formData.contraseña}
                onChange={(e) => handleInputChange("contraseña", e.target.value)}
                placeholder="Ingrese contraseña"
              />
              {errors.contraseña && <p className="text-red-500 text-xs mt-1">{errors.contraseña}</p>}
            </div>

            <div>
              <Label htmlFor="confirmarContraseña">Confirmar Contraseña {!user && "*"}</Label>
              <Input
                id="confirmarContraseña"
                type="password"
                value={formData.confirmarContraseña}
                onChange={(e) => handleInputChange("confirmarContraseña", e.target.value)}
                placeholder="Confirme contraseña"
              />
              {errors.confirmarContraseña && <p className="text-red-500 text-xs mt-1">{errors.confirmarContraseña}</p>}
            </div>
          </div>

          {/* Role and Birth Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rol">Rol *</Label>
              <Select value={formData.rol} onValueChange={(value) => handleInputChange("rol", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Entrenador">Entrenador</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Beneficiario">Beneficiario</SelectItem>
                </SelectContent>
              </Select>
              {errors.rol && <p className="text-red-500 text-xs mt-1">{errors.rol}</p>}
            </div>

            <div>
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
              />
              {errors.fechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento}</p>}
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              placeholder="Ingrese numero de telefono"
            />
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
