"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Eye, Edit, Trash, CheckCircle, AlertTriangle, Search, Plus } from "lucide-react"
import type { Service } from "@/shared/types/service"

interface ServiceTableProps {
  services: Service[]
  onView: (service: Service) => void
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onAdd: () => void
}

const getServiceStatus = (isActive: boolean) => {
  if (isActive) {
    return {
      label: "Activo",
      color: "bg-green-50 text-green-800 border-green-100",
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
    }
  }
  return {
    label: "Inactivo",
    color: "bg-red-50 text-red-800 border-red-100",
    icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
  }
}

export const ServiceTable: React.FC<ServiceTableProps> = ({ services, onView, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [displayedServices, setDisplayedServices] = useState<Service[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const servicesPerPage = 10

  // Filtrar servicios según el término de búsqueda
  useEffect(() => {
    const filtered = services.filter((service) =>
      [service.name, service.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setDisplayedServices(filtered)
    setCurrentPage(1) // Reset to first page on filter change
  }, [searchTerm, services])

  const getPaginatedServices = () => {
    const startIndex = (currentPage - 1) * servicesPerPage
    const endIndex = startIndex + servicesPerPage
    return displayedServices.slice(startIndex, endIndex)
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="ml-3 text-2xl font-bold text-gray-800">Gestión de Servicios</h2>
          <div className="flex items-center justify-between mb-4 m-4">
            <div className="text-sm text-gray-500 mr-4">
              Mostrando {displayedServices.length} de {services.length} servicios
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={onAdd} // Llama a la función pasada como prop
              className="h-10 px-4 flex items-center gap-2 "
            >
              <Plus className="h-4 w-4 " />
              Añadir Servicio
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción"
              className="ml-3 h-9 pl-9"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="mr-4 h-9 px-4"
            disabled={!searchTerm}
          >
            Limpiar
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NOMBRE</TableHead>
              <TableHead>DESCRIPCIÓN</TableHead>
              <TableHead>PRECIO</TableHead>
              <TableHead>DURACIÓN</TableHead>
              <TableHead>ESTADO</TableHead>
              <TableHead className="text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedServices().length > 0 ? (
              getPaginatedServices().map((service) => {
                const status = getServiceStatus(service.isActive)
                return (
                  <TableRow key={service.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>${service.price.toFixed(0)}</TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.color}`}
                      >
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(service)}
                          title="Ver detalles"
                          aria-label="Ver detalles del servicio"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(service)}
                          title="Editar servicio"
                          aria-label="Editar servicio"
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(service)}
                          title="Eliminar servicio"
                          aria-label="Eliminar servicio"
                        >
                          <Trash className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron servicios</p>
                    <p className="text-sm">Intenta con otros criterios de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {/* Paginador */}
            {Math.ceil(displayedServices.length / servicesPerPage) > 1 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  <div className="flex justify-center">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="mr-2"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-500 flex items-center">
                      Página {currentPage} de {Math.ceil(displayedServices.length / servicesPerPage)}
                    </span>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, Math.ceil(displayedServices.length / servicesPerPage)),
                        )
                      }
                      disabled={currentPage === Math.ceil(displayedServices.length / servicesPerPage)}
                      className="ml-2"
                    >
                      Siguiente
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
