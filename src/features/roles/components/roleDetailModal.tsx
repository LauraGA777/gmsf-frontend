"use client"

import type React from "react"
import { useState } from "react"
import type { Role } from "@/shared/types/role"

interface RoleDetailModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export const RoleDetailModal: React.FC<RoleDetailModalProps> = ({ isOpen, onClose, role, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState<"info" | "permissions">("info")

  if (!isOpen || !role) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Detalles del Rol</h2>
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
              Información
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`py-2 px-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "permissions"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Permisos
            </button>
          </div>
        </div>

        {activeTab === "info" ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                  <p className="mt-1 text-sm font-medium text-gray-800">{role.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <span
                    className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      role.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {role.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
                <p className="mt-1 text-sm text-gray-800">{role.description || "No se proporcionó descripción"}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Información Adicional</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Usuarios</h4>
                  <p className="mt-1 text-sm font-medium text-gray-800">{role.userCount || 0} usuarios</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Fecha de Creación</h4>
                  <p className="mt-1 text-sm text-gray-800">{role.createdAt}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Última Actualización</h4>
                  <p className="mt-1 text-sm text-gray-800">{role.updatedAt}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Creado por</h4>
                  <p className="mt-1 text-sm text-gray-800">{role.createdBy || "Admin"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Permisos Asignados</h3>
              <div className="grid grid-cols-1 gap-2">
                {role.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
                  >
                    <span className="text-sm text-gray-800">{String(permission)}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Concedido
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => onDelete(role)}
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
              onClick={() => onEdit(role)}
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
