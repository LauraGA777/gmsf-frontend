import { useState, useEffect } from "react"

/**
 * Hook personalizado para detectar si una media query coincide
 * @param query - Media query a evaluar
 * @returns Boolean indicando si la media query coincide
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Verificar si window está disponible (para SSR)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query)

      // Establecer el valor inicial
      setMatches(media.matches)

      // Definir el callback para actualizar el estado
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }

      // Añadir el listener
      media.addEventListener("change", listener)

      // Limpiar el listener al desmontar
      return () => {
        media.removeEventListener("change", listener)
      }
    }

    // Valor por defecto para SSR
    return undefined
  }, [query])

  return matches
}

/**
 * Hook para detectar si la pantalla es móvil
 * @param breakpoint - Punto de quiebre en píxeles (por defecto 768px)
 * @returns Boolean indicando si es pantalla móvil
 */
export function useMobile(breakpoint = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint}px)`)
}

export default useMediaQuery

