import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { usePhoneValidation } from '@/shared/hooks/usePhoneValidation';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  forceShowError?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  label = 'Número de teléfono',
  disabled = false,
  required = false,
  className = '',
  forceShowError = false
}) => {
  const [hasBlurred, setHasBlurred] = useState(false);
  const { 
    validatePhone, 
    filterPhoneInput, 
    getPlaceholder 
  } = usePhoneValidation();

  const validation = validatePhone(value);
  const shouldShowError = (hasBlurred || forceShowError) && !validation.isValid && value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Filtrar para permitir solo números en tiempo real
    const filteredValue = filterPhoneInput(inputValue);
    
    // LÍMITE ESTRICTO: No permitir más de 20 caracteres
    const limitedValue = filteredValue.slice(0, 20);
    
    onChange(limitedValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Bloquear cualquier tecla que no sea número, backspace, delete, tab, etc.
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const filteredText = filterPhoneInput(pastedText);
    
    // LÍMITE ESTRICTO: No permitir más de 20 caracteres total
    const combinedValue = value + filteredText;
    const limitedValue = combinedValue.slice(0, 20);
    const finalValue = filterPhoneInput(limitedValue);
    
    onChange(finalValue);
  };

  const handleBlur = () => {
    setHasBlurred(true);
    if (onBlur) {
      onBlur();
    }
  };

  // Resetear hasBlurred cuando el valor se vacíe
  useEffect(() => {
    if (!value) {
      setHasBlurred(false);
    }
  }, [value]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label 
        htmlFor="phone-input" 
        className={`text-sm font-medium ${shouldShowError ? 'text-red-600' : 'text-gray-700'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Input
        id="phone-input"
        type="tel"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder={getPlaceholder()}
        disabled={disabled}
        maxLength={20}
        className={`
          transition-colors duration-200
          ${shouldShowError 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
        `}
        autoComplete="tel"
        inputMode="numeric"
        pattern="[0-9]*"
      />
      
      {shouldShowError && (
        <p className="text-sm text-red-600 mt-1">
          {validation.error}
        </p>
      )}
      
      {/* ✅ Removed success message: ✓ Número de teléfono válido */}
    </div>
  );
};

export default PhoneInput;
