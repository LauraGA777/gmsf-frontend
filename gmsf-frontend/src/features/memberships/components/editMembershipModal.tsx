import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import type { Membership, MembershipFormData, ValidationErrors } from "@/shared/types/membership"

interface EditMembershipModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MembershipFormData) => void
  onDeactivate: () => void
  membership: Membership | null
  isNameUnique: (name: string, excludeId?: string) => boolean
}

export function EditMembershipModal({
  isOpen,
  onClose,
  onSubmit,
  onDeactivate,
  membership,
  isNameUnique,
}: EditMembershipModalProps) {
  const [formData, setFormData] = useState<MembershipFormData>({
    name: "",
    description: "",
    price: 0,
    accessDays: 0,
    validityDays: 0,
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (membership) {
      setFormData({
        name: membership.name,
        description: membership.description,
        price: membership.price,
        accessDays: membership.accessDays,
        validityDays: membership.validityDays,
      })
    }
  }, [membership])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    } else if (!isNameUnique(formData.name, membership?.id)) {
      newErrors.name = "Ya existe una membresía con este nombre"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
    }

    if (formData.accessDays <= 0) {
      newErrors.accessDays = "Los días de acceso deben ser mayor a 0"
    }

    if (formData.validityDays <= 0) {
      newErrors.validityDays = "Los días de vigencia deben ser mayor a 0"
    }

    if (formData.validityDays < formData.accessDays) {
      newErrors.validityDays = "Los días de vigencia deben ser mayor o igual a los días de acceso"
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
    setErrors({})
    onClose()
  }

  if (!membership) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Membresía</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accessDays">Días de Acceso *</Label>
              <Input
                id="accessDays"
                type="number"
                min="1"
                value={formData.accessDays}
                onChange={(e) => setFormData({ ...formData, accessDays: Number.parseInt(e.target.value) || 0 })}
                className={errors.accessDays ? "border-red-500" : ""}
              />
              {errors.accessDays && <p className="text-red-500 text-sm mt-1">{errors.accessDays}</p>}
            </div>

            <div>
              <Label htmlFor="validityDays">Días de Vigencia *</Label>
              <Input
                id="validityDays"
                type="number"
                min="1"
                value={formData.validityDays}
                onChange={(e) => setFormData({ ...formData, validityDays: Number.parseInt(e.target.value) || 0 })}
                className={errors.validityDays ? "border-red-500" : ""}
              />
              {errors.validityDays && <p className="text-red-500 text-sm mt-1">{errors.validityDays}</p>}
              {formData.validityDays < formData.accessDays && (
                <p className="text-yellow-600 text-sm mt-1">⚠️ La vigencia es menor que los días de acceso</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {membership.isActive && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDeactivate}
                className="bg-red-600 hover:bg-red-700"
              >
                Desactivar
              </Button>
            )}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
