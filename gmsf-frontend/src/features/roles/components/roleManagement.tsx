"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { RoleTable } from "./roleTable"
import { RoleModal } from "./roleModal"
import { RoleDetailModal } from "./roleDetailModal"
import type { Role, RoleFormData } from "@/shared/types/role"
import { roleService } from "../services/roleService"
import { Pagination } from "@/shared/layout/pagination"
import Swal from "sweetalert2"

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [modalTitle, setModalTitle] = useState("Crear Rol")
  const [searchTerm] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedRoles, setPaginatedRoles] = useState<Role[]>([])

  // Función para cargar los roles - ahora es reutilizable
  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await roleService.getRoles()
      setRoles(data)
      setFilteredRoles(data)
    } catch (error) {
      console.error("Error fetching roles:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los roles. Por favor, intente de nuevo.",
        icon: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial de datos
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Filter roles based on search term
  useEffect(() => {
    const filtered = roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRoles(filtered)
    setCurrentPage(1)
  }, [searchTerm, roles])

  // Update pagination
  useEffect(() => {
    const total = Math.ceil(filteredRoles.length / itemsPerPage)
    setTotalPages(total || 1)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedRoles(filteredRoles.slice(startIndex, endIndex))
  }, [filteredRoles, currentPage, itemsPerPage])

  const handleCreateRole = () => {
    setSelectedRole(null)
    setModalTitle("Crear Rol")
    setIsModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setModalTitle("Editar Rol")
    setIsModalOpen(true)
  }

  const handleViewRole = (role: Role) => {
    setSelectedRole(role)
    setIsDetailModalOpen(true)
  }

  const handleDeleteRole = async (role: Role) => {
    const result = await Swal.fire({
      title: "¿Eliminar rol?",
      text: `¿Está seguro de que desea eliminar el rol "${role.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#000000FF",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await roleService.deleteRole(role.id)
        // Actualizar la lista de roles después de eliminar
        await fetchRoles()
        setIsDetailModalOpen(false)

        Swal.fire({
          title: "¡Eliminado!",
          text: "El rol ha sido eliminado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error deleting role:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el rol.",
          icon: "error",
        })
      }
    }
  }

  const handleSaveRole = async (roleData: RoleFormData) => {
    try {
      setIsModalOpen(false) // Cerrar el modal inmediatamente para evitar múltiples envíos

      if (selectedRole) {
        // Update existing role
        await roleService.updateRole(selectedRole.id, roleData)
      } else {
        // Create new role
        await roleService.createRole(roleData)
      }

      // Recargar los datos para mostrar los cambios
      await fetchRoles()

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "¡Guardado!",
        text: selectedRole ? "Rol actualizado correctamente." : "Rol creado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error saving role:", error)
      // Mostrar mensaje de error
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar el rol.",
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
    <div className="container mx-auto px-4">
      <div className="overflow-hidden mb-4">
        <RoleTable
          roles={paginatedRoles}
          onView={handleViewRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          onAdd={handleCreateRole}
        />
      </div>

      {filteredRoles.length > itemsPerPage && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        role={selectedRole || undefined}
        title={modalTitle}
      />

      {selectedRole && (
        <RoleDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          role={selectedRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
        />
      )}
    </div>
  )
}
