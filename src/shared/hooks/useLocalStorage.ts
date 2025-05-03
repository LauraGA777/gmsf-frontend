import { useState, useEffect } from "react"

/**
 * Hook personalizado para usar localStorage con React
 * @param key - Clave para almacenar en localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 * @returns [storedValue, setValue] - Valor almacenado y función para actualizarlo
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      // Obtener del localStorage por clave
      const item = window.localStorage.getItem(key)
      // Parsear JSON almacenado o devolver initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Si hay error, devolver initialValue
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Función para actualizar el valor en localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea una función para seguir el mismo patrón que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Guardar en estado
      setStoredValue(valueToStore)

      // Guardar en localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Sincronizar con otros tabs/ventanas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue))
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      return () => {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
    return undefined
  }, [key])

  return [storedValue, setValue]
}

export default useLocalStorage

