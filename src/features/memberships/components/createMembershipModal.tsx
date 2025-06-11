import type React from "react"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import type { MembershipFormData, ValidationErrors } from "@/shared/types/membership"

interface CreateMembershipModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MembershipFormData) => void
}

export function CreateMembershipModal({ isOpen, onClose, onSubmit }: CreateMembershipModalProps) {
  const [formData, setFormData] = useState<MembershipFormData>({
    nombre: "",
    descripcion: "",
    precio: 0,
    dias_acceso: 0,
    vigencia_dias: 0,
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria"
    }

    if (formData.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0"
    }

    if (formData.dias_acceso <= 0) {
      newErrors.dias_acceso = "Los días de acceso deben ser mayor a 0"
    }

    if (formData.vigencia_dias <= 0) {
      newErrors.vigencia_dias = "Los días de vigencia deben ser mayor a 0"
    }

    if (formData.vigencia_dias < formData.dias_acceso) {
      newErrors.vigencia_dias = "Los días de vigencia deben ser mayor o igual a los días de acceso"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      dias_acceso: 0,
      vigencia_dias: 0,
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Membresía</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Nombre de la membresía"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la membresía"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className={errors.descripcion ? "border-red-500" : ""}
              rows={3}
            />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
          </div>

          <div>
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Precio de la membresía"
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir números y un punto decimal
                if (/^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, precio: value === '' ? 0 : Number(value) });
                }
              }}
              value={formData.precio === 0 ? '' : formData.precio}
              className={errors.precio ? "border-red-500" : ""}
            />
            {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accessDays">Días de Acceso *</Label>
              <Input
                id="accessDays"
                type="number"
                min="1"
                placeholder="Días de acceso"
                onChange={(e) => setFormData({ ...formData, dias_acceso: Number.parseInt(e.target.value) || 0 })}
                className={errors.dias_acceso ? "border-red-500" : ""}
              />
              {errors.dias_acceso && <p className="text-red-500 text-sm mt-1">{errors.dias_acceso}</p>}
            </div>

            <div>
              <Label htmlFor="validityDays">Días de Vigencia *</Label>
              <Input
                id="validityDays"
                type="number"
                min="1"
                placeholder="Días de vigencia"
                onChange={(e) => setFormData({ ...formData, vigencia_dias: Number.parseInt(e.target.value) || 0 })}
                className={errors.vigencia_dias ? "border-red-500" : ""}
              />
              {errors.vigencia_dias && <p className="text-red-500 text-sm mt-1">{errors.vigencia_dias}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
