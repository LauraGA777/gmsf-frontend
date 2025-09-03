import React, { useState, useEffect, forwardRef } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useDocumentValidation, DocumentType } from '@/shared/hooks/useDocumentValidation';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface DocumentInputProps {
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  onTipoDocumentoChange: (tipo: DocumentType) => void;
  onNumeroDocumentoChange: (numero: string) => void;
  disabled?: boolean;
  showLabels?: boolean;
  required?: boolean;
  className?: string;
  errors?: {
    tipo_documento?: string;
    numero_documento?: string;
  };
  showRealTimeValidation?: boolean;
}

export const DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>(
  ({
    tipoDocumento,
    numeroDocumento,
    onTipoDocumentoChange,
    onNumeroDocumentoChange,
    disabled = false,
    showLabels = true,
    required = false,
    className,
    errors,
    showRealTimeValidation = true
  }, ref) => {
    const {
      validateDocument,
      getDocumentPlaceholder,
      getDocumentInputMode,
      getDocumentHelperText
    } = useDocumentValidation();

    const [realtimeValidation, setRealtimeValidation] = useState<{
      isValid: boolean;
      error?: string;
    }>({ isValid: true });

    const [hasStartedTyping, setHasStartedTyping] = useState(false);

    // Validación en tiempo real
    useEffect(() => {
      if (!showRealTimeValidation || !hasStartedTyping || !numeroDocumento) {
        setRealtimeValidation({ isValid: true });
        return;
      }

      const result = validateDocument(tipoDocumento, numeroDocumento);
      setRealtimeValidation(result);
    }, [tipoDocumento, numeroDocumento, validateDocument, showRealTimeValidation, hasStartedTyping]);

    const handleNumeroDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Filtrar caracteres según el tipo de documento
      let filteredValue = value;
      if (tipoDocumento === 'CC' || tipoDocumento === 'CE' || tipoDocumento === 'TI') {
        // Solo números para CC, CE, TI
        filteredValue = value.replace(/[^0-9]/g, '');
      } else if (tipoDocumento === 'PP' || tipoDocumento === 'DIE') {
        // Solo letras y números para PP, DIE
        filteredValue = value.replace(/[^A-Za-z0-9]/g, '');
      }

      // Limitar a 20 caracteres
      if (filteredValue.length > 20) {
        filteredValue = filteredValue.substring(0, 20);
      }

      if (!hasStartedTyping && filteredValue.length > 0) {
        setHasStartedTyping(true);
      }

      onNumeroDocumentoChange(filteredValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevenir caracteres inválidos en tiempo real
      const char = e.key;
      
      if (char === 'Tab' || char === 'Backspace' || char === 'Delete' || char === 'ArrowLeft' || char === 'ArrowRight') {
        return; // Permitir teclas de navegación
      }

      if (tipoDocumento === 'CC' || tipoDocumento === 'CE' || tipoDocumento === 'TI') {
        // Solo números
        if (!/[0-9]/.test(char)) {
          e.preventDefault();
        }
      } else if (tipoDocumento === 'PP' || tipoDocumento === 'DIE') {
        // Solo letras y números
        if (!/[A-Za-z0-9]/.test(char)) {
          e.preventDefault();
        }
      }
    };

    // Determinar el estado de validación para mostrar
    const showError = errors?.numero_documento || (showRealTimeValidation && hasStartedTyping && !realtimeValidation.isValid);
    const errorMessage = errors?.numero_documento || realtimeValidation.error;

    const showSuccess = showRealTimeValidation && hasStartedTyping && realtimeValidation.isValid && numeroDocumento.length >= 5 && !errors?.numero_documento;

    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipo de Documento */}
          <div className="space-y-1">
            {showLabels && (
              <Label htmlFor="tipo_documento">
                Tipo de Documento{required && ' *'}
              </Label>
            )}
            <Select
              value={tipoDocumento}
              onValueChange={onTipoDocumentoChange}
              disabled={disabled}
            >
              <SelectTrigger className={cn(
                errors?.tipo_documento && "border-red-500 focus:border-red-500"
              )}>
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                <SelectItem value="PP">Pasaporte</SelectItem>
                <SelectItem value="DIE">Doc. de Identificación Extranjero</SelectItem>
              </SelectContent>
            </Select>
            {errors?.tipo_documento && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.tipo_documento}
              </p>
            )}
          </div>

          {/* Número de Documento */}
          <div className="space-y-1">
            {showLabels && (
              <Label htmlFor="numero_documento">
                Número de Documento{required && ' *'}
              </Label>
            )}
            <div className="relative">
              <Input
                ref={ref}
                id="numero_documento"
                value={numeroDocumento}
                onChange={handleNumeroDocumentoChange}
                onKeyPress={handleKeyPress}
                placeholder={getDocumentPlaceholder(tipoDocumento)}
                inputMode={getDocumentInputMode(tipoDocumento)}
                disabled={disabled}
                className={cn(
                  "pr-8",
                  showError && "border-red-500 focus:border-red-500",
                  showSuccess && "border-green-500 focus:border-green-500"
                )}
                maxLength={20}
              />
              {/* Iconos de validación */}
              {showError && (
                <AlertTriangle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
              {showSuccess && (
                <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>

            {/* Texto de ayuda */}
            {!showError && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Info className="h-3 w-3" />
                {getDocumentHelperText(tipoDocumento)}
              </div>
            )}

            {/* Mensaje de error */}
            {showError && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertTriangle className="h-4 w-4" />
                {errorMessage}
              </p>
            )}

            {/* Mensaje de éxito */}
            {showSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <CheckCircle className="h-4 w-4" />
                Formato válido
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

DocumentInput.displayName = 'DocumentInput';

export default DocumentInput;
