"use client"

import type React from "react"
import { useState } from "react"
import type { Service } from "@/shared/types/service"

interface ServiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  isOpen,
  onClose,
  service,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "details">("info")

  if (!isOpen || !service) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Detalles del Servicio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-2 px-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Información Básica
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 px-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Detalles
            </button>
          </div>
        </div>

        {activeTab === "info" ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                  <p className="mt-1 text-sm font-medium text-gray-800">{service.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <span
                    className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {service.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
                <p className="mt-1 text-sm text-gray-800">{service.description}</p>
              </div>
            </div>
          </div>
        ) : activeTab === "details" ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Detalles del Servicio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Precio</h4>
                  <p className="mt-1 text-sm font-medium text-gray-800">${service.price}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Duración</h4>
                  <p className="mt-1 text-sm font-medium text-gray-800">{service.duration} minutos</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Capacidad</h4>
                  <p className="mt-1 text-sm font-medium text-gray-800">{service.capacity} personas</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Información Adicional</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Fecha de Creación</h4>
                  <p className="mt-1 text-sm text-gray-800">{service.createdAt || "No disponible"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Última Actualización</h4>
                  <p className="mt-1 text-sm text-gray-800">{service.updatedAt || "No disponible"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Creado por</h4>
                  <p className="mt-1 text-sm text-gray-800">{service.createdBy || "Admin"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Estadísticas del Servicio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Reservas Totales</h4>
                  <p className="mt-1 text-sm font-medium text-gray-800">{service.bookings || 0}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Ingresos Generados</h4>
                  <p className="mt-1 text-sm font-medium text-gray-800">${service.revenue || 0}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Calificación Promedio</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-medium text-gray-800 mr-1">{service.rating || 0}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-yellow-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Entrenadores Asignados</h4>
                  <p className="mt-1 text-sm font-medium text-gray-800">{service.trainers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Disponibilidad</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Horarios Disponibles</h4>
                  <p className="mt-1 text-sm text-gray-800">{service.schedules || "No disponible"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Cupos Disponibles</h4>
                  <p className="mt-1 text-sm text-gray-800">{service.availableSpots || "No disponible"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => onDelete(service)}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit(service)}
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
