import { Button } from "@/shared/components/button"
import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Página no encontrada</p>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <Link to="/dashboard">
        <Button>Volver al Dashboard</Button>
      </Link>
    </div>
  )
}

