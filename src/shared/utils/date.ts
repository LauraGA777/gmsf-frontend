import { format, addDays, differenceInDays, isValid, parse, parseISO } from "date-fns"
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

/**
 * Formatea una fecha desde string de base de datos
 * @param dateString - String de fecha en formato de base de datos
 * @returns Fecha formateada
 */
export function formatDateFromDB(dateString: string): string {
  try {
    // Si la fecha viene en formato "2025-08-16" (solo fecha)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = parse(dateString, "yyyy-MM-dd", new Date())
      return format(date, "dd/MM/yyyy", { locale: es })
    }

    // Si la fecha viene en formato ISO "2025-08-16T14:21:22.119Z"
    if (dateString.includes("T")) {
      const date = parseISO(dateString)
      return format(date, "dd/MM/yyyy", { locale: es })
    }

    // Si la fecha viene en formato "2025-08-16 14:01:58.831+00"
    if (dateString.includes(" ")) {
      // Convertir a formato ISO para parseISO
      const isoString = dateString.replace(" ", "T").replace("+00", "Z")
      const date = parseISO(isoString)
      return format(date, "dd/MM/yyyy", { locale: es })
    }

    return dateString
  } catch (error) {
    console.error("Error al formatear fecha:", error, "Fecha original:", dateString)
    return dateString
  }
}

/**
 * Formatea una hora desde string de base de datos
 * @param timeString - String de hora en formato de base de datos
 * @returns Hora formateada
 */
export function formatTimeFromDB(timeString: string): string {
  try {
    console.log('🕐 formatTimeFromDB recibió:', timeString);
    
    // ✅ Si viene solo la hora "18:14:52" - MANTENER TAL COMO ESTÁ
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      console.log('🕐 Formato hora pura detectado, devolviendo sin cambios:', timeString);
      return timeString; // ✅ Backend ya envía en formato correcto (Colombia/Bogotá)
    }

    // ⚠️ Si viene como parte de un timestamp completo - EXTRAER SOLO LA HORA
    if (timeString.includes("T")) {
      console.warn('🕐 Timestamp completo recibido, extrayendo solo hora:', timeString);
      
      // Extraer manualmente la hora sin conversiones de zona horaria
      const timeMatch = timeString.match(/T(\d{2}:\d{2}:\d{2})/);
      if (timeMatch) {
        const extractedTime = timeMatch[1];
        console.log('🕐 Hora extraída del timestamp:', extractedTime);
        return extractedTime;
      }
      
      // ❌ Fallback: usar parseISO solo si no se puede extraer manualmente
      console.warn('🕐 No se pudo extraer hora manualmente, usando parseISO');
      const date = parseISO(timeString);
      const formattedTime = format(date, "HH:mm:ss");
      console.log('🕐 Hora formateada con parseISO:', formattedTime);
      return formattedTime;
    }

    // ⚠️ Si viene en formato "2025-08-16 14:01:58.831+00" - EXTRAER SOLO LA HORA
    if (timeString.includes(" ")) {
      console.warn('🕐 Formato con espacio detectado, extrayendo hora:', timeString);
      
      // Extraer manualmente la hora
      const timeMatch = timeString.match(/\s(\d{2}:\d{2}:\d{2})/);
      if (timeMatch) {
        const extractedTime = timeMatch[1];
        console.log('🕐 Hora extraída del formato con espacio:', extractedTime);
        return extractedTime;
      }
    }

    console.log('🕐 Devolviendo string original sin modificar:', timeString);
    return timeString;
  } catch (error) {
    console.error("❌ Error al formatear hora:", error, "Hora original:", timeString);
    return timeString;
  }
}

/**
 * Obtiene el día de la semana desde una fecha de DB
 * @param dateString - String de fecha en formato de base de datos
 * @returns Día de la semana
 */
export function getDayOfWeekFromDB(dateString: string): string {
  try {
    let date: Date

    // ✅ Si la fecha viene en formato "2025-08-16" (solo fecha) - MÁS COMÚN AHORA
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = parse(dateString, "yyyy-MM-dd", new Date())
      console.log('📅 Procesando fecha pura para día de semana:', dateString, '→', format(date, "EEEE", { locale: es }));
    }
    // Si la fecha viene en formato ISO
    else if (dateString.includes("T")) {
      date = parseISO(dateString)
      console.log('📅 Procesando timestamp ISO para día de semana:', dateString, '→', format(date, "EEEE", { locale: es }));
    }
    // Si la fecha viene en formato "2025-08-16 14:01:58.831+00"
    else if (dateString.includes(" ")) {
      const isoString = dateString.replace(" ", "T").replace("+00", "Z")
      date = parseISO(isoString)
      console.log('📅 Procesando formato con espacio para día de semana:', dateString, '→', format(date, "EEEE", { locale: es }));
    } else {
      console.warn('📅 Formato de fecha no reconocido:', dateString);
      return "N/A"
    }

    return format(date, "EEEE", { locale: es })
  } catch (error) {
    console.error("❌ Error al obtener día de la semana:", error, "Fecha original:", dateString)
    return "N/A"
  }
}

/**
 * Verifica si una fecha es hoy (sin considerar zona horaria)
 * @param dateString - String de fecha en formato de base de datos
 * @returns Boolean indicando si la fecha es hoy
 */
export function isToday(dateString: string): boolean {
  try {
    // ✅ Obtener fecha de hoy en Colombia (sin conversiones)
    const today = new Date()
    const todayString = format(today, "yyyy-MM-dd")

    // Extraer solo la parte de fecha si viene con hora
    let dateOnly = dateString
    if (dateString.includes("T")) {
      dateOnly = dateString.split("T")[0]
    } else if (dateString.includes(" ")) {
      dateOnly = dateString.split(" ")[0]
    }

    const isToday = dateOnly === todayString;
    console.log('📅 Verificando si es hoy:', {
      dateString,
      dateOnly,
      todayString,
      isToday
    });

    return isToday;
  } catch (error) {
    console.error("❌ Error al verificar si es hoy:", error)
    return false
  }
}

/**
 * Normaliza fecha de entrada desde diferentes formatos
 * @param dateString - String de fecha en formato de base de datos
 * @returns Objeto Date normalizado
 */
export function normalizeDateFromDB(dateString: string): Date {
  try {
    // ✅ Si la fecha viene en formato "2025-08-16" (solo fecha) - MÁS COMÚN AHORA
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const normalized = parse(dateString, "yyyy-MM-dd", new Date());
      console.log('📅 Normalizando fecha pura:', dateString, '→', normalized);
      return normalized;
    }

    // Si la fecha viene en formato ISO
    if (dateString.includes("T")) {
      const normalized = parseISO(dateString);
      console.log('📅 Normalizando timestamp ISO:', dateString, '→', normalized);
      return normalized;
    }

    // Si la fecha viene en formato "2025-08-16 14:01:58.831+00"
    if (dateString.includes(" ")) {
      const isoString = dateString.replace(" ", "T").replace("+00", "Z")
      const normalized = parseISO(isoString);
      console.log('📅 Normalizando formato con espacio:', dateString, '→', normalized);
      return normalized;
    }

    console.warn('📅 Formato no reconocido, usando Date constructor:', dateString);
    return new Date(dateString)
  } catch (error) {
    console.error("❌ Error al normalizar fecha:", error)
    return new Date()
  }
}

// ✅ Función adicional para debugging - puedes eliminar después
export function debugTimeConsistency(originalTime: string, formattedTime: string): void {
  console.log('🔍 DEBUG - Consistencia de tiempo:', {
    original: originalTime,
    formatted: formattedTime,
    areEqual: originalTime === formattedTime,
    originalType: typeof originalTime,
    formattedType: typeof formattedTime
  });
}

export default {
  formatLongDate,
  calculateEndDate,
  isExpired,
  isAboutToExpire,
  parseDate,
  formatDateFromDB,
  formatTimeFromDB,
  getDayOfWeekFromDB,
  isToday,
  normalizeDateFromDB,
  debugTimeConsistency, // ✅ Agregar función de debug
}

