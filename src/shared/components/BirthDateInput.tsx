import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useBirthDateValidation } from '@/shared/hooks/useBirthDateValidation';

interface BirthDateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  forceShowError?: boolean;
  role: 'cliente' | 'entrenador';
  className?: string;
  placeholder?: string;
}

export const BirthDateInput: React.FC<BirthDateInputProps> = ({
  value,
  onChange,
  label = "Fecha de Nacimiento",
  required = true,
  forceShowError = false,
  role,
  className = "",
  placeholder
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const minAge = role === 'cliente' ? 13 : 16;
  const { validateBirthDate, getMinDate, getMaxDate, getPlaceholder } = useBirthDateValidation({
    role,
    minAge,
    allowFutureDates: false
  });

  const validation = validateBirthDate(internalValue);
  const shouldShowError = (hasInteracted || forceShowError) && !validation.isValid && internalValue.length > 0;
  const shouldShowSuccess = hasInteracted && validation.isValid && internalValue.length > 0;

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setHasInteracted(true);
    onChange(newValue);
  };

  const handleBlur = () => {
    setHasInteracted(true);
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
          <span className="text-xs text-gray-500 ml-2">
            (mínimo {minAge} años)
          </span>
        </Label>
      )}
      
      <div className="relative">
        <Input
          type="date"
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClassName}
          min={getMinDate()}
          max={getMaxDate()}
          placeholder={placeholder || getPlaceholder()}
          required={required}
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

      {shouldShowSuccess && validation.age !== null && (
        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Edad válida: {validation.age} años
        </p>
      )}

      {internalValue && hasInteracted && (
        <p className="text-xs text-gray-500 mt-1">
          Formato: DD/MM/AAAA
        </p>
      )}
    </div>
  );
};

export default BirthDateInput;
