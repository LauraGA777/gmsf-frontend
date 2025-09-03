import { useCallback } from 'react';

export interface PhoneValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface PhoneHookReturn {
  validatePhone: (phone: string) => PhoneValidationResult;
  formatPhone: (phone: string) => string;
  filterPhoneInput: (value: string) => string;
  getPlaceholder: () => string;
  getAllowedCharacters: () => RegExp;
}

export const usePhoneValidation = (): PhoneHookReturn => {
  
  // Validar el teléfono
  const validatePhone = useCallback((phone: string): PhoneValidationResult => {
    if (!phone) {
      return {
        isValid: false,
        error: 'El número de teléfono es requerido'
      };
    }

    // Verificar que solo contenga números
    if (!/^\d+$/.test(phone)) {
      return {
        isValid: false,
        error: 'El teléfono solo puede contener números'
      };
    }

    // Verificar longitud mínima
    if (phone.length < 5) {
      return {
        isValid: false,
        error: 'El teléfono debe tener mínimo 5 caracteres'
      };
    }

    // Verificar longitud máxima
    if (phone.length > 20) {
      return {
        isValid: false,
        error: 'El teléfono debe tener máximo 20 caracteres'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }, []);

  // Formatear teléfono (quitar espacios y caracteres no numéricos)
  const formatPhone = useCallback((phone: string): string => {
    return phone.replace(/\D/g, '');
  }, []);

  // Filtrar entrada de teléfono para permitir solo números
  const filterPhoneInput = useCallback((value: string): string => {
    // Eliminar cualquier carácter que no sea número
    return value.replace(/\D/g, '');
  }, []);

  // Obtener placeholder
  const getPlaceholder = useCallback((): string => {
    return 'Ej: 3001234567';
  }, []);

  // Obtener regex de caracteres permitidos
  const getAllowedCharacters = useCallback((): RegExp => {
    // Solo números
    return /^\d*$/;
  }, []);

  return {
    validatePhone,
    formatPhone,
    filterPhoneInput,
    getPlaceholder,
    getAllowedCharacters
  };
};

export default usePhoneValidation;
