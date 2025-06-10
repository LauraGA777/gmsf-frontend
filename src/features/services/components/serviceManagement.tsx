import React, { useCallback } from "react"
import { useState, useEffect } from "react"
import { ServiceTable } from "./serviceTable"
import { ServiceModal } from "./serviceModal"
import { ServiceDetailModal } from "./serviceDetailModal"
import type { Service, ServiceFormData } from "@/shared/types/service"
import { serviceService } from "../services/serviceService"
import { Pagination } from "@/shared/layout/pagination"
import Swal from "sweetalert2"

export const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [modalTitle, setModalTitle] = useState("Crear Servicio")
  const [searchTerm] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedServices, setPaginatedServices] = useState<Service[]>([])

  // Función para cargar los servicios - ahora es reutilizable
  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const data = await serviceService.getServices()
      setServices(data)
      setFilteredServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los servicios. Por favor, intente de nuevo.",
        icon: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial de datos
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Filter services based on search term
  useEffect(() => {
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredServices(filtered)
    setCurrentPage(1)
  }, [searchTerm, services])

  // Update pagination
  useEffect(() => {
    const total = Math.ceil(filteredServices.length / itemsPerPage)
    setTotalPages(total || 1)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedServices(filteredServices.slice(startIndex, endIndex))
  }, [filteredServices, currentPage, itemsPerPage])

  const handleCreateService = () => {
    setSelectedService(null)
    setModalTitle("Crear Servicio")
    setIsModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setModalTitle("Editar Servicio")
    setIsModalOpen(true)
  }

  const handleViewService = (service: Service) => {
    setSelectedService(service)
    setIsDetailModalOpen(true)
  }

  const handleDeleteService = async (service: Service) => {
    const result = await Swal.fire({
      title: "¿Eliminar servicio?",
      text: `¿Está seguro de que desea eliminar el servicio "${service.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#000000FF",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await serviceService.deleteService(service.id)
        // Actualizar la lista de servicios después de eliminar
        await fetchServices()
        setIsDetailModalOpen(false)

        Swal.fire({
          title: "¡Eliminado!",
          text: "El servicio ha sido eliminado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error deleting service:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el servicio.",
          icon: "error",
        })
      }
    }
  }

  const handleSaveService = async (serviceData: ServiceFormData) => {
    try {
      setIsModalOpen(false) // Cerrar el modal inmediatamente para evitar múltiples envíos

      if (selectedService) {
        // Update existing service
        await serviceService.updateService(selectedService.id, serviceData)
      } else {
        // Create new service
        await serviceService.createService(serviceData)
      }

      // Recargar los datos para mostrar los cambios
      await fetchServices()

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "¡Guardado!",
        text: selectedService ? "Servicio actualizado correctamente." : "Servicio creado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error saving service:", error)
      // Mostrar mensaje de error
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar el servicio.",
        icon: "error",
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 ">
      <div className="overflow-hidden mb-4">
        <ServiceTable
          services={paginatedServices}
          onView={handleViewService}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          onAdd={handleCreateService}
        />
      </div>

      {filteredServices.length > itemsPerPage && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        service={selectedService || undefined}
        title={modalTitle}
      />

      {selectedService && (
        <ServiceDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          service={selectedService}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      )}
    </div>
  )
}
