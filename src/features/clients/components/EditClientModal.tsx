import type React from "react"
import { useState } from "react"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Label } from "@/shared/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { DatePicker } from "@/shared/components/date-picker"
import { User, Mail, Phone, Home, UserPlus, AlertTriangle, MapPin, FileText } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import Swal from "sweetalert2"
import type { Client } from "@/shared/types"
import { Badge } from "@/shared/components/badge"
import { Checkbox } from "@/shared/components/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"
import { format } from "date-fns"

interface EditClientModalProps {
  client: Client
  onUpdateClient: (clientId: string, updates: Partial<Client>) => void
  onClose: () => void
}

export function EditClientModal({ client, onUpdateClient, onClose }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    name: client.name || "",
    email: client.email || "",
    phone: client.phone || "",
    documentType: client.documentType || "C.C.",
    documentNumber: client.documentNumber || "",
    address: client.address || "",
    birthdate: client.birthdate ? new Date(client.birthdate) : undefined,
    emergencyContact: client.emergencyContact || "",
    emergencyPhone: client.emergencyPhone || "",
    isBeneficiary: client.isBeneficiary !== false, // Si es undefined o true, se considera true
    beneficiaryRelation: client.beneficiaryRelation || "",
    beneficiaryName: client.beneficiaryName || "",
    beneficiaryDocumentType: client.beneficiaryDocumentType || "C.C.",
    beneficiaryDocumentNumber: client.beneficiaryDocumentNumber || "",
    beneficiaryPhone: client.beneficiaryPhone || "",
    beneficiaryEmail: client.beneficiaryEmail || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error cuando el usuario selecciona un valor
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (formData.phone && !/^\d{7,10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "El teléfono debe tener entre 7 y 10 dígitos"
    }

    if (formData.documentNumber && !/^\d{6,12}$/.test(formData.documentNumber.replace(/\D/g, ""))) {
      newErrors.documentNumber = "El documento debe tener entre 6 y 12 dígitos"
    }

    // Validar campos del beneficiario si el cliente no es el beneficiario
    if (formData.isBeneficiary === false) {
      if (!formData.beneficiaryRelation) {
        newErrors.beneficiaryRelation = "Debe seleccionar la relación con el beneficiario"
      }

      if (!formData.beneficiaryName?.trim()) {
        newErrors.beneficiaryName = "El nombre del beneficiario es obligatorio"
      }

      if (formData.beneficiaryEmail && !/\S+@\S+\.\S+/.test(formData.beneficiaryEmail)) {
        newErrors.beneficiaryEmail = "El correo electrónico del beneficiario no es válido"
      }

      if (formData.beneficiaryPhone && !/^\d{7,10}$/.test(formData.beneficiaryPhone.replace(/\D/g, ""))) {
        newErrors.beneficiaryPhone = "El teléfono del beneficiario debe tener entre 7 y 10 dígitos"
      }

      if (
        formData.beneficiaryDocumentNumber &&
        !/^\d{6,12}$/.test(formData.beneficiaryDocumentNumber.replace(/\D/g, ""))
      ) {
        newErrors.beneficiaryDocumentNumber = "El número de documento debe tener entre 6 y 12 dígitos"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        title: "Error",
        text: "Por favor, completa todos los campos obligatorios correctamente",
        icon: "error",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      })
      return
    }

    setIsProcessing(true)

    // Simular un pequeño retraso para mostrar el estado de procesamiento
    setTimeout(() => {
      // Convertir la fecha de nacimiento a objeto Date si existe
      const updates: Partial<Client> = {
        ...formData,
        birthdate: formData.birthdate,
      }

      onUpdateClient(client.id, updates)

      Swal.fire({
        title: "Cliente actualizado",
        text: "Los datos del cliente han sido actualizados exitosamente",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      })

      setIsProcessing(false)
      onClose()
    }, 500)
  }

  return (
    <div className="p-4 w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Editar Cliente</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 mb-3">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="emergency">Contacto Emergencia</TabsTrigger>
            <TabsTrigger value="membership">Membresía</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Información personal */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-sm">Información Personal</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name" className="text-xs font-medium">
                      Nombre completo <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={cn("pl-8 h-8 text-sm", errors.name ? "border-red-300" : "")}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={cn("pl-8 h-8 text-sm", errors.email ? "border-red-300" : "")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs font-medium">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={cn("pl-8 h-8 text-sm", errors.phone ? "border-red-300" : "")}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de identificación */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-sm">Identificación</h3>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="documentType" className="text-xs font-medium">
                        Tipo
                      </Label>
                      <Select
                        value={formData.documentType}
                        onValueChange={(value) => handleSelectChange("documentType", value)}
                      >
                        <SelectTrigger id="documentType" className="h-8 text-sm">
                          <SelectValue placeholder="Tipo" className="h-8 text-sm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">CC</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="documentNumber" className="text-xs font-medium">
                        Número de documento
                      </Label>
                      <div className="relative">
                        <FileText className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                        <Input
                          id="documentNumber"
                          name="documentNumber"
                          value={formData.documentNumber}
                          onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            handleChange({ ...e, target: { ...e.target, name: "documentNumber", value } })
                          }}
                          className={cn("pl-8 h-8 text-sm", errors.documentNumber ? "border-red-300" : "")}
                        />
                      </div>
                      {errors.documentNumber && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" /> {errors.documentNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <DatePicker
                      date={formData.birthdate}
                      setDate={(date) => setFormData((prev) => ({ ...prev, birthdate: date }))}
                      label="Fecha de nacimiento"
                      placeholder="Seleccionar fecha"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      subtitle="Seleccione año, mes y día"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-xs font-medium">
                      Dirección
                    </Label>
                    <div className="relative">
                      <Home className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-3">
            {/* Información de contacto de emergencia */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">Contacto de Emergencia</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="emergencyContact" className="text-xs font-medium">
                    Nombre del contacto
                  </Label>
                  <div className="relative">
                    <User className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergencyPhone" className="text-xs font-medium">
                    Teléfono de emergencia
                  </Label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => {
                        // Solo permitir números
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        handleChange({ ...e, target: { ...e.target, name: "emergencyPhone", value } })
                      }}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox
                    id="isSelfBeneficiary"
                    checked={formData.isBeneficiary !== false}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => ({
                        ...prev,
                        isBeneficiary: checked === true,
                        // Limpiar datos del beneficiario si el cliente es el beneficiario
                        ...(checked === true
                          ? {
                            beneficiaryName: undefined,
                            beneficiaryRelation: undefined,
                            beneficiaryDocumentType: undefined,
                            beneficiaryDocumentNumber: undefined,
                            beneficiaryPhone: undefined,
                            beneficiaryEmail: undefined,
                          }
                          : {}),
                      }))
                    }}
                  />
                  <Label htmlFor="isSelfBeneficiary" className="text-xs font-medium">
                    ¿Es usted mismo el beneficiario?
                  </Label>
                </div>
              </div>

              {formData.isBeneficiary === false && (
                <div className="space-y-2 mt-2 border-t pt-2">
                  <h4 className="text-xs font-medium text-gray-700">Información del Beneficiario</h4>

                  <div>
                    <Label htmlFor="beneficiaryRelation" className="text-xs font-medium">
                      Relación con el beneficiario <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.beneficiaryRelation || ""}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, beneficiaryRelation: value }))}
                    >
                      <SelectTrigger
                        id="beneficiaryRelation"
                        className={cn("mt-1 h-8 text-sm", errors.beneficiaryRelation ? "border-red-500" : "")}
                      >
                        <SelectValue placeholder="Seleccionar relación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Familiar">Familiar</SelectItem>
                        <SelectItem value="Amigo">Amigo</SelectItem>
                        <SelectItem value="Pareja">Pareja</SelectItem>
                        <SelectItem value="Compañero de trabajo">Compañero de trabajo</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.beneficiaryRelation && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.beneficiaryRelation}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="beneficiaryName" className="text-xs font-medium">
                      Nombre del beneficiario <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                      <Input
                        id="beneficiaryName"
                        value={formData.beneficiaryName || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, beneficiaryName: e.target.value }))}
                        className={cn("pl-8 mt-1 h-8 text-sm", errors.beneficiaryName ? "border-red-500" : "")}
                        placeholder="Nombre completo"
                      />
                    </div>
                    {errors.beneficiaryName && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> {errors.beneficiaryName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="beneficiaryDocumentType" className="text-xs font-medium">
                        Tipo de documento
                      </Label>
                      <Select
                        value={formData.beneficiaryDocumentType || "CC"}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, beneficiaryDocumentType: value }))}
                      >
                        <SelectTrigger id="beneficiaryDocumentType" className="mt-1 h-8 text-sm">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">CC</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="beneficiaryDocumentNumber" className="text-xs font-medium">
                        Número de documento
                      </Label>
                      <div className="relative">
                        <FileText className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                        <Input
                          id="beneficiaryDocumentNumber"
                          value={formData.beneficiaryDocumentNumber || ""}
                          onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            setFormData((prev) => ({ ...prev, beneficiaryDocumentNumber: value }))
                          }}
                          className={cn(
                            "pl-8 mt-1 h-8 text-sm",
                            errors.beneficiaryDocumentNumber ? "border-red-500" : "",
                          )}
                          placeholder="Número de documento"
                        />
                      </div>
                      {errors.beneficiaryDocumentNumber && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" /> {errors.beneficiaryDocumentNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="beneficiaryPhone" className="text-xs font-medium">
                        Teléfono
                      </Label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                        <Input
                          id="beneficiaryPhone"
                          value={formData.beneficiaryPhone || ""}
                          onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            setFormData((prev) => ({ ...prev, beneficiaryPhone: value }))
                          }}
                          className={cn("pl-8 mt-1 h-8 text-sm", errors.beneficiaryPhone ? "border-red-500" : "")}
                          placeholder="Teléfono de contacto"
                        />
                      </div>
                      {errors.beneficiaryPhone && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" /> {errors.beneficiaryPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="beneficiaryEmail" className="text-xs font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-gray-400 absolute left-2 top-2" />
                        <Input
                          id="beneficiaryEmail"
                          type="email"
                          value={formData.beneficiaryEmail || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, beneficiaryEmail: e.target.value }))}
                          className={cn("pl-8 mt-1 h-8 text-sm", errors.beneficiaryEmail ? "border-red-500" : "")}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      {errors.beneficiaryEmail && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" /> {errors.beneficiaryEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="membership" className="space-y-3">
            {/* Información de membresía */}
            {client.membershipType && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-sm">Información de Membresía</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Tipo de Membresía</p>
                    <Badge className="mt-1 bg-blue-100 text-blue-800 border-blue-200">{client.membershipType}</Badge>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium">Estado</p>
                    <Badge
                      className={`mt-1 ${client.status === "Activo" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
                    >
                      {client.status}
                    </Badge>
                  </div>

                  {client.membershipEndDate && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 font-medium">Fecha de Vencimiento</p>
                      <p className="text-sm font-medium mt-1">
                        {format(new Date(client.membershipEndDate), "dd/MM/yyyy")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        La información de membresía se actualiza a través de los contratos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-3 border-t mt-3">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button type="submit" className="bg-black hover:bg-gray-800" disabled={isProcessing} size="sm">
            {isProcessing ? "Procesando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
