import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays } from "date-fns"

/**
 * Combina clases de Tailwind de manera eficiente
 * @param inputs - Clases a combinar
 * @returns Clases combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio en formato COP
 * @param price - Precio a formatear
 * @returns Precio formateado en COP
 */
export function formatCOP(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Calcula los días restantes hasta una fecha
 * @param date - Fecha objetivo
 * @returns Número de días restantes
 */
export function daysRemaining(date: Date | string | null): number {
  if (!date) return 0

  const targetDate = typeof date === "string" ? new Date(date) : date
  const today = new Date()

  // Normalizar las fechas para comparar solo días
  today.setHours(0, 0, 0, 0)
  const normalizedTarget = new Date(targetDate)
  normalizedTarget.setHours(0, 0, 0, 0)

  return differenceInDays(normalizedTarget, today)
}

/**
 * Formatea una fecha en formato corto (dd/MM/yyyy)
 * @param date - Fecha a formatear
 * @returns Fecha formateada
 */
export function formatShortDate(date: Date | string | null): string {
  if (!date) return "N/A"
  return format(new Date(date), "dd/MM/yyyy")
}

/**
 * Formatea una hora en formato HH:mm
 * @param date - Fecha con hora a formatear
 * @returns Hora formateada
 */
export function formatTime(date: Date | string | null): string {
  if (!date) return "N/A"
  return format(new Date(date), "HH:mm")
}

