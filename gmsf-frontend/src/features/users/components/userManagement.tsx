import { useState, useEffect } from "react"
import { UserTable } from "./userTable"
import { UserFormModal } from "./userFormModal"
import { UserDetailsModal } from "./userDetailsModal"
import type { User, UserFormData } from "../types/user"
import { userService } from "../services/userService"
import { toast } from "sonner"

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Cargar usuarios
  const loadUsers = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await userService.getUsers(page)
      setUsers(response.data)
      setTotalPages(response.totalPages)
      setCurrentPage(page)
    } catch (error) {
      toast.error("Error al cargar los usuarios")
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAddUser = () => {
    setEditingUser(null)
    setIsFormModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormModalOpen(true)
  }

  const handleViewUser = async (user: User) => {
    try {
      const detailedUser = await userService.getUserById(user.id)
      setSelectedUser(detailedUser)
      setIsDetailsModalOpen(true)
    } catch (error) {
      toast.error("Error al cargar los detalles del usuario")
      console.error("Error loading user details:", error)
    }
  }

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const updatedUser = await userService.updateUser(editingUser.id, userData)
        setUsers(prev =>
          prev.map(user => (user.id === editingUser.id ? updatedUser : user))
        )
        toast.success("Usuario actualizado exitosamente")
      } else {
        // Crear nuevo usuario
        const newUser = await userService.createUser(userData)
        setUsers(prev => [...prev, newUser])
        toast.success("Usuario creado exitosamente")
      }
      setIsFormModalOpen(false)
    } catch (error) {
      toast.error("Error al guardar el usuario")
      console.error("Error saving user:", error)
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      await userService.deactivateUser(userId)
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, estado: !user.estado } : user
        )
      )
      toast.success("Estado del usuario actualizado")
    } catch (error) {
      toast.error("Error al cambiar el estado del usuario")
      console.error("Error toggling user status:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUserPermanently(userId)
      setUsers(prev => prev.filter(user => user.id !== userId))
      toast.success("Usuario eliminado permanentemente")
    } catch (error) {
      toast.error("Error al eliminar el usuario")
      console.error("Error deleting user:", error)
    }
  }

  return (
    <div>
      <UserTable
        users={users}
        onAdd={handleAddUser}
        onEdit={handleEditUser}
        onView={handleViewUser}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteUser}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={loadUsers}
      />

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        existingUsers={users}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}
