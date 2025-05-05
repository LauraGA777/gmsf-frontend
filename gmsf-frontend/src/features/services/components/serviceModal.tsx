"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { AlertCircle, Save, X, FileText, DollarSign, Clock } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import Swal from "sweetalert2"
import type { Service } from "@/shared/types/service"

interface ServiceModalProps {
  isOpen: boolean
  service?: Service
  onSave: (service: Omit<Service, "id">) => void
  onClose: () => void
  title: string
}

export function ServiceModal({ isOpen, service, onSave, onClose, title }: ServiceModalProps) {
  // Asegurar que al editar, la información existente se cargue por defecto
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [status, setStatus] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Cargar datos del servicio cuando se abre el modal para editar
  useEffect(() => {
    if (service) {
      // Si estamos editando, carga los datos del servicio
      setName(service.name || "")
      setDescription(service.description || "")
      setPrice(service.price?.toString() || "")
      setDuration(service.duration?.toString() || "")
      setStatus(service.isActive !== false)
    } else {
      // Si estamos creando, reinicia completamente el formulario
      setName("")
      setDescription("")
      setPrice("")
      setDuration("")
      setStatus(true)
    }
    setErrors({})
  }, [service, isOpen]) // Añade isOpen como dependencia para que se reinicie al abrir el modal

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "El nombre del servicio es obligatorio"
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    if (!price) {
      newErrors.price = "El precio es obligatorio"
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "El precio debe ser un número válido mayor o igual a cero"
    }

    if (!duration) {
      newErrors.duration = "La duración es obligatoria"
    } else if (isNaN(Number(duration)) || Number(duration) <= 0) {
      newErrors.duration = "La duración debe ser un número válido mayor a cero"
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

    // Create service object
    const serviceData: Omit<Service, "id"> = {
      name,
      description,
      price: Number(price),
      duration: Number(duration),
      isActive: status,
    }

    // Simulate API call delay
    setTimeout(() => {
      onSave(serviceData)
      setIsProcessing(false)

      Swal.fire({
        title: service ? "Servicio actualizado" : "Servicio creado",
        text: service ? "El servicio ha sido actualizado exitosamente" : "El servicio ha sido creado exitosamente",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 2000,
        timerProgressBar: true,
      })
    }, 600)
  }

  // Actualiza la función formatCurrency
  const formatCurrency = (value: string) => {
    // Elimina caracteres no numéricos
    const numericValue = value.replace(/[^0-9]/g, "")

    if (!numericValue) return ""

    // Formatea con separador de miles y sin decimales
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(numericValue))
  }

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store only numeric value
    const numericValue = e.target.value.replace(/[^0-9]/g, "")
    setPrice(numericValue)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn("pl-9 h-9", errors.name && "border-red-500")}
                  placeholder="Nombre del servicio"
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
                placeholder="Descripción detallada del servicio"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="price"
                    value={price ? formatCurrency(price) : ""}
                    onChange={handlePriceChange}
                    className={cn("pl-9 h-9", errors.price && "border-red-500")}
                    placeholder="Precio del servicio"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duración (minutos) <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={cn("pl-9 h-9", errors.duration && "border-red-500")}
                    placeholder="Duración en minutos"
                  />
                </div>
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.duration}
                  </p>
                )}
              </div>
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
                    {service ? "Actualizar" : "Guardar"}
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
