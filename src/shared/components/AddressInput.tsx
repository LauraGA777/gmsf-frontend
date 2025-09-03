import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { useColombianAddressValidation } from '@/shared/hooks/useColombianAddressValidation';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  forceShowError?: boolean;
  className?: string;
  placeholder?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  label = "Dirección",
  required = false,
  forceShowError = false,
  className = "",
  placeholder
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const { validateAddress, formatAddress, getPlaceholder, getAllowedCharacters } = useColombianAddressValidation();

  const validation = validateAddress(internalValue);
  const shouldShowError = (hasInteracted || forceShowError) && !validation.isValid && internalValue.length > 0;
  const shouldShowSuccess = hasInteracted && validation.isValid && internalValue.length > 0;

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Filtrar caracteres no permitidos
    const allowedRegex = getAllowedCharacters();
    if (newValue === '' || allowedRegex.test(newValue)) {
      setInternalValue(newValue);
      setHasInteracted(true);
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    setHasInteracted(true);
    // Formatear la dirección al perder el foco
    if (validation.isValid && validation.formattedAddress) {
      const formatted = formatAddress(internalValue);
      setInternalValue(formatted);
      onChange(formatted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de control (backspace, delete, arrows, etc.)
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'];
    if (controlKeys.includes(e.key)) {
      return;
    }

    // Verificar si el carácter está permitido
    const allowedRegex = getAllowedCharacters();
    if (!allowedRegex.test(e.key)) {
      e.preventDefault();
    }
  };

  const inputClassName = `
    ${className}
    ${shouldShowError ? 'border-red-500 focus:border-red-500' : ''}
    ${shouldShowSuccess ? 'border-green-500 focus:border-green-500' : ''}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`pl-10 ${inputClassName}`}
          placeholder={placeholder || getPlaceholder()}
          required={required}
          maxLength={100}
        />
        
        {shouldShowSuccess && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        
        {shouldShowError && (
          <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {shouldShowError && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {validation.error}
        </p>
      )}

      {shouldShowSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Dirección válida
        </p>
      )}

      {!hasInteracted && (
        <p className="text-xs text-gray-500 mt-1">
          Ejemplo: Calle 45 #120B-12, Carrera 7 #32-10, Diagonal 25 #15-30
        </p>
      )}

      <p className="text-xs text-gray-400 mt-1">
        Tipos válidos: Calle (Cl), Carrera (Cra), Diagonal (Dg), Transversal (Tv), Avenida (Av), Autopista
      </p>
    </div>
  );
};

export default AddressInput;
