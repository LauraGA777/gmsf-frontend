import { useState, useCallback, useEffect } from 'react';

export type DocumentType = 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';

export interface DocumentValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DocumentValidationHook {
  validateDocument: (type: DocumentType, value: string) => DocumentValidationResult;
  getDocumentPattern: (type: DocumentType) => string;
  getDocumentInputMode: (type: DocumentType) => 'numeric' | 'text';
  getDocumentPlaceholder: (type: DocumentType) => string;
  getDocumentHelperText: (type: DocumentType) => string;
}

const DOCUMENT_RULES = {
  CC: {
    pattern: /^\d+$/,
    inputMode: 'numeric' as const,
    placeholder: 'Ej: 1234567890',
    helperText: 'Solo números (5-20 dígitos)',
    errorMessage: 'La cédula de ciudadanía solo debe contener números'
  },
  CE: {
    pattern: /^\d+$/,
    inputMode: 'numeric' as const,
    placeholder: 'Ej: 1234567890',
    helperText: 'Solo números (5-20 dígitos)',
    errorMessage: 'La cédula de extranjería solo debe contener números'
  },
  TI: {
    pattern: /^\d+$/,
    inputMode: 'numeric' as const,
    placeholder: 'Ej: 1234567890',
    helperText: 'Solo números (5-20 dígitos)',
    errorMessage: 'La tarjeta de identidad solo debe contener números'
  },
  PP: {
    pattern: /^[A-Za-z0-9]+$/,
    inputMode: 'text' as const,
    placeholder: 'Ej: AB1234567',
    helperText: 'Números y letras (5-20 caracteres)',
    errorMessage: 'El pasaporte solo debe contener números y letras'
  },
  DIE: {
    pattern: /^[A-Za-z0-9]+$/,
    inputMode: 'text' as const,
    placeholder: 'Ej: XY9876543',
    helperText: 'Números y letras (5-20 caracteres)',
    errorMessage: 'El documento de identificación extranjera solo debe contener números y letras'
  }
};

export const useDocumentValidation = (): DocumentValidationHook => {
  const validateDocument = useCallback((type: DocumentType, value: string): DocumentValidationResult => {
    if (!value) {
      return { isValid: false, error: 'El número de documento es requerido' };
    }

    const trimmedValue = value.trim();

    // Validar longitud
    if (trimmedValue.length < 5) {
      return { isValid: false, error: 'El número de documento debe tener al menos 5 caracteres' };
    }

    if (trimmedValue.length > 20) {
      return { isValid: false, error: 'El número de documento no puede tener más de 20 caracteres' };
    }

    // Validar formato según tipo de documento
    const rule = DOCUMENT_RULES[type];
    if (!rule.pattern.test(trimmedValue)) {
      return { isValid: false, error: rule.errorMessage };
    }

    return { isValid: true };
  }, []);

  const getDocumentPattern = useCallback((type: DocumentType): string => {
    const rule = DOCUMENT_RULES[type];
    return rule.pattern.source;
  }, []);

  const getDocumentInputMode = useCallback((type: DocumentType): 'numeric' | 'text' => {
    return DOCUMENT_RULES[type].inputMode;
  }, []);

  const getDocumentPlaceholder = useCallback((type: DocumentType): string => {
    return DOCUMENT_RULES[type].placeholder;
  }, []);

  const getDocumentHelperText = useCallback((type: DocumentType): string => {
    return DOCUMENT_RULES[type].helperText;
  }, []);

  return {
    validateDocument,
    getDocumentPattern,
    getDocumentInputMode,
    getDocumentPlaceholder,
    getDocumentHelperText
  };
};

/**
 * Hook para validación en tiempo real del número de documento
 */
export const useRealtimeDocumentValidation = (
  type: DocumentType,
  value: string,
  enabled: boolean = true
) => {
  const { validateDocument } = useDocumentValidation();
  const [validation, setValidation] = useState<DocumentValidationResult>({ isValid: true });

  const validateAndSet = useCallback(() => {
    if (!enabled || !value) {
      setValidation({ isValid: true });
      return;
    }

    const result = validateDocument(type, value);
    setValidation(result);
  }, [validateDocument, type, value, enabled]);

  // Validar inmediatamente cuando cambia el valor o tipo
  useEffect(() => {
    validateAndSet();
  }, [validateAndSet]);

  return validation;
};

export default useDocumentValidation;
