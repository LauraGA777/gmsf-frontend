import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: string
  storageKey?: string
}

interface ThemeProviderState {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>(() => {
    // Limpiar tema guardado y forzar tema claro
    localStorage.removeItem(storageKey)
    return "light"
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Limpiar todas las clases de tema
    root.classList.remove("light", "dark", "system")
    
    // Forzar tema claro
    root.classList.add("light")
    
    // Asegurar que los colores del sistema no afecten
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", () => {})
    }
  }, [])

  const value = {
    theme,
    setTheme: (theme: string) => {
      // Asegurarse de que siempre se mantenga en light
      const finalTheme = "light"
      localStorage.setItem(storageKey, finalTheme)
      setTheme(finalTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

