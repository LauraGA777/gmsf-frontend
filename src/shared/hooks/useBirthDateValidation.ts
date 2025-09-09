import { useCallback } from 'react';
import { 
  parseLocalDate, 
  formatDateForDisplay as formatForDisplay, 
  calculateAge,
  getTodayAsLocalDate,
  isValidDateFormat as isValidFormat
} from '@/shared/utils/dateUtils';

export interface BirthDateValidationOptions {
  role: 'cliente' | 'entrenador';
  minAge: number;
  allowFutureDates?: boolean;
}

export interface BirthDateValidationResult {
  isValid: boolean;
  error: string | null;
  age: number | null;
}

export interface BirthDateHookReturn {
  validateBirthDate: (dateString: string) => BirthDateValidationResult;
  formatDateForDisplay: (dateString: string) => string;
  formatDateForInput: (dateString: string) => string;
  isValidDateFormat: (dateString: string) => boolean;
  getMinDate: () => string;
  getMaxDate: () => string;
  getPlaceholder: () => string;
}

export const useBirthDateValidation = (options: BirthDateValidationOptions): BirthDateHookReturn => {
  const { role, minAge, allowFutureDates = false } = options;

  // Validar que la fecha de nacimiento cumpla con los requisitos
  const validateBirthDate = useCallback((dateString: string): BirthDateValidationResult => {
    if (!dateString) {
      return {
        isValid: false,
        error: 'La fecha de nacimiento es requerida',
        age: null
      };
    }

    // Validar formato de fecha
    if (!isValidFormat(dateString)) {
      return {
        isValid: false,
        error: 'Formato de fecha inválido',
        age: null
      };
    }

    const date = parseLocalDate(dateString);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: 'Fecha inválida',
        age: null
      };
    }

    // Validar que no sea una fecha futura
    const today = new Date();
    if (!allowFutureDates && date > today) {
      return {
        isValid: false,
        error: 'La fecha de nacimiento no puede ser una fecha futura',
        age: null
      };
    }

    // Calcular edad usando la utilidad
    const age = calculateAge(dateString);

    // Validar edad mínima
    if (age < minAge) {
      const roleText = role === 'cliente' ? 'cliente' : 'entrenador';
      return {
        isValid: false,
        error: `El ${roleText} debe tener al menos ${minAge} años`,
        age
      };
    }

    // Validar edad máxima (no más de 100 años)
    if (age > 100) {
      return {
        isValid: false,
        error: 'La edad no puede ser superior a los 100 años',
        age
      };
    }

    return {
      isValid: true,
      error: null,
      age
    };
  }, [minAge, role, allowFutureDates]);

  // Calcular la edad basada en la fecha de nacimiento (ya no necesaria, usar utilidad)
  
  // Formatear fecha para mostrar (DD/MM/AAAA)
  const formatDateForDisplay = useCallback((dateString: string): string => {
    return formatForDisplay(dateString);
  }, []);

  // Formatear fecha para input type="date" (YYYY-MM-DD)  
  const formatDateForInput = useCallback((dateString: string): string => {
    if (!dateString) return '';
    
    // Si es una fecha ISO del servidor, extraer solo la parte de fecha
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    return dateString;
  }, []);

  // Validar formato de fecha básico
  const isValidDateFormat = useCallback((dateString: string): boolean => {
    return isValidFormat(dateString);
  }, []);

  // Obtener fecha mínima permitida (para el atributo min del input)
  const getMinDate = useCallback((): string => {
    const today = new Date();
    const minYear = today.getFullYear() - 100; // Máximo 100 años atrás
    return `${minYear}-01-01`;
  }, []);

  // Obtener fecha máxima permitida (para el atributo max del input)
  const getMaxDate = useCallback((): string => {
    if (allowFutureDates) {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 10);
      const year = maxDate.getFullYear();
      const month = String(maxDate.getMonth() + 1).padStart(2, '0');
      const day = String(maxDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return getTodayAsLocalDate();
  }, [allowFutureDates]);

  // Obtener placeholder según el rol
  const getPlaceholder = useCallback((): string => {
    if (role === 'cliente') {
      return `DD/MM/AAAA (mínimo ${minAge} años)`;
    } else if (role === 'entrenador') {
      return `DD/MM/AAAA (mínimo ${minAge} años)`;
    }
    return 'DD/MM/AAAA';
  }, [role, minAge]);

  return {
    validateBirthDate,
    formatDateForDisplay,
    formatDateForInput,
    isValidDateFormat,
    getMinDate,
    getMaxDate,
    getPlaceholder
  };
};

export default useBirthDateValidation;
