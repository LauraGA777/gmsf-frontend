import React, { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useEmailValidation } from '@/shared/hooks/useEmailValidation';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  forceShowError?: boolean;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  onBlur,
  label = 'Correo electrónico',
  disabled = false,
  required = false,
  className = '',
  forceShowError = false
}) => {
  const [hasBlurred, setHasBlurred] = useState(false);
  const { 
    validateEmail, 
    formatEmail, 
    getPlaceholder, 
    getAllowedCharacters 
  } = useEmailValidation();

  const validation = validateEmail(value);
  const shouldShowError = (hasBlurred || forceShowError) && !validation.isValid && value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Filtrar caracteres no permitidos en tiempo real
    const allowedChars = getAllowedCharacters();
    if (allowedChars.test(inputValue)) {
      // LÍMITE ESTRICTO: No permitir más de 64 caracteres
      const limitedValue = inputValue.slice(0, 64);
      const formattedValue = formatEmail(limitedValue);
      onChange(formattedValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Bloquear caracteres no permitidos
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Permitir teclas de control
    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Verificar si el carácter es permitido
    const allowedChars = /^[a-zA-Z0-9._@-]$/;
    if (!allowedChars.test(e.key)) {
      e.preventDefault();
    }

    // No permitir múltiples @
    if (e.key === '@' && value.includes('@')) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Filtrar caracteres no permitidos
    const allowedChars = getAllowedCharacters();
    if (allowedChars.test(pastedText)) {
      // LÍMITE ESTRICTO: No permitir más de 64 caracteres total
      const combinedValue = value + pastedText;
      const limitedValue = combinedValue.slice(0, 64);
      const formattedValue = formatEmail(limitedValue);
      onChange(formattedValue);
    }
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
        htmlFor="email-input" 
        className={`text-sm font-medium ${shouldShowError ? 'text-red-600' : 'text-gray-700'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Input
        id="email-input"
        type="email"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder={getPlaceholder()}
        disabled={disabled}
        maxLength={64}
        className={`
          transition-colors duration-200
          ${shouldShowError 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
        `}
        autoComplete="email"
      />
      
      {shouldShowError && (
        <p className="text-sm text-red-600 mt-1">
          {validation.error}
        </p>
      )}
      
      {/* ✅ Removed success message: ✓ Correo electrónico válido */}
    </div>
  );
};

export default EmailInput;
