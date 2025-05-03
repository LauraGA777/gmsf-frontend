import { useState, useEffect } from "react"

/**
 * Hook personalizado para debounce de valores
 * @param value - Valor a debounce
 * @param delay - Tiempo de espera en ms (por defecto 500ms)
 * @returns Valor después del debounce
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Establecer un timeout para actualizar el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce

