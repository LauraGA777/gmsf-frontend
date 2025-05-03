import type React from "react"
import { useState } from "react"
import { useAuth } from "@/shared/contexts/AuthContext"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Label } from "@/shared/components/label"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)
      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <p className="text-center">Para probar, usa uno de estos correos:</p>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li>admin@example.com (Administrador)</li>
          <li>carlos@example.com (Entrenador)</li>
          <li>juan@example.com (Cliente)</li>
        </ul>
        <p className="mt-2 text-center">La contraseña es: "password"</p>
      </div>
    </div>
  )
}

