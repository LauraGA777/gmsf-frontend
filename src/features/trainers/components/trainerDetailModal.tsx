"use client"

import type React from "react"
import { useState } from "react"
import type { Trainer } from "@/shared/types/trainer"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface TrainerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  trainer: Trainer
  onEdit: (trainer: Trainer) => void
  onDelete: (trainer: Trainer) => void
}

export const TrainerDetailModal: React.FC<TrainerDetailModalProps> = ({
  isOpen,
  onClose,
  trainer,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "professional" | "history">("info")

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!isOpen || !trainer) return null

  // Mock history for the trainer
  const mockHistory = [
    { id: "1", action: "Entrenador registrado", user: "Admin", date: "15/01/2023" },
    { id: "2", action: "Especialidad actualizada", user: "Admin", date: "10/02/2023" },
    { id: "3", action: "Servicios actualizados", user: "Admin", date: "05/03/2023" },
    { id: "4", action: "Estado cambiado a activo", user: "Admin", date: "12/04/2023" },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Detalles del Entrenador</h2>
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
              Información Personal
            </button>
            <button
              onClick={() => setActiveTab("professional")}
              className={`py-2 px-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "professional"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Información Profesional
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Historial
            </button>
          </div>
        </div>

        {activeTab === "info" ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                  <p className="mt-1 text-sm font-medium text-gray-800">{trainer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Apellido</h3>
                  <p className="mt-1 text-sm font-medium text-gray-800">{trainer.lastName || "No disponible"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Género</h3>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {trainer.gender === "M" ? "Masculino" : trainer.gender === "F" ? "Femenino" : "No especificado"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Nacimiento</h3>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {trainer.birthDate ? formatDate(trainer.birthDate) : "No disponible"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Información de Contacto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Email</h4>
                  <p className="mt-1 text-sm text-gray-800">{trainer.email}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Teléfono</h4>
                  <p className="mt-1 text-sm text-gray-800">{trainer.phone}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Dirección</h4>
                  <p className="mt-1 text-sm text-gray-800">{trainer.address || "No disponible"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Información de Identificación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Tipo de Documento</h4>
                  <p className="mt-1 text-sm text-gray-800">{trainer.documentType}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Número de Documento</h4>
                  <p className="mt-1 text-sm text-gray-800">{trainer.documentNumber}</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "professional" ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Especialidad</h3>
                  <p className="mt-1 text-sm font-medium text-gray-800">{trainer.specialty}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <span
                    className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      trainer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {trainer.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Registro</h3>
                  <p className="mt-1 text-sm text-gray-800">{formatDate(trainer.hireDate)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mockHistory.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-gray-200 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.action}</p>
                  <p className="text-xs text-gray-500">
                    Por {item.user} el {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => onDelete(trainer)}
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
              onClick={() => onEdit(trainer)}
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
