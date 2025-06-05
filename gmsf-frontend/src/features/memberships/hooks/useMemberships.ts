import { useState, useMemo, useEffect } from "react"
import type { Membership, MembershipFormData, FilterStatus } from "@/shared/types/membership"
import { mockMemberships, generateMembershipCode } from "@/features/data/mockMembershipData"

export function useMemberships() {
  const [memberships, setMemberships] = useState<Membership[]>(mockMemberships)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Cambiado a 10 items por página para coincidir con la UI

  // Filtrar membresías basado en búsqueda y estado
  const filteredMemberships = useMemo(() => {
    return memberships.filter((membership) => {
      const matchesSearch =
        !searchTerm ||
        membership.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        membership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        membership.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && membership.isActive) ||
        (filterStatus === "inactive" && !membership.isActive)

      return matchesSearch && matchesStatus
    })
  }, [memberships, searchTerm, filterStatus])

  // Calcular total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredMemberships.length / itemsPerPage))

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])

  // Asegurar que la página actual es válida
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  // Obtener membresías paginadas
  const paginatedMemberships = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredMemberships.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredMemberships, currentPage, itemsPerPage])

  const createMembership = (data: MembershipFormData): Membership => {
    const newMembership: Membership = {
      id: Date.now().toString(),
      code: generateMembershipCode(),
      ...data,
      isActive: true,
      createdAt: new Date(),
      activeContracts: 0,
    }

    setMemberships((prev) => [...prev, newMembership])
    return newMembership
  }

  const updateMembership = (id: string, data: Partial<Membership>): Membership | null => {
    const updatedMembership = memberships.find((m) => m.id === id)
    if (!updatedMembership) return null

    const updated = { ...updatedMembership, ...data }
    setMemberships((prev) => prev.map((m) => (m.id === id ? updated : m)))
    return updated
  }

  const toggleMembershipStatus = (id: string): boolean => {
    const membership = memberships.find((m) => m.id === id)
    if (!membership) return false

    if (membership.isActive && membership.activeContracts > 0) {
      return false // Cannot deactivate with active contracts
    }

    setMemberships((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)))
    return true
  }

  const getMembershipById = (id: string): Membership | undefined => {
    return memberships.find((m) => m.id === id)
  }

  const isNameUnique = (name: string, excludeId?: string): boolean => {
    return !memberships.some((m) => m.name.toLowerCase() === name.toLowerCase() && m.id !== excludeId)
  }

  // Funciones de paginación
  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(targetPage)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  return {
    // Datos paginados y filtrados
    memberships: paginatedMemberships,
    totalItems: filteredMemberships.length,
    currentPage,
    totalPages,
    itemsPerPage,

    // Funciones de paginación
    setCurrentPage: goToPage,
    nextPage,
    previousPage,

    // Búsqueda y filtros
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,

    // Operaciones CRUD
    createMembership,
    updateMembership,
    toggleMembershipStatus,
    getMembershipById,
    isNameUnique,
  }
}
