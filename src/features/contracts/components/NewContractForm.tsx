import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Label } from "@/shared/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { Checkbox } from "@/shared/components/checkbox"
import { Calendar } from "@/shared/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/popover"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarIcon,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  FileText,
  Home,
  UserPlus,
  CreditCard,
  CalendarPlus2Icon as CalendarIcon2,
} from "lucide-react"
import { cn } from "@/shared/utils/utils"
import Swal from "sweetalert2"
import type { Client, Membership, Contract } from "@/shared/types"

interface NewContractFormProps {
  clients: Client[]
  memberships: Membership[]
  onAddClient: (client: Omit<Client, "id">) => string
  onAddContract: (contract: Omit<Contract, "id">) => void
  onClose: () => void
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

// Función para formatear precio en COP
const formatCOP = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function NewContractForm({ clients, memberships, onAddClient, onAddContract, onClose }: NewContractFormProps) {
  // Estado para el formulario
  const [documentType, setDocumentType] = useState<string>("C.C.")
  const [documentNumber, setDocumentNumber] = useState<string>("")
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined)
  const [emergencyContact, setEmergencyContact] = useState<string>("")
  const [emergencyPhone, setEmergencyPhone] = useState<string>("")
  const [membershipId, setMembershipId] = useState<string>("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isSelfBeneficiary, setIsSelfBeneficiary] = useState<boolean>(true)
  const [beneficiaryRelation, setBeneficiaryRelation] = useState<string>("")
  const [beneficiaryName, setBeneficiaryName] = useState<string>("")
  const [beneficiaryDocumentType, setBeneficiaryDocumentType] = useState<string>("C.C.")
  const [beneficiaryDocumentNumber, setBeneficiaryDocumentNumber] = useState<string>("")
  const [beneficiaryPhone, setBeneficiaryPhone] = useState<string>("")
  const [beneficiaryEmail, setBeneficiaryEmail] = useState<string>("")

  // Estado para controlar si el cliente existe
  const [clientExists, setClientExists] = useState<boolean>(false)
  const [existingClient, setExistingClient] = useState<Client | null>(null)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)

  // Estado para errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Relaciones disponibles
  const relations = ["Familiar", "Amigo", "Pareja", "Compañero de trabajo", "Otro"]

  // Efecto para calcular la fecha de fin según la membresía seleccionada
  useEffect(() => {
    if (membershipId && startDate) {
      const selectedMembership = memberships.find((m) => m.id.toString() === membershipId)
      if (selectedMembership) {
        const newEndDate = addDays(startDate, selectedMembership.duracion_dias)
        setEndDate(newEndDate)
      }
    }
  }, [membershipId, startDate, memberships])

  // Update the SweetAlert for client not found to ensure the button works properly
  const checkClientExists = () => {
    if (!documentNumber) return

    setIsVerifying(true)

    // Simulamos una pequeña demora para mostrar el estado de verificación
    setTimeout(() => {
      const found = clients.find(
        (client) => client.documentNumber === documentNumber && client.documentType === documentType,
      )

      if (found) {
        setClientExists(true)
        setExistingClient(found)
        setFirstName(found.name.split(" ")[0] || "")
        setLastName(found.name.split(" ").slice(1).join(" ") || "")
        setEmail(found.email || "")
        setPhone(found.phone || "")
        setAddress(found.address || "")
        setBirthdate(found.birthdate ? new Date(found.birthdate) : undefined)
        setEmergencyContact(found.emergencyContact || "")
        setEmergencyPhone(found.emergencyPhone || "")

        Swal.fire({
          title: "Cliente encontrado",
          text: `Se ha encontrado a ${found.name} en el sistema.`,
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        })
      } else {
        setClientExists(false)
        setExistingClient(null)
        // Limpiar campos si no existe
        setFirstName("")
        setLastName("")
        setEmail("")
        setPhone("")
        setAddress("")
        setBirthdate(undefined)
        setEmergencyContact("")
        setEmergencyPhone("")

        Swal.fire({
          title: "Cliente no encontrado",
          text: "No se encontró ningún cliente con ese documento. Por favor complete los datos para registrarlo.",
          icon: "info",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false
        })
      }

      setIsVerifying(false)
    }, 800)
  }

  // Validar el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!documentNumber) {
      newErrors.documentNumber = "El número de documento es obligatorio"
    } else if (!isValidDocument(documentNumber)) {
      newErrors.documentNumber = "El número de documento debe tener entre 6 y 12 dígitos"
    }

    if (!firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio"
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

    // Hacer obligatorio el campo de dirección
    if (!address.trim()) {
      newErrors.address = "La dirección es obligatoria"
    }

    // Hacer obligatorio el campo de fecha de nacimiento
    if (!birthdate) {
      newErrors.birthdate = "La fecha de nacimiento es obligatoria"
    }

    if (!membershipId) {
      newErrors.membershipId = "Debe seleccionar una membresía"
    }

    if (!startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria"
    }

    if (!isSelfBeneficiary) {
      if (!beneficiaryRelation) {
        newErrors.beneficiaryRelation = "Debe seleccionar la relación con el beneficiario"
      }

      if (!beneficiaryName.trim()) {
        newErrors.beneficiaryName = "El nombre del beneficiario es obligatorio"
      }

      if (beneficiaryEmail && !isValidEmail(beneficiaryEmail)) {
        newErrors.beneficiaryEmail = "El correo electrónico del beneficiario no es válido"
      }

      if (beneficiaryPhone && !isValidPhone(beneficiaryPhone)) {
        newErrors.beneficiaryPhone = "El teléfono del beneficiario debe tener entre 7 y 10 dígitos"
      }

      if (beneficiaryDocumentNumber && !isValidDocument(beneficiaryDocumentNumber)) {
        newErrors.beneficiaryDocumentNumber = "El número de documento debe tener entre 6 y 12 dígitos"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the SweetAlert for form validation errors to close after 5 seconds
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos obligatorios correctamente",
        icon: "error",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      })
      return
    }

    // Formatear el nombre completo
    const fullName = `${firstName} ${lastName}`.trim()

    // Obtener el ID del cliente (existente o nuevo)
    let clientId: string

    if (clientExists && existingClient) {
      clientId = existingClient.id
    } else {
      // Crear un nuevo cliente
      const newClient: Omit<Client, "id"> = {
        name: fullName,
        email,
        phone,
        documentType: documentType as "C.C." | "T.I." | "C.E." | "Pasaporte" | "Otro",
        documentNumber,
        address,
        birthdate,
        emergencyContact,
        emergencyPhone,
        membershipType: memberships.find((m) => m.id.toString() === membershipId)?.nombre || "",
        status: "Activo",
        membershipEndDate: endDate,
        isBeneficiary: isSelfBeneficiary,
        beneficiaryRelation: !isSelfBeneficiary ? beneficiaryRelation : undefined,
        beneficiaryName: !isSelfBeneficiary ? beneficiaryName : undefined,
        beneficiaryDocumentType: !isSelfBeneficiary
          ? (beneficiaryDocumentType as "C.C." | "T.I." | "C.E." | "Pasaporte" | "Otro")
          : undefined,
        beneficiaryDocumentNumber: !isSelfBeneficiary ? beneficiaryDocumentNumber : undefined,
        beneficiaryPhone: !isSelfBeneficiary ? beneficiaryPhone : undefined,
        beneficiaryEmail: !isSelfBeneficiary ? beneficiaryEmail : undefined,
      }

      clientId = onAddClient(newClient)
    }

    // Crear el nuevo contrato
    const selectedMembership = memberships.find((m) => m.id.toString() === membershipId)

    if (!selectedMembership) {
      Swal.fire({
        title: "Error",
        text: "No se pudo encontrar la membresía seleccionada",
        icon: "error",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      })
      return
    }

    const endDateValue = endDate || addDays(startDate, selectedMembership.duracion_dias);
    const currentDate = new Date();
    
    const newContract: Omit<Contract, "id"> = {
      id_cliente: Number.parseInt(clientId),
      id_membresia: Number.parseInt(membershipId),
      fecha_inicio: startDate,
      fecha_fin: endDateValue,
      estado: "Activo",
      cliente_nombre: fullName,
      membresia_nombre: selectedMembership.nombre,
      membresia_precio: selectedMembership.precio,
      cliente_documento: documentNumber,
      cliente_documento_tipo: documentType,
      precio_total: selectedMembership.precio,
      fecha_registro: currentDate,
    }

    // Llamar a la función para agregar el contrato 
    onAddContract(newContract)

    // Mostrar mensaje de éxito con más detalles
    Swal.fire({
      title: "¡Contrato creado!",
      html: `
      <div class="text-left p-3 bg-gray-50 rounded-lg mb-3">
        <p class="mb-2"><strong>Cliente:</strong> ${fullName}</p>
        <p class="mb-2"><strong>Membresía:</strong> ${selectedMembership.nombre}</p>
        <p class="mb-2"><strong>Periodo:</strong> ${format(startDate, "dd/MM/yyyy")} - ${format(endDateValue, "dd/MM/yyyy")}</p>
        <p><strong>Valor:</strong> ${formatCOP(selectedMembership.precio)}</p>
      </div>
    `,
      icon: "success",
      confirmButtonColor: "#000",
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false
    }).then(() => {
      // Asegurarse de cerrar el formulario después de que se cierre el mensaje
      onClose();
    });
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    documentType: "C.C.",
    documentNumber: "",
    address: "",
    birthdate: undefined,
    emergencyContact: "",
    emergencyPhone: "",
    isBeneficiary: true,
    beneficiaryRelation: "",
    beneficiaryName: "",
    beneficiaryDocumentType: "C.C.",
    beneficiaryDocumentNumber: "",
    beneficiaryPhone: "",
    beneficiaryEmail: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-4 w-full max-w-5xl mx-auto max-h-[85vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Nuevo Contrato</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Sección de identificación del cliente */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-xs sm:text-sm font-semibold border-b pb-2 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              Información del Cliente
            </h3>

            <div className="flex gap-3 items-end">
              <div className="w-1/4">
                <Label htmlFor="documentType" className="text-sm font-medium">
                  Tipo
                </Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType" className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">CC</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-3/4">
                <Label htmlFor="documentNumber" className="text-sm font-medium">
                  Número de Documento <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-1 mt-1">
                  <div className="relative flex-1">
                    <FileText className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={(e) => {
                        // Solo permitir números
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setDocumentNumber(value)
                      }}
                      className={cn("pl-9 h-9 text-sm", errors.documentNumber ? "border-red-500" : "")}
                      placeholder="Número de documento"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    onClick={checkClientExists}
                    disabled={!documentNumber || documentNumber.length < 6 || isVerifying}
                    className="h-9 text-sm px-2 whitespace-nowrap"
                  >
                    {isVerifying ? "..." : "Verificar"}
                  </Button>
                </div>
                {errors.documentNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.documentNumber}
                  </p>
                )}

                {clientExists && (
                  <p className="text-green-600 text-xs mt-1 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Cliente encontrado
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={cn("pl-9 mt-1 h-9 text-sm", errors.firstName ? "border-red-500" : "")}
                    disabled={clientExists}
                    placeholder="Nombre"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Apellido <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={cn("pl-9 mt-1 h-9 text-sm", errors.lastName ? "border-red-500" : "")}
                    disabled={clientExists}
                    placeholder="Apellido"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn("pl-9 mt-1 h-9 text-sm", errors.email ? "border-red-500" : "")}
                    disabled={clientExists}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setPhone(value)
                    }}
                    className={cn("pl-9 mt-1 h-9 text-sm", errors.phone ? "border-red-500" : "")}
                    disabled={clientExists}
                    placeholder="Teléfono"
                  />
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
              <Label htmlFor="address" className="text-sm font-medium">
                Dirección <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Home className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={cn("pl-9 mt-1 h-9 text-sm", errors.address ? "border-red-500" : "")}
                  disabled={clientExists}
                  placeholder="Dirección completa"
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="birthdate" className="text-sm font-medium">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 h-10 text-sm bg-white rounded-md transition-colors hover:bg-gray-50",
                        !birthdate && "text-muted-foreground",
                        errors.birthdate && "border-red-500",
                      )}
                      disabled={clientExists}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {birthdate ? format(birthdate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 shadow-md rounded-md border border-gray-200" 
                    align="start"
                    side="right"
                    sideOffset={10}
                    alignOffset={0}
                    avoidCollisions={false}
                    hideWhenDetached={false}
                    forceMount
                  >
                    <Calendar
                      mode="single"
                      selected={birthdate}
                      onSelect={(date) => {
                        if (date) {
                          setBirthdate(date);
                          // Cerrar automáticamente el popover cuando se selecciona una fecha
                          setTimeout(() => {
                            document.body.click();
                          }, 100);
                        }
                      }}
                      initialFocus
                      locale={es}
                      disabled={(date) => date > new Date()}
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      className="rounded-md border-0"
                      showHeader={true}
                      title="Fecha de nacimiento"
                      subtitle="Seleccione año, mes y día"
                      fixedWeeks
                      showOutsideDays
                    />
                  </PopoverContent>
                </Popover>
                {errors.birthdate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.birthdate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sección de contacto de emergencia */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-xs sm:text-sm font-semibold border-b pb-2 mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-gray-600" />
              Contacto de Emergencia
            </h3>

            <div>
              <Label htmlFor="emergencyContact" className="text-sm font-medium">
                Nombre del contacto
              </Label>
              <div className="relative">
                <User className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                <Input
                  id="emergencyContact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="pl-9 mt-1 h-9 text-sm"
                  disabled={clientExists}
                  placeholder="Nombre completo"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emergencyPhone" className="text-sm font-medium">
                Teléfono de emergencia
              </Label>
              <div className="relative">
                <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                <Input
                  id="emergencyPhone"
                  value={emergencyPhone}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    setEmergencyPhone(value)
                  }}
                  className="pl-9 mt-1 h-9 text-sm"
                  disabled={clientExists}
                  placeholder="Teléfono de contacto"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center space-x-2 mt-1">
                <Checkbox
                  id="isSelfBeneficiary"
                  checked={isSelfBeneficiary}
                  onCheckedChange={(checked) => {
                    setIsSelfBeneficiary(checked === true)
                    if (checked === true) {
                      setBeneficiaryRelation("")
                      setBeneficiaryName("")
                      setBeneficiaryDocumentType("C.C.")
                      setBeneficiaryDocumentNumber("")
                      setBeneficiaryPhone("")
                      setBeneficiaryEmail("")
                    }
                  }}
                />
                <Label htmlFor="isSelfBeneficiary" className="text-sm font-medium">
                  ¿Es usted mismo el beneficiario?
                </Label>
              </div>
            </div>

            {!isSelfBeneficiary && (
              <div className="space-y-3 mt-3 border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700">Información del Beneficiario</h4>

                <div>
                  <Label htmlFor="beneficiaryRelation" className="text-sm font-medium">
                    Relación con el beneficiario <span className="text-red-500">*</span>
                  </Label>
                  <Select value={beneficiaryRelation} onValueChange={setBeneficiaryRelation}>
                    <SelectTrigger
                      id="beneficiaryRelation"
                      className={cn("mt-1 h-9 text-sm", errors.beneficiaryRelation ? "border-red-500" : "")}
                    >
                      <SelectValue placeholder="Seleccionar relación" />
                    </SelectTrigger>
                    <SelectContent>
                      {relations.map((relation) => (
                        <SelectItem key={relation} value={relation}>
                          {relation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.beneficiaryRelation && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.beneficiaryRelation}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="beneficiaryName" className="text-sm font-medium">
                    Nombre del beneficiario <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                    <Input
                      id="beneficiaryName"
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      className={cn("pl-9 mt-1 h-9 text-sm", errors.beneficiaryName ? "border-red-500" : "")}
                      placeholder="Nombre completo"
                    />
                  </div>
                  {errors.beneficiaryName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.beneficiaryName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="beneficiaryDocumentType" className="text-sm font-medium">
                      Tipo de documento
                    </Label>
                    <Select value={beneficiaryDocumentType} onValueChange={setBeneficiaryDocumentType}>
                      <SelectTrigger id="beneficiaryDocumentType" className="mt-1 h-9 text-sm">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C.C.">C.C.</SelectItem>
                        <SelectItem value="T.I.">T.I.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="beneficiaryDocumentNumber" className="text-sm font-medium">
                      Número de documento
                    </Label>
                    <div className="relative">
                      <FileText className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                      <Input
                        id="beneficiaryDocumentNumber"
                        value={beneficiaryDocumentNumber}
                        onChange={(e) => {
                          // Solo permitir números
                          const value = e.target.value.replace(/[^0-9]/g, "")
                          setBeneficiaryDocumentNumber(value)
                        }}
                        className={cn(
                          "pl-9 mt-1 h-9 text-sm",
                          errors.beneficiaryDocumentNumber ? "border-red-500" : "",
                        )}
                        placeholder="Número de documento"
                      />
                    </div>
                    {errors.beneficiaryDocumentNumber && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.beneficiaryDocumentNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="beneficiaryPhone" className="text-sm font-medium">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                      <Input
                        id="beneficiaryPhone"
                        value={beneficiaryPhone}
                        onChange={(e) => {
                          // Solo permitir números
                          const value = e.target.value.replace(/[^0-9]/g, "")
                          setBeneficiaryPhone(value)
                        }}
                        className={cn("pl-9 mt-1 h-9 text-sm", errors.beneficiaryPhone ? "border-red-500" : "")}
                        placeholder="Teléfono de contacto"
                      />
                    </div>
                    {errors.beneficiaryPhone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.beneficiaryPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="beneficiaryEmail" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                      <Input
                        id="beneficiaryEmail"
                        type="email"
                        value={beneficiaryEmail}
                        onChange={(e) => setBeneficiaryEmail(e.target.value)}
                        className={cn("pl-9 mt-1 h-9 text-sm", errors.beneficiaryEmail ? "border-red-500" : "")}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    {errors.beneficiaryEmail && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.beneficiaryEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de membresía */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold border-b pb-2 mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-600" />
            Información de la Membresía
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="membershipId" className="text-sm font-medium">
                Tipo de Membresía <span className="text-red-500">*</span>
              </Label>
              <Select value={membershipId} onValueChange={setMembershipId}>
                <SelectTrigger
                  id="membershipId"
                  className={cn("mt-1 h-9 text-sm", errors.membershipId ? "border-red-500" : "")}
                >
                  <SelectValue placeholder="Seleccionar membresía" />
                </SelectTrigger>
                <SelectContent>
                  {memberships.map((membership) => (
                    <SelectItem key={membership.id} value={membership.id.toString()}>
                      {membership.nombre} - {formatCOP(membership.precio)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.membershipId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.membershipId}
                </p>
              )}

              {membershipId && (
                <div className="mt-2 text-xs bg-blue-50 p-2 rounded-md">
                  <p className="text-gray-700">
                    {memberships.find((m) => m.id.toString() === membershipId)?.descripcion}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 h-10 text-sm bg-white rounded-md transition-colors hover:bg-gray-50",
                        !startDate && "text-muted-foreground",
                        errors.startDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 shadow-md rounded-md border border-gray-200" 
                    align="start"
                    side="right"
                    sideOffset={10}
                    alignOffset={0}
                    avoidCollisions={false}
                    hideWhenDetached={false}
                    forceMount
                  >
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setStartDate(date);
                          // Cerrar automáticamente el popover cuando se selecciona una fecha
                          setTimeout(() => {
                            document.body.click();
                          }, 100);
                        }
                      }}
                      initialFocus
                      locale={es}
                      captionLayout="dropdown-buttons"
                      fromYear={new Date().getFullYear() - 1}
                      toYear={new Date().getFullYear() + 5}
                      className="rounded-md border-0"
                      showHeader={true}
                      title="Fecha de inicio"
                      subtitle="Seleccione la fecha de inicio del contrato"
                      fixedWeeks
                      showOutsideDays
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Fecha de Fin
                </Label>
                <div className="relative">
                  <CalendarIcon2 className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <Input
                    id="endDate"
                    value={endDate ? format(endDate, "dd/MM/yyyy") : ""}
                    disabled
                    className="bg-gray-100 mt-1 h-9 text-sm pl-9"
                    placeholder="Cálculo automático"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Cálculo automático según la membresía</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold border-b pb-2 mb-3 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-600" />
            Resumen del Contrato
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Información del Cliente</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>
                  <span className="text-gray-500">Documento:</span> {documentType} {documentNumber || "No especificado"}
                </li>
                <li>
                  <span className="text-gray-500">Nombre:</span> {firstName} {lastName}
                </li>
                <li>
                  <span className="text-gray-500">Contacto:</span> {email || "No especificado"} /{" "}
                  {phone || "No especificado"}
                </li>
                {!isSelfBeneficiary && beneficiaryName && (
                  <li>
                    <span className="text-gray-500">Beneficiario:</span> {beneficiaryName}
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Información de la Membresía</p>
              <ul className="mt-1 space-y-1 text-xs">
                {membershipId ? (
                  <>
                    <li>
                      <span className="text-gray-500">Tipo:</span>{" "}
                      {memberships.find((m) => m.id.toString() === membershipId)?.nombre}
                    </li>
                    <li>
                      <span className="text-gray-500">Precio:</span>{" "}
                      {formatCOP(memberships.find((m) => m.id.toString() === membershipId)?.precio || 0)}
                    </li>
                    <li>
                      <span className="text-gray-500">Duración:</span>{" "}
                      {memberships.find((m) => m.id.toString() === membershipId)?.duracion_dias} días
                    </li>
                    <li>
                      <span className="text-gray-500">Periodo:</span>{" "}
                      {startDate ? format(startDate, "dd/MM/yyyy") : "No especificado"} -{" "}
                      {endDate ? format(endDate, "dd/MM/yyyy") : "No especificado"}
                    </li>
                  </>
                ) : (
                  <li>No se ha seleccionado una membresía</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose} className="h-9 text-sm px-4">
            Cancelar
          </Button>
          <Button type="submit" className="h-9 text-sm px-4 bg-black hover:bg-gray-800">
            Crear Contrato
          </Button>
        </div>
      </form>
    </div>
  )
}
