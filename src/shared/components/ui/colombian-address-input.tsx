import React, { forwardRef, useEffect, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { useColombianAddressValidation } from '@/shared/hooks/useColombianAddressValidation';
import { cn } from '@/shared/lib/utils';

export interface ColombianAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  showValidation?: boolean;
  showRealTimeValidation?: boolean;
  name?: string;
  id?: string;
  forceShowError?: boolean; // Para mostrar errores después del submit
}

export const ColombianAddressInput = forwardRef<HTMLInputElement, ColombianAddressInputProps>(
  ({
    value,
    onChange,
    onBlur,
    label = 'Dirección',
    placeholder,
    required = false,
    disabled = false,
    className,
    error: externalError,
    showValidation = true,
    showRealTimeValidation = true,
    forceShowError = false,
    name,
    id,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasBlurred, setHasBlurred] = useState(false);

    const {
      validateAddress,
      getPlaceholder,
      getAllowedCharacters
    } = useColombianAddressValidation();

    const [localValidation, setLocalValidation] = useState(validateAddress(value));

    // Actualizar validación cuando cambie el valor
    useEffect(() => {
      if (showRealTimeValidation && value) {
        const validation = validateAddress(value);
        setLocalValidation(validation);
      }
    }, [value, showRealTimeValidation, validateAddress]);

    // Determinar qué error mostrar - solo después de que el usuario haya interactuado
    // Los errores externos (de React Hook Form) solo se muestran si forceShowError es true
    const shouldShowExternalError = externalError && (hasBlurred || forceShowError);
    const shouldShowLocalError = showValidation && hasBlurred && localValidation.error;
    const displayError = shouldShowExternalError || shouldShowLocalError || null;
    
    const isValid = !displayError && value && localValidation.isValid;
    const showSuccess = showValidation && isValid && hasBlurred;

    // Manejar el cambio de valor con filtrado de caracteres
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      
      // Filtrar caracteres no permitidos en tiempo real
      const allowedChars = getAllowedCharacters();
      if (newValue === '' || allowedChars.test(newValue)) {
        onChange(newValue);
        
        if (showRealTimeValidation && newValue) {
          const validation = validateAddress(newValue);
          setLocalValidation(validation);
        }
      }
    };

    // Manejar cuando el campo pierde el foco
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasBlurred(true);
      
      if (value) {
        const validation = validateAddress(value);
        setLocalValidation(validation);
        
        // Auto-formatear al perder el foco si es válido
        if (validation.isValid && validation.formattedAddress) {
          onChange(validation.formattedAddress);
        }
      }
      
      if (onBlur) {
        onBlur(event);
      }
    };

    // Manejar cuando el campo recibe el foco
    const handleFocus = () => {
      setIsFocused(true);
    };

    // Filtrar entrada de teclado para prevenir caracteres no permitidos
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const char = event.key;
      const allowedChars = getAllowedCharacters();
      
      // Permitir teclas de control (backspace, delete, arrow keys, etc.)
      if (char.length === 1 && !allowedChars.test(char)) {
        event.preventDefault();
      }
    };

    // Determinar el placeholder a usar
    const effectivePlaceholder = placeholder || getPlaceholder();

    return (
      <div className={cn('space-y-1', className)}>
        {label && (
          <Label 
            htmlFor={id} 
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
              displayError && 'text-red-600',
              showSuccess && 'text-green-600'
            )}
          >
            <MapPin className="inline h-4 w-4 mr-1" />
            {label}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            required={required}
            placeholder={effectivePlaceholder}
            className={cn(
              'pr-10',
              displayError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              showSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500'
            )}
            {...props}
          />
          
          {showValidation && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {displayError && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              {showSuccess && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
        </div>

        {displayError && showValidation && (
          <p className="text-sm text-red-600 flex items-start gap-1 mt-1">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </p>
        )}

        {showSuccess && showValidation && (
          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Dirección válida
          </p>
        )}

        {/* Información de ayuda cuando está enfocado */}
        {isFocused && !displayError && !showSuccess && (
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            <p><strong>Formato:</strong> {effectivePlaceholder}</p>
            <p><strong>Tipos de vía:</strong> Calle, Carrera, Diagonal, Transversal, Avenida, Autopista</p>
            <p><strong>Abreviaciones:</strong> Cl, Cra, Dg, Tv, Av, Aut</p>
          </div>
        )}
      </div>
    );
  }
);

ColombianAddressInput.displayName = 'ColombianAddressInput';

export default ColombianAddressInput;
