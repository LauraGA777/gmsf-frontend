"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { Calendar } from "@/shared/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, Save, User, Mail, Phone, CalendarIcon, Check, FileText, MapPin, Dumbbell } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import Swal from "sweetalert2"
import type { Trainer } from "@/shared/types/trainer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { trainerService } from "../services/trainerService"

interface TrainerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (trainer: Omit<Trainer, "id">) => void
  trainer?: Trainer
  title: string
}

// Validación de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validación de teléfono
const isValidPhone = (phone: string): boolean => {
  return /^\d{7,10}$/.test(phone)
}

// Validación de documento
const isValidDocument = (doc: string): boolean => {
  return /^\d{6,12}$/.test(doc)
}

export function TrainerModal({ isOpen, onClose, onSave, trainer, title }: TrainerModalProps) {
  // Datos personales
  const [documentType, setDocumentType] = useState(trainer?.documentType || "CC")
  const [documentNumber, setDocumentNumber] = useState(trainer?.documentNumber || "")
  const [name, setName] = useState(trainer?.name || "")
  const [lastName, setLastName] = useState(trainer?.lastName || "")
  const [email, setEmail] = useState(trainer?.email || "")
  const [phone, setPhone] = useState(trainer?.phone || "")
  const [address, setAddress] = useState(trainer?.address || "")
  const [gender, setGender] = useState(trainer?.gender || "M")
  const [birthDate, setBirthDate] = useState<Date>(trainer?.birthDate ? new Date(trainer.birthDate) : new Date())

  // Datos profesionales
  const [specialty, setSpecialty] = useState(trainer?.specialty || "")
  const [hireDate, setHireDate] = useState<Date>(trainer?.hireDate ? new Date(trainer.hireDate) : new Date())
  const [isActive, setIsActive] = useState(trainer?.isActive !== false)

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [userFound, setUserFound] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  // Reiniciar el formulario cuando cambia el entrenador
  useEffect(() => {
    if (trainer) {
      // Si estamos editando, carga los datos del entrenador
      setDocumentType(trainer.documentType || "CC")
      setDocumentNumber(trainer.documentNumber || "")
      setName(trainer.name || "")
      setLastName(trainer.lastName || "")
      setEmail(trainer.email || "")
      setPhone(trainer.phone || "")
      setAddress(trainer.address || "")
      setGender(trainer.gender || "M")
      setBirthDate(trainer.birthDate ? new Date(trainer.birthDate) : new Date())
      setSpecialty(trainer.specialty || "")
      setHireDate(trainer.hireDate ? new Date(trainer.hireDate) : new Date())
      setIsActive(trainer.isActive !== false)
    } else {
      // Si estamos creando, reinicia completamente el formulario
      setDocumentType("CC")
      setDocumentNumber("")
      setName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setAddress("")
      setGender("M")
      setBirthDate(new Date())
      setSpecialty("")
      setHireDate(new Date())
      setIsActive(true)
    }
    setErrors({})
    setUserFound(false)
  }, [trainer, isOpen]) // Añade isOpen como dependencia para que se reinicie al abrir el modal

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!documentNumber) {
      newErrors.documentNumber = "El número de documento es obligatorio"
    } else if (!isValidDocument(documentNumber)) {
      newErrors.documentNumber = "El número de documento debe tener entre 6 y 12 dígitos"
    }

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio"
    }

    if (!email) {
      newErrors.email = "El correo electrónico es obligatorio"
    } else if (!isValidEmail(email)) {
      newErrors.email = "El correo electrónico no es válido"
    }

    if (!phone) {
      newErrors.phone = "El teléfono es obligatorio"
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "El teléfono debe tener entre 7 y 10 dígitos"
    }

    if (!address.trim()) {
      newErrors.address = "La dirección es obligatoria"
    }

    if (!specialty) {
      newErrors.specialty = "La especialidad es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerifyDocument = async () => {
    if (!documentNumber || !isValidDocument(documentNumber)) {
      setErrors({
        ...errors,
        documentNumber: "El número de documento debe tener entre 6 y 12 dígitos",
      })
      return
    }

    setIsVerifying(true)

    try {
      // Verificar el documento usando el servicio
      const trainerData = await trainerService.verifyDocument(documentNumber)

      if (trainerData) {
        setName(trainerData.name || "")
        setLastName(trainerData.lastName || "")
        setEmail(trainerData.email || "")
        setPhone(trainerData.phone || "")
        setAddress(trainerData.address || "")
        setGender(trainerData.gender || "M")
        setBirthDate(trainerData.birthDate || new Date())
        setSpecialty(trainerData.specialty || "")
        setUserFound(true)

        Swal.fire({
          title: "Usuario encontrado",
          text: `Se ha encontrado a ${trainerData.name} ${trainerData.lastName} en el sistema.`,
          icon: "success",
          confirmButtonColor: "#000",
          confirmButtonText: "Continuar",
          timer: 5000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
        })
      } else {
        setUserFound(false)

        Swal.fire({
          title: "Usuario no encontrado",
          text: "No se encontró ningún usuario con ese documento. Por favor complete los datos manualmente.",
          icon: "info",
          confirmButtonColor: "#000",
          confirmButtonText: "Entendido",
          timer: 5000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
        })
      }
    } catch (error) {
      console.error("Error verificando documento:", error)
      Swal.fire({
        title: "Error",
        text: "Error al verificar el documento. Intente nuevamente.",
        icon: "error",
        confirmButtonColor: "#000",
        confirmButtonText: "Cerrar",
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos obligatorios correctamente",
        icon: "error",
        confirmButtonColor: "#000",
        confirmButtonText: "Cerrar",
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
      })
      return
    }

    setIsProcessing(true)

    try {
      // Crear objeto de entrenador
      const trainerData: Omit<Trainer, "id"> = {
        name,
        lastName,
        email,
        phone,
        address,
        gender,
        documentType,
        documentNumber,
        birthDate,
        specialty,
        bio: trainer?.bio || "",
        hireDate,
        isActive,
        services: trainer?.services || [],
      }

      // Llamar a la función onSave que maneja la creación/actualización
      await onSave(trainerData)

      // Mostrar mensaje de éxito
      Swal.fire({
        title: trainer ? "Entrenador actualizado" : "Entrenador creado",
        text: trainer ? "El entrenador ha sido actualizado exitosamente" : "El entrenador ha sido creado exitosamente",
        icon: "success",
        confirmButtonColor: "#000",
        confirmButtonText: "Cerrar",
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
      })

      // Cerrar el modal
      onClose()
    } catch (error) {
      console.error("Error saving trainer:", error)
      Swal.fire({
        title: "Error",
        text: error.message || "Error al guardar el entrenador",
        icon: "error",
        confirmButtonColor: "#000",
        confirmButtonText: "Cerrar",
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="personal">Información Personal</TabsTrigger>
              <TabsTrigger value="professional">Información Profesional</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="documentType" className="text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento
                  </Label>
                  <Select value={documentType} onValueChange={(value) => setDocumentType(value)}>
                    <SelectTrigger id="documentType" className="w-full">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">CC</SelectItem>
                      <SelectItem value="TI">TI</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="documentNumber" className="text-sm font-medium text-gray-700 mb-1">
                    Número de Documento <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="documentNumber"
                        name="documentNumber"
                        value={documentNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "")
                          setDocumentNumber(value)
                          if (errors.documentNumber) {
                            setErrors({ ...errors, documentNumber: "" })
                          }
                        }}
                        className={cn("pl-9", errors.documentNumber ? "border-red-500" : "")}
                        placeholder="Número de documento"
                      />
                      <FileText className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyDocument}
                      disabled={!documentNumber || documentNumber.length < 6 || isVerifying}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isVerifying ? "Verificando..." : "Verificar"}
                    </Button>
                  </div>
                  {errors.documentNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.documentNumber}
                    </p>
                  )}
                  {userFound && (
                    <p className="text-green-600 text-xs mt-1 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Usuario encontrado. Información cargada.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) {
                          setErrors({ ...errors, name: "" })
                        }
                      }}
                      className={cn("pl-9", errors.name ? "border-red-500" : "")}
                      placeholder="Nombre"
                    />
                    <User className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value)
                        if (errors.lastName) {
                          setErrors({ ...errors, lastName: "" })
                        }
                      }}
                      className={cn("pl-9", errors.lastName ? "border-red-500" : "")}
                      placeholder="Apellido"
                    />
                    <User className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) {
                          setErrors({ ...errors, email: "" })
                        }
                      }}
                      className={cn("pl-9", errors.email ? "border-red-500" : "")}
                      placeholder="correo@ejemplo.com"
                    />
                    <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setPhone(value)
                        if (errors.phone) {
                          setErrors({ ...errors, phone: "" })
                        }
                      }}
                      className={cn("pl-9", errors.phone ? "border-red-500" : "")}
                      placeholder="Teléfono"
                    />
                    <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      if (errors.address) {
                        setErrors({ ...errors, address: "" })
                      }
                    }}
                    className={cn("pl-9", errors.address ? "border-red-500" : "")}
                    placeholder="Dirección"
                  />
                  <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-1">
                    Género
                  </Label>
                  <Select value={gender} onValueChange={(value) => setGender(value)}>
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !birthDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={(date) => date && setBirthDate(date)}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={() => setActiveTab("professional")}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Siguiente
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty" className="text-sm font-medium text-gray-700 mb-1">
                    Especialidad <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="specialty"
                      name="specialty"
                      value={specialty}
                      onChange={(e) => {
                        setSpecialty(e.target.value)
                        if (errors.specialty) {
                          setErrors({ ...errors, specialty: "" })
                        }
                      }}
                      className={cn(errors.specialty ? "border-red-500" : "")}
                      placeholder="Ingrese la especialidad"
                    />
                  </div>
                  {errors.specialty && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.specialty}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hireDate" className="text-sm font-medium text-gray-700 mb-1">
                    Fecha de Registro
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !hireDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {hireDate ? format(hireDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={hireDate}
                        onSelect={(date) => date && setHireDate(date)}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Estado
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <span className={cn("text-sm", isActive ? "text-green-600" : "text-red-600")}>
                    {isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("personal")}>
                  Anterior
                </Button>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-black hover:bg-gray-800" disabled={isProcessing}>
                    {isProcessing ? (
                      <>Procesando...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {trainer ? "Actualizar" : "Guardar"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}
