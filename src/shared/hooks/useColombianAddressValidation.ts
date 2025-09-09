import { useCallback } from 'react';

export interface ColombianAddressValidationResult {
  isValid: boolean;
  error: string | null;
  formattedAddress: string | null;
}

export interface ColombianAddressHookReturn {
  validateAddress: (address: string) => ColombianAddressValidationResult;
  formatAddress: (address: string) => string;
  isValidAddressFormat: (address: string) => boolean;
  getPlaceholder: () => string;
  getAllowedCharacters: () => RegExp;
}

export const useColombianAddressValidation = (): ColombianAddressHookReturn => {
  
  // Tipos de vías aceptados con sus abreviaciones
  const roadTypes = {
    'calle': ['calle', 'cl', 'call'],
    'carrera': ['carrera', 'cra', 'cr', 'carr'],
    'diagonal': ['diagonal', 'dg', 'diag'],
    'transversal': ['transversal', 'tv', 'trans', 'tranv'],
    'avenida': ['avenida', 'av', 'aven'],
    'autopista': ['autopista', 'aut', 'auto']
  };

  // Regex para caracteres permitidos (letras, números, espacios, #, -, letras especiales)
  const allowedCharacters = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-ABCDEFGHIJKLMNOPQRSTUVWXYZ]+$/;

  // Validar dirección completa
  const validateAddress = useCallback((address: string): ColombianAddressValidationResult => {
    if (!address || address.trim().length === 0) {
      return {
        isValid: false,
        error: 'La dirección es requerida',
        formattedAddress: null
      };
    }

    const trimmedAddress = address.trim();

    // Validar longitud mínima
    if (trimmedAddress.length < 5) {
      return {
        isValid: false,
        error: 'La dirección debe tener al menos 5 caracteres',
        formattedAddress: null
      };
    }

    // Validar caracteres permitidos
    if (!allowedCharacters.test(trimmedAddress)) {
      return {
        isValid: false,
        error: 'La dirección contiene caracteres no permitidos. Solo se permiten letras, números, espacios, # y -',
        formattedAddress: null
      };
    }

    // Validar que comience con un tipo de vía válido
    const startsWithValidRoadType = Object.values(roadTypes).some(types => 
      types.some(type => trimmedAddress.toLowerCase().startsWith(type.toLowerCase()))
    );

    if (!startsWithValidRoadType) {
      return {
        isValid: false,
        error: 'La dirección debe comenzar con un tipo de vía válido (Calle, Carrera, Diagonal, Transversal, Avenida, Autopista)',
        formattedAddress: null
      };
    }

    // Validar que contenga números
    if (!/\d/.test(trimmedAddress)) {
      return {
        isValid: false,
        error: 'La dirección debe contener números',
        formattedAddress: null
      };
    }

    // Validar formato completo (más flexible para permitir direcciones variadas)
    const hasBasicFormat = /\d+.*#.*\d+.*-.*\d+/i.test(trimmedAddress) || 
                          /\d+.*#.*\d+[a-zA-Z]*.*-.*\d+/i.test(trimmedAddress) ||
                          /\d+[a-zA-Z]*.*#.*\d+.*-.*\d+/i.test(trimmedAddress);
    
    if (!hasBasicFormat) {
      return {
        isValid: false,
        error: 'Formato de dirección incorrecto. Use el formato: Tipo de vía + número # número - número (Ej: Calle 45 #120B-12, Carrera 23AA #20-245)',
        formattedAddress: null
      };
    }

    return {
      isValid: true,
      error: null,
      formattedAddress: formatAddress(trimmedAddress)
    };
  }, []);

  // Formatear dirección (capitalizar primera letra de cada palabra)
  const formatAddress = useCallback((address: string): string => {
    if (!address) return '';
    
    return address
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Capitalizar solo la primera letra de palabras que no son números o símbolos
        if (/^[a-záéíóúñ]/i.test(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }, []);

  // Validación básica de formato
  const isValidAddressFormat = useCallback((address: string): boolean => {
    if (!address) return false;
    return allowedCharacters.test(address) && address.trim().length >= 5;
  }, []);

  // Obtener placeholder
  const getPlaceholder = useCallback((): string => {
    return 'Ej: Calle 45 #120B-12, Carrera 23AA #20-245';
  }, []);

  // Obtener regex de caracteres permitidos
  const getAllowedCharacters = useCallback((): RegExp => {
    return allowedCharacters;
  }, []);

  return {
    validateAddress,
    formatAddress,
    isValidAddressFormat,
    getPlaceholder,
    getAllowedCharacters
  };
};

export default useColombianAddressValidation;
