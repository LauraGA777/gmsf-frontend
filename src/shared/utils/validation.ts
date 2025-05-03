/**
 * Valida un correo electrónico
 * @param email - Correo electrónico a validar
 * @returns Boolean indicando si el correo es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida un número de teléfono (7-10 dígitos)
 * @param phone - Número de teléfono a validar
 * @returns Boolean indicando si el teléfono es válido
 */
export function isValidPhone(phone: string): boolean {
  return /^\d{7,10}$/.test(phone.replace(/\D/g, ""))
}

/**
 * Valida un número de documento (6-12 dígitos)
 * @param document - Número de documento a validar
 * @returns Boolean indicando si el documento es válido
 */
export function isValidDocument(document: string): boolean {
  return /^\d{6,12}$/.test(document.replace(/\D/g, ""))
}

/**
 * Valida que un campo tenga un valor no vacío
 * @param value - Valor a validar
 * @returns Boolean indicando si el valor es válido
 */
export function isRequired(value: string | null | undefined): boolean {
  if (value === null || value === undefined) return false
  return value.trim().length > 0
}

/**
 * Valida que un valor numérico esté dentro de un rango
 * @param value - Valor a validar
 * @param min - Valor mínimo (opcional)
 * @param max - Valor máximo (opcional)
 * @returns Boolean indicando si el valor está en el rango
 */
export function isInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

/**
 * Valida una contraseña (mínimo 8 caracteres, al menos una letra y un número)
 * @param password - Contraseña a validar
 * @returns Boolean indicando si la contraseña es válida
 */
export function isValidPassword(password: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)
}

export default {
  isValidEmail,
  isValidPhone,
  isValidDocument,
  isRequired,
  isInRange,
  isValidPassword,
}

