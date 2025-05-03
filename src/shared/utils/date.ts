import { format, addDays, differenceInDays, isValid, parse } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Formatea una fecha en formato largo
 * @param date - Fecha a formatear
 * @param formatStr - Formato a utilizar (por defecto dd MMMM, yyyy)
 * @returns Fecha formateada
 */
export function formatLongDate(date: Date | string | null, formatStr = "dd MMMM, yyyy"): string {
  if (!date) return "N/A"
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (!isValid(dateObj)) return "Fecha inválida"
    return format(dateObj, formatStr, { locale: es })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Error de formato"
  }
}

/**
 * Calcula la fecha de vencimiento basada en una duración en días
 * @param startDate - Fecha de inicio
 * @param durationDays - Duración en días
 * @returns Fecha de vencimiento
 */
export function calculateEndDate(startDate: Date | string, durationDays: number): Date {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  return addDays(start, durationDays)
}

/**
 * Verifica si una fecha está vencida
 * @param date - Fecha a verificar
 * @returns Boolean indicando si la fecha está vencida
 */
export function isExpired(date: Date | string | null): boolean {
  if (!date) return false
  const targetDate = typeof date === "string" ? new Date(date) : date
  const today = new Date()

  // Normalizar las fechas para comparar solo días
  today.setHours(0, 0, 0, 0)
  const normalizedTarget = new Date(targetDate)
  normalizedTarget.setHours(0, 0, 0, 0)

  return normalizedTarget < today
}

/**
 * Verifica si una fecha está próxima a vencer (dentro de los próximos días)
 * @param date - Fecha a verificar
 * @param days - Días para considerar próximo a vencer (por defecto 7)
 * @returns Boolean indicando si la fecha está próxima a vencer
 */
export function isAboutToExpire(date: Date | string | null, days = 7): boolean {
  if (!date || isExpired(date)) return false

  const targetDate = typeof date === "string" ? new Date(date) : date
  const today = new Date()

  // Normalizar las fechas para comparar solo días
  today.setHours(0, 0, 0, 0)
  const normalizedTarget = new Date(targetDate)
  normalizedTarget.setHours(0, 0, 0, 0)

  const daysRemaining = differenceInDays(normalizedTarget, today)
  return daysRemaining <= days && daysRemaining > 0
}

/**
 * Parsea una fecha desde un string con formato específico
 * @param dateStr - String de fecha
 * @param formatStr - Formato de la fecha (por defecto dd/MM/yyyy)
 * @returns Objeto Date o null si es inválido
 */
export function parseDate(dateStr: string, formatStr = "dd/MM/yyyy"): Date | null {
  try {
    const parsedDate = parse(dateStr, formatStr, new Date())
    return isValid(parsedDate) ? parsedDate : null
  } catch (error) {
    console.error("Error parsing date:", error)
    return null
  }
}

export default {
  formatLongDate,
  calculateEndDate,
  isExpired,
  isAboutToExpire,
  parseDate,
}

