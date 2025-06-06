import { useState, useCallback } from 'react';
import { useGym } from '@/shared/contexts/gymContext';
import { membershipService } from '@/features/memberships/services/membership.service';
import type { Membership } from '@/shared/types';
import Swal from 'sweetalert2';

export const useMemberships = () => {
  const {
    memberships,
    membershipsLoading,
    refreshMemberships,
    contracts
  } = useGym();

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get membership statistics
  const getMembershipStats = useCallback((membershipId: string) => {
    const activeContracts = contracts.filter(c => 
      Number(c.id_membresia) === Number(membershipId) && c.estado === 'Activo'
    );
    
    const totalRevenue = activeContracts.reduce((sum, contract) => 
      sum + contract.membresia_precio, 0
    );

    return {
      activeContracts: activeContracts.length,
      totalRevenue,
      averagePrice: activeContracts.length > 0 ? totalRevenue / activeContracts.length : 0
    };
  }, [contracts]);

  // Get all membership statistics
  const getAllMembershipStats = useCallback(() => {
    return memberships.map(membership => ({
      ...membership,
      stats: getMembershipStats(membership.id)
    }));
  }, [memberships, getMembershipStats]);

  // Create membership with integrated error handling
  const createMembership = useCallback(async (data: Partial<Membership>) => {
    setIsCreating(true);
    try {
      const newMembership = await membershipService.createMembership(data);
      await refreshMemberships();
      
      Swal.fire({
        title: '¡Éxito!',
        text: `Membresía "${newMembership.nombre}" creada correctamente`,
        icon: 'success',
        confirmButtonColor: '#000',
        timer: 3000,
        showConfirmButton: false
      });
      
      return newMembership;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error al crear la membresía';
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#000',
      });
      
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [refreshMemberships]);

  // Update membership with integrated error handling
  const updateMembership = useCallback(async (id: string, data: Partial<Membership>) => {
    setIsUpdating(true);
    try {
      const updatedMembership = await membershipService.updateMembership(id, data);
      await refreshMemberships();
      
      Swal.fire({
        title: '¡Éxito!',
        text: `Membresía "${updatedMembership.nombre}" actualizada correctamente`,
        icon: 'success',
        confirmButtonColor: '#000',
        timer: 3000,
        showConfirmButton: false
      });
      
      return updatedMembership;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error al actualizar la membresía';
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#000',
      });
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [refreshMemberships]);

  // Toggle membership status with confirmation
  const toggleMembershipStatus = useCallback(async (membership: Membership) => {
    const action = membership.estado ? 'desactivar' : 'reactivar';
    const stats = getMembershipStats(membership.id);
    
    // Show warning if there are active contracts
    let warningText = membership.estado ? 
      'Al desactivar la membresía, no se podrán crear nuevos contratos con ella.' :
      'Al reactivar la membresía, estará disponible para nuevos contratos.';
      
    if (membership.estado && stats.activeContracts > 0) {
      warningText += `\n\nActualmente tiene ${stats.activeContracts} contrato(s) activo(s) que no se verán afectados.`;
    }

    const result = await Swal.fire({
      title: `¿Está seguro de ${action} esta membresía?`,
      text: warningText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        if (membership.estado) {
          await membershipService.deactivateMembership(membership.id);
        } else {
          await membershipService.reactivateMembership(membership.id);
        }
          
          await refreshMemberships();
          
          Swal.fire({
            title: '¡Éxito!',
            text: `Membresía "${membership.nombre}" ${action}da correctamente`,
            icon: 'success',
            confirmButtonColor: '#000',
            timer: 3000,
            showConfirmButton: false
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || `Error al ${action} la membresía`;
          
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#000',
          });
        }
      }
  }, [getMembershipStats, refreshMemberships]);

  // Get membership by ID
  const getMembershipById = useCallback((id: string) => {
    return memberships.find(m => m.id === id);
  }, [memberships]);

  // Check if name is unique
  const isNameUnique = useCallback((name: string, excludeId?: string) => {
    return !memberships.some(m => 
      m.nombre.toLowerCase() === name.toLowerCase() && m.id !== excludeId
    );
  }, [memberships]);

  // Get active memberships for selects
  const getActiveMemberships = useCallback(() => {
    return memberships.filter(m => m.estado);
  }, [memberships]);

  // Get most popular memberships (by active contracts)
  const getPopularMemberships = useCallback((limit: number = 5) => {
    const membershipStats = getAllMembershipStats();
    return membershipStats
      .sort((a, b) => b.stats.activeContracts - a.stats.activeContracts)
      .slice(0, limit);
  }, [getAllMembershipStats]);

  // Validate membership data
  const validateMembershipData = useCallback((data: Partial<Membership>) => {
    return membershipService.validateMembershipData(data);
  }, []);

  return {
    // Data
    memberships,
    activeMemberships: getActiveMemberships(),
    membershipStats: getAllMembershipStats(),
    popularMemberships: getPopularMemberships(),
    
    // Loading states
    membershipsLoading,
    isCreating,
    isUpdating,
    
    // Actions
    createMembership,
    updateMembership,
    toggleMembershipStatus,
    refreshMemberships,
    
    // Utilities
    getMembershipById,
    getMembershipStats,
    getPopularMemberships,
    validateMembershipData,
    isNameUnique,
  };
};