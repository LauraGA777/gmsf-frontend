import { useCallback } from 'react';

export interface EmailValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface EmailHookReturn {
  validateEmail: (email: string) => EmailValidationResult;
  formatEmail: (email: string) => string;
  getPlaceholder: () => string;
  getAllowedCharacters: () => RegExp;
}

export const useEmailValidation = (): EmailHookReturn => {
  
  // Validar el formato del correo electrónico
  const validateEmail = useCallback((email: string): EmailValidationResult => {
    if (!email) {
      return {
        isValid: false,
        error: 'El correo electrónico es requerido'
      };
    }

    // Verificar longitud total del email
    if (email.length > 64) {
      return {
        isValid: false,
        error: 'El correo electrónico debe tener máximo 64 caracteres'
      };
    }

    // Verificar que no tenga espacios en blanco
    if (/\s/.test(email)) {
      return {
        isValid: false,
        error: 'El correo no puede contener espacios en blanco'
      };
    }

    // Verificar que no tenga doble @
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) {
      return {
        isValid: false,
        error: atCount === 0 ? 'El correo debe contener @' : 'El correo no puede contener múltiples @'
      };
    }

    // Separar parte local y dominio
    const [localPart, domain] = email.split('@');

    // Validar parte local
    if (!localPart || localPart.length === 0) {
      return {
        isValid: false,
        error: 'La parte antes del @ no puede estar vacía'
      };
    }

    if (localPart.length > 80) {
      return {
        isValid: false,
        error: 'La parte antes del @ debe tener máximo 80 caracteres'
      };
    }

    // Validar caracteres permitidos en parte local: alfanuméricos, puntos, guiones y guion bajo
    if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
      return {
        isValid: false,
        error: 'Solo se permiten letras, números, puntos, guiones y guion bajo antes del @'
      };
    }

    // Validar que no empiece o termine con punto
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return {
        isValid: false,
        error: 'La parte antes del @ no puede empezar o terminar con punto'
      };
    }

    // Validar que no tenga puntos consecutivos
    if (/\.{2,}/.test(localPart)) {
      return {
        isValid: false,
        error: 'No se permiten puntos consecutivos antes del @'
      };
    }

    // Validar dominio
    if (!domain || domain.length === 0) {
      return {
        isValid: false,
        error: 'El dominio después del @ no puede estar vacío'
      };
    }

    // El dominio debe contener al menos un punto
    if (!domain.includes('.')) {
      return {
        isValid: false,
        error: 'El dominio debe contener al menos un punto'
      };
    }

    // Validar formato básico del dominio
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return {
        isValid: false,
        error: 'El dominio debe terminar en una extensión válida (ej: .com, .org, .co)'
      };
    }

    // Validar que el dominio no empiece o termine con punto o guión
    if (/^[.-]|[.-]$/.test(domain)) {
      return {
        isValid: false,
        error: 'El dominio no puede empezar o terminar con punto o guión'
      };
    }

    // Validar formato completo del email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        error: 'Formato de correo electrónico inválido'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }, []);

  // Formatear email (convertir a minúsculas y quitar espacios)
  const formatEmail = useCallback((email: string): string => {
    return email.toLowerCase().trim();
  }, []);

  // Obtener placeholder
  const getPlaceholder = useCallback((): string => {
    return 'Ej: usuario@example.com';
  }, []);

  // Obtener regex de caracteres permitidos para filtrado en tiempo real
  const getAllowedCharacters = useCallback((): RegExp => {
    // Permitir alfanuméricos, punto, guión, guion bajo y arroba
    return /^[a-zA-Z0-9._@-]*$/;
  }, []);

  return {
    validateEmail,
    formatEmail,
    getPlaceholder,
    getAllowedCharacters
  };
};

export default useEmailValidation;
