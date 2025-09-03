import React, { forwardRef, useEffect, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { useBirthDateValidation, BirthDateValidationOptions } from '@/shared/hooks/useBirthDateValidation';
import { cn } from '@/shared/lib/utils';

export interface BirthDateInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  role: 'cliente' | 'entrenador';
  minAge?: number;
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

export const BirthDateInput = forwardRef<HTMLInputElement, BirthDateInputProps>(
  ({
    value,
    onChange,
    onBlur,
    role,
    minAge = role === 'cliente' ? 13 : 16,
    label,
    placeholder,
    required = true,
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
    const [displayValue, setDisplayValue] = useState('');

    const validationOptions: BirthDateValidationOptions = {
      role,
      minAge,
      allowFutureDates: false
    };

    const {
      validateBirthDate,
      getPlaceholder
    } = useBirthDateValidation(validationOptions);

    const [localValidation, setLocalValidation] = useState(validateBirthDate(value));

    // Formatear fecha de YYYY-MM-DD a DD/MM/YYYY para mostrar
    const formatForDisplay = (dateStr: string): string => {
      if (!dateStr) return '';
      
      // Si ya está en formato DD/MM/YYYY, devolverlo tal como está
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Si está en formato YYYY-MM-DD, convertirlo
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      
      return dateStr;
    };

    // Formatear fecha de DD/MM/YYYY a YYYY-MM-DD para el valor interno
    const formatForValue = (displayStr: string): string => {
      if (!displayStr) return '';
      
      // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
      if (/^\d{4}-\d{2}-\d{2}$/.test(displayStr)) {
        return displayStr;
      }
      
      // Si está en formato DD/MM/YYYY, convertirlo
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(displayStr)) {
        const [day, month, year] = displayStr.split('/');
        return `${year}-${month}-${day}`;
      }
      
      return displayStr;
    };

    // Inicializar el valor de display cuando cambie el value prop
    useEffect(() => {
      setDisplayValue(formatForDisplay(value));
    }, [value]);

    // Actualizar validación cuando cambie el valor
    useEffect(() => {
      if (showRealTimeValidation && value) {
        const validation = validateBirthDate(value);
        setLocalValidation(validation);
      }
    }, [value, showRealTimeValidation, validateBirthDate]);

    // Determinar qué error mostrar - solo después de que el usuario haya interactuado
    // Los errores externos (de React Hook Form) solo se muestran si forceShowError es true
    const shouldShowExternalError = externalError && (hasBlurred || forceShowError);
    const shouldShowLocalError = showValidation && hasBlurred && localValidation.error;
    const displayError = shouldShowExternalError || shouldShowLocalError || null;
    
    const isValid = !displayError && value && localValidation.isValid;
    const showSuccess = showValidation && isValid && hasBlurred;

    // Aplicar máscara de fecha DD/MM/YYYY
    const applyDateMask = (inputValue: string): string => {
      // Remover todo lo que no sean dígitos
      const numbers = inputValue.replace(/\D/g, '');
      
      // Aplicar máscara progresivamente
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      } else if (numbers.length <= 8) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
      } else {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
      }
    };

    // Manejar el cambio de valor con máscara
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      const maskedValue = applyDateMask(inputValue);
      
      setDisplayValue(maskedValue);
      
      // Solo actualizar el valor real si la fecha está completa
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(maskedValue)) {
        const formattedValue = formatForValue(maskedValue);
        onChange(formattedValue);
        
        if (showRealTimeValidation) {
          const validation = validateBirthDate(formattedValue);
          setLocalValidation(validation);
        }
      } else if (maskedValue === '') {
        onChange('');
      }
    };

    // Manejar cuando el campo pierde el foco
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasBlurred(true);
      
      // Validar cuando pierda el foco
      if (displayValue && /^\d{2}\/\d{2}\/\d{4}$/.test(displayValue)) {
        const formattedValue = formatForValue(displayValue);
        const validation = validateBirthDate(formattedValue);
        setLocalValidation(validation);
      }
      
      if (onBlur) {
        onBlur(event);
      }
    };

    // Manejar cuando el campo recibe el foco
    const handleFocus = () => {
      setIsFocused(true);
    };

    // Determinar el placeholder a usar
    const effectivePlaceholder = placeholder || getPlaceholder();

    // Determinar label por defecto
    const effectiveLabel = label || 'Fecha de Nacimiento';

    // Manejar teclas especiales
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir teclas de control (backspace, delete, arrows, etc.)
      if ([
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ].includes(event.key)) {
        return;
      }

      // Permitir Ctrl+A, Ctrl+C, Ctrl+V, etc.
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      // Solo permitir números
      if (!/\d/.test(event.key)) {
        event.preventDefault();
      }
    };

    return (
      <div className={cn('space-y-1', className)}>
        {effectiveLabel && (
          <Label 
            htmlFor={id} 
            className={cn(
              'text-sm font-medium',
              required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
              displayError && 'text-red-600',
              showSuccess && 'text-green-600'
            )}
          >
            <Calendar className="inline h-4 w-4 mr-1" />
            {effectiveLabel}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            type="text"
            id={id}
            name={name}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required}
            placeholder={effectivePlaceholder}
            maxLength={10} // DD/MM/YYYY = 10 caracteres
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
          <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {displayError}
          </p>
        )}

        {showSuccess && showValidation && localValidation.age !== null && (
          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Edad válida: {localValidation.age} años
          </p>
        )}

        {/* Información adicional */}
        {isFocused && !displayError && !showSuccess && (
          <p className="text-xs text-gray-500 mt-1">
            {effectivePlaceholder}
          </p>
        )}
      </div>
    );
  }
);

BirthDateInput.displayName = 'BirthDateInput';

export default BirthDateInput;
