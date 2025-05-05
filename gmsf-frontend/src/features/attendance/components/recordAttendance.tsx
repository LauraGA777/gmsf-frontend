import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/shared/lib/formatCop"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { showError, showSuccess } from "@/shared/lib/sweetAlert"

interface Cliente {
  id: number
  nombre: string
  documento: string
}

interface Membresia {
  id: number
  nombre: string
}

const clientes: Cliente[] = [
  { id: 1, nombre: "Juan Pérez", documento: "1234567890" },
  { id: 2, nombre: "María López", documento: "0987654321" },
  { id: 3, nombre: "Carlos Rodríguez", documento: "5678901234" },
  { id: 4, nombre: "Ana Martínez", documento: "4321098765" },
  { id: 5, nombre: "Pedro González", documento: "6789012345" },
]

const membresias: Membresia[] = [
  { id: 1, nombre: "Mensual Premium" },
  { id: 2, nombre: "Trimestral" },
  { id: 3, nombre: "Anual" },
  { id: 4, nombre: "Diario" },
]

export function RecordAttendance() {
  const [documento, setDocumento] = useState("")
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState<Membresia | null>(null)
  const [fecha, setFecha] = useState<Date | undefined>(new Date())
  const [openCliente, setOpenCliente] = useState(false)
  const [openMembresia, setOpenMembresia] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)

  const handleBuscarCliente = () => {
    const cliente = clientes.find((c) => c.documento === documento)
    if (cliente) {
      setClienteSeleccionado(cliente)
      showSuccess("Cliente encontrado", `Se ha encontrado a ${cliente.nombre}`)
    } else {
      showError("Cliente no encontrado", "No se ha encontrado ningún cliente con ese documento")
    }
  }

  const handleRegistrarAsistencia = () => {
    if (!clienteSeleccionado || !membresiaSeleccionada || !fecha) {
      showError("Error al registrar", "Por favor complete todos los campos")
      return
    }

    // Aquí iría la lógica para registrar la asistencia

    showSuccess("Asistencia registrada", `Se ha registrado la asistencia de ${clienteSeleccionado.nombre}`)

    // Resetear el formulario
    setDocumento("")
    setClienteSeleccionado(null)
    setMembresiaSeleccionada(null)
    setFecha(new Date())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Asistencia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documento">Documento de Identidad</Label>
              <div className="flex gap-2">
                <Input
                  id="documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ingrese el documento"
                />
                <Button type="button" onClick={handleBuscarCliente} className="bg-black hover:bg-gray-800">
                  Buscar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Popover open={openCliente} onOpenChange={setOpenCliente}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCliente}
                    className="w-full justify-between"
                    disabled={!clienteSeleccionado}
                  >
                    {clienteSeleccionado ? clienteSeleccionado.nombre : "Seleccionar cliente"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                      <CommandGroup>
                        {clientes.map((cliente) => (
                          <CommandItem
                            key={cliente.id}
                            value={cliente.nombre}
                            onSelect={() => {
                              setClienteSeleccionado(cliente)
                              setOpenCliente(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                clienteSeleccionado?.id === cliente.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {cliente.nombre} - {cliente.documento}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Membresía</Label>
              <Popover open={openMembresia} onOpenChange={setOpenMembresia}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMembresia}
                    className="w-full justify-between"
                  >
                    {membresiaSeleccionada ? membresiaSeleccionada.nombre : "Seleccionar membresía"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar membresía..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron membresías.</CommandEmpty>
                      <CommandGroup>
                        {membresias.map((membresia) => (
                          <CommandItem
                            key={membresia.id}
                            value={membresia.nombre}
                            onSelect={() => {
                              setMembresiaSeleccionada(membresia)
                              setOpenMembresia(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                membresiaSeleccionada?.id === membresia.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {membresia.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha y Hora</Label>
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, "PPP HH:mm", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={(date) => {
                      setFecha(date)
                      setOpenCalendar(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleRegistrarAsistencia} className="bg-black hover:bg-gray-800">
            Registrar Asistencia
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
