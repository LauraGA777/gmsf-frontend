import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-hot-toast";

// UI Components
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

// Icons
import {
    CreditCard,
    Calendar,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Star,
    MapPin,
    Phone,
    Mail,
    Dumbbell,
    Users,
    Zap,
    Car,
    Shirt,
    Timer,
    Award,
    TrendingUp
} from "lucide-react";

// Services and Types
import {
    membershipService,
    MyActiveMembership,
    MembershipBenefits
} from "../services/membership.service";
import { useAuth } from "@/shared/contexts/authContext";

// Loading Component
const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
        <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando tu membresía...</p>
        </div>
    </div>
);

// Empty State Component
const EmptyMembershipState = () => (
    <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12">
            <div className="text-center">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes una membresía activa</h3>
                <p className="text-gray-600 mb-6">
                    Contacta con nuestro equipo para adquirir tu plan perfecto y comenzar tu transformación.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>+57 (123) 456-7890</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>info@gmsf.com</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Cra. 13 #26-62, Bogotá</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

// Error Component
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
            <span>{message}</span>
            <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
            </Button>
        </AlertDescription>
    </Alert>
);

// Status Badge Component
const StatusBadge = ({ estado }: { estado: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Activa':
                return {
                    variant: 'default' as const,
                    icon: CheckCircle,
                    color: 'text-green-700',
                    bg: 'bg-green-100 border-green-200'
                };
            case 'Próxima a vencer':
                return {
                    variant: 'secondary' as const,
                    icon: AlertTriangle,
                    color: 'text-amber-700',
                    bg: 'bg-amber-100 border-amber-200'
                };
            case 'Vencida':
                return {
                    variant: 'destructive' as const,
                    icon: XCircle,
                    color: 'text-red-700',
                    bg: 'bg-red-100 border-red-200'
                };
            default:
                return {
                    variant: 'secondary' as const,
                    icon: Clock,
                    color: 'text-gray-700',
                    bg: 'bg-gray-100 border-gray-200'
                };
        }
    };

    const config = getStatusConfig(estado);
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={`${config.bg} ${config.color} font-medium px-3 py-1`}>
            <Icon className="h-3 w-3 mr-1" />
            {estado}
        </Badge>
    );
};

// Progress Ring Component
const ProgressRing = ({ percentage, size = 120 }: { percentage: number; size?: number }) => {
    const radius = (size - 10) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-blue-600 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
                    <div className="text-sm text-gray-600">Completado</div>
                </div>
            </div>
        </div>
    );
};

export function MyMembershipPage() {
    const { user } = useAuth();

    // Estados
    const [activeMembership, setActiveMembership] = useState<MyActiveMembership | null>(null);
    const [benefits, setBenefits] = useState<MembershipBenefits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos
    const loadMembershipData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [membershipData, benefitsData] = await Promise.allSettled([
                membershipService.getMyActiveMembership(),
                membershipService.getMyMembershipBenefits()
            ]);

            if (membershipData.status === 'fulfilled') {
                setActiveMembership(membershipData.value);
            }

            if (benefitsData.status === 'fulfilled') {
                setBenefits(benefitsData.value);
            }

            // Si ambas fallan, mostrar error
            if (membershipData.status === 'rejected' && benefitsData.status === 'rejected') {
                setError('No se pudo cargar la información de tu membresía');
            }

        } catch (error: any) {
            console.error('Error al cargar datos de membresía:', error);
            setError(error.message || 'Error al cargar la información');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembershipData();
    }, []);

    const handleRefresh = () => {
        loadMembershipData();
        toast.success("Información actualizada");
    };

    // Mostrar loading
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <LoadingState />
            </div>
        );
    }

    // Mostrar error
    if (error && !activeMembership) {
        return (
            <div className="container mx-auto px-4 py-6">
                <ErrorState message={error} onRetry={loadMembershipData} />
            </div>
        );
    }

    // Mostrar estado sin membresía
    if (!activeMembership) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Mi Membresía</h1>
                    <p className="text-gray-600">Tu plan de entrenamiento personalizado</p>
                </div>
                <EmptyMembershipState />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mi Membresía</h1>
                    <p className="text-gray-600">Tu plan de entrenamiento personalizado</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            {/* Estado de membresía principal */}
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        {/* Info principal */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Award className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{activeMembership.membresia.nombre}</h2>
                                    <p className="text-gray-600">{activeMembership.contrato.codigo}</p>
                                </div>
                            </div>
                            
                            <StatusBadge estado={activeMembership.estado.estado_actual} />
                            
                            <div className="mt-4 grid grid-cols-2 gap-4 text-center lg:text-left">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{activeMembership.estado.dias_restantes}</p>
                                    <p className="text-sm text-gray-600">Días restantes</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{activeMembership.membresia.precio_formato}</p>
                                    <p className="text-sm text-gray-600">Valor pagado</p>
                                </div>
                            </div>
                        </div>

                        {/* Progreso circular */}
                        <div className="flex-shrink-0">
                            <ProgressRing percentage={activeMembership.estado.porcentaje_uso} />
                        </div>
                    </div>

                    {/* Fechas importantes */}
                    <div className="mt-6 pt-6 border-t border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Inicio del plan</p>
                                    <p className="font-semibold text-gray-900">
                                        {format(new Date(activeMembership.contrato.fecha_inicio), "dd 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Timer className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Vence el</p>
                                    <p className="font-semibold text-gray-900">
                                        {format(new Date(activeMembership.contrato.fecha_fin), "dd 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerta si está próximo a vencer */}
                    {activeMembership.estado.dias_restantes <= 7 && activeMembership.estado.dias_restantes > 0 && (
                        <Alert className="mt-4 border-amber-200 bg-amber-50">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                Tu membresía vence en {activeMembership.estado.dias_restantes} días. 
                                Contacta con nosotros para renovar y no interrumpir tu rutina de entrenamiento.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Alerta si está vencida */}
                    {activeMembership.estado.dias_restantes <= 0 && (
                        <Alert variant="destructive" className="mt-4">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                Tu membresía ha vencido. Contacta con nuestro equipo para renovar tu acceso al gimnasio.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Servicios incluidos y horarios */}
            {benefits && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Servicios incluidos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Lo que incluye tu plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-3">
                                {/* Servicios predefinidos con iconos */}
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <Dumbbell className="h-5 w-5 text-green-600" />
                                    <span className="text-gray-800">Acceso al área de pesas</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-800">Zona cardiovascular completa</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                    <Shirt className="h-5 w-5 text-purple-600" />
                                    <span className="text-gray-800">Vestidores y duchas</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Car className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-800">Estacionamiento gratuito</span>
                                </div>
                                
                                {/* Servicios adicionales desde el backend */}
                                {benefits.servicios_incluidos?.filter(s => 
                                    !s.toLowerCase().includes('pesas') && 
                                    !s.toLowerCase().includes('cardiovascular') && 
                                    !s.toLowerCase().includes('vestidor') && 
                                    !s.toLowerCase().includes('estacionamiento')
                                ).map((servicio, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-orange-600" />
                                        <span className="text-gray-800">{servicio}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Horarios de atención */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                Horarios de atención
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Lunes a Viernes</span>
                                    <span className="text-gray-900 font-semibold">
                                        {benefits.horarios?.lunes_viernes || '5:00 AM - 10:00 PM'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Sábados</span>
                                    <span className="text-gray-900 font-semibold">
                                        {benefits.horarios?.sabados || '6:00 AM - 8:00 PM'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Domingos</span>
                                    <span className="text-gray-900 font-semibold">
                                        {benefits.horarios?.domingos || '7:00 AM - 6:00 PM'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">Festivos</span>
                                    <span className="text-gray-900 font-semibold">
                                        {benefits.horarios?.festivos || '8:00 AM - 4:00 PM'}
                                    </span>
                                </div>
                            </div>

                            {/* Estado de acceso */}
                            <div className="mt-6 pt-4 border-t">
                                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                                    activeMembership.estado.acceso_disponible 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'bg-red-50 border border-red-200'
                                }`}>
                                    {activeMembership.estado.acceso_disponible ? (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    )}
                                    <div>
                                        <p className={`font-semibold ${
                                            activeMembership.estado.acceso_disponible ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {activeMembership.estado.acceso_disponible ? '✓ Acceso Habilitado' : '✗ Acceso Bloqueado'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {activeMembership.estado.acceso_disponible 
                                                ? 'Puedes ingresar al gimnasio'
                                                : 'Contacta con recepción para más información'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Información de contacto */}
            <Card className="bg-gray-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-600" />
                        ¿Necesitas ayuda?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900">Teléfono</p>
                                <p className="text-gray-600">+57 (123) 456-7890</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-medium text-gray-900">Email</p>
                                <p className="text-gray-600">info@gmsf.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="font-medium text-gray-900">Ubicación</p>
                                <p className="text-gray-600">Cra. 13 #26-62, Medellín</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}