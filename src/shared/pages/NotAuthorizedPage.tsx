import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Shield, ArrowLeft, Home } from "lucide-react"

export function NotAuthorizedPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900">Acceso Denegado</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            No tienes permisos para acceder a esta página.
                        </p>
                        <p className="text-sm text-gray-500">
                            Si crees que esto es un error, contacta con tu administrador.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </Button>
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Ir al Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
