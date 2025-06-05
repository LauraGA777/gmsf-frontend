import { useState } from "react"
import { useMemberships } from "@/features/memberships/hooks/useMemberships"
import { useToast, ToastContainer } from "@/shared/components/ui/toast"
import { MembershipTable } from "@/features/memberships/components/membershipTable"
import { CreateMembershipModal } from "@/features/memberships/components/createMembershipModal"
import { EditMembershipModal } from "@/features/memberships/components/editMembershipModal"
import { MembershipDetailsModal } from "@/features/memberships/components/membershipDetailsModal"
import { ConfirmDeactivationModal } from "@/features/memberships/components/confirmDeactivationModal"
import type { Membership, MembershipFormData } from "@/shared/types/membership"

export default function MembershipDashboard() {
  const {
    memberships,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    createMembership,
    updateMembership,
    toggleMembershipStatus,
    getMembershipById,
    isNameUnique,
  } = useMemberships()

  const { toasts, addToast, removeToast } = useToast()

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null)

  const handleCreateMembership = (data: MembershipFormData) => {
    try {
      const newMembership = createMembership(data)
      addToast({
        type: "success",
        title: "Membresía creada",
        description: `La membresía "${newMembership.name}" ha sido creada exitosamente.`,
      })
      setIsCreateModalOpen(false)
    } catch (error) {
      addToast({
        type: "error",
        title: "Error al crear membresía",
        description: "Ocurrió un error al crear la membresía. Inténtelo nuevamente.",
      })
    }
  }

  const handleEditMembership = (data: MembershipFormData) => {
    if (!selectedMembership) return

    try {
      const updated = updateMembership(selectedMembership.id, data)
      if (updated) {
        addToast({
          type: "success",
          title: "Membresía actualizada",
          description: `La membresía "${updated.name}" ha sido actualizada exitosamente.`,
        })
        setIsEditModalOpen(false)
        setSelectedMembership(null)
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error al actualizar membresía",
        description: "Ocurrió un error al actualizar la membresía. Inténtelo nuevamente.",
      })
    }
  }

  const handleToggleStatus = (membership: Membership) => {
    if (membership.isActive && membership.activeContracts > 0) {
      setSelectedMembership(membership)
      setIsConfirmModalOpen(true)
      return
    }

    const success = toggleMembershipStatus(membership.id)
    if (success) {
      const newStatus = !membership.isActive
      addToast({
        type: "success",
        title: `Membresía ${newStatus ? "activada" : "desactivada"}`,
        description: `La membresía "${membership.name}" ha sido ${newStatus ? "activada" : "desactivada"} exitosamente.`,
      })
    }
  }

  const handleConfirmDeactivation = () => {
    if (!selectedMembership) return

    const success = toggleMembershipStatus(selectedMembership.id)
    if (success) {
      addToast({
        type: "success",
        title: "Membresía desactivada",
        description: `La membresía "${selectedMembership.name}" ha sido desactivada exitosamente.`,
      })
    } else {
      addToast({
        type: "error",
        title: "No se puede desactivar",
        description: "La membresía tiene contratos activos vinculados.",
      })
    }
    setIsConfirmModalOpen(false)
    setSelectedMembership(null)
  }

  const handleEdit = (membership: Membership) => {
    setSelectedMembership(membership)
    setIsEditModalOpen(true)
  }

  const handleViewDetails = (membership: Membership) => {
    setSelectedMembership(membership)
    setIsDetailsModalOpen(true)
  }

  const handleDeactivateFromEdit = () => {
    if (!selectedMembership) return
    setIsEditModalOpen(false)
    setIsConfirmModalOpen(true)
  }

  const handleDetailsToggleStatus = () => {
    if (selectedMembership) {
      handleToggleStatus(selectedMembership)
      // Refresh the selected membership data
      const updated = getMembershipById(selectedMembership.id)
      if (updated) {
        setSelectedMembership(updated)
      }
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    // La página se resetea automáticamente a 1 gracias al useEffect en useMemberships
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <MembershipTable
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onCreateNew={() => setIsCreateModalOpen(true)}
        memberships={memberships}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onViewDetails={handleViewDetails}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
      />

      {/* Modals */}
      <CreateMembershipModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMembership}
      />

      <EditMembershipModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedMembership(null)
        }}
        onSubmit={handleEditMembership}
        onDeactivate={handleDeactivateFromEdit}
        membership={selectedMembership}
        isNameUnique={isNameUnique}
      />

      <MembershipDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedMembership(null)
        }}
        membership={selectedMembership}
        onToggleStatus={handleDetailsToggleStatus}
      />

      <ConfirmDeactivationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setSelectedMembership(null)
        }}
        onConfirm={handleConfirmDeactivation}
        membership={selectedMembership}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
