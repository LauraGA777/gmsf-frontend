import { useState, useEffect } from 'react';
import { authService, DatosPerfil, DatosCambioContrasena } from '../services/authService';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { BirthDateInput } from '@/shared/components/ui/birth-date-input';

// Componentes de UI
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("bg-white rounded-lg", className)}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="p-6 border-b">{children}</div>
);

const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-gray-500 mt-1">{children}</p>
);

const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("p-6", className)}>{children}</div>
);

const Label = ({ htmlFor, className, children }: { htmlFor: string; className?: string; children: React.ReactNode }) => (
    <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-gray-700", className)}>
        {children}
    </label>
);

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none",
            className
        )}
        {...props}
    />
);

const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        className={cn(
            "w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200",
            className
        )}
        {...props}
    >
        {children}
    </button>
);

const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => (
    <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
        {children}
    </select>
);

const SelectTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const SelectValue = ({ placeholder }: { placeholder: string }) => <div>{placeholder}</div>;
const SelectContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
);

export default function ProfileManagement() {
    const [isLoading, setIsLoading] = useState(true);
    const [profileData, setProfileData] = useState<DatosPerfil>({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        genero: '',
        tipo_documento: '',
        numero_documento: '',
        fecha_nacimiento: ''
    });

    const [passwordData, setPasswordData] = useState<DatosCambioContrasena>({
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [profileSaved, setProfileSaved] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        actual: false,
        nueva: false,
        confirmar: false
    });

    const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof DatosPerfil, string>>>({});
    const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof DatosCambioContrasena, string>>>({});

    const [passwordStrength, setPasswordStrength] = useState({
        strength: 'Débil',
        color: 'text-red-600'
    });

    useEffect(() => {
        cargarPerfil();
    }, []);

    const handleAuthError = (error: any) => {
        if (error.message === 'No hay token de autenticación') {
            // Redirigir al login si no hay token
            window.location.href = '/login';
            return;
        }
        setError(error.message || 'Error de autenticación');
    };

    const cargarPerfil = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const datosPerfil = await authService.obtenerPerfil();
            if (datosPerfil) {
                // Formatear la fecha si existe
                const fechaNacimiento = datosPerfil.fecha_nacimiento
                    ? new Date(datosPerfil.fecha_nacimiento).toISOString().split('T')[0]
                    : '';

                setProfileData({
                    nombre: datosPerfil.nombre || '',
                    apellido: datosPerfil.apellido || '',
                    correo: datosPerfil.correo || '',
                    telefono: datosPerfil.telefono || '',
                    direccion: datosPerfil.direccion || '',
                    genero: datosPerfil.genero || '',
                    tipo_documento: datosPerfil.tipo_documento || '',
                    numero_documento: datosPerfil.numero_documento || '',
                    fecha_nacimiento: fechaNacimiento
                });
            }
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileChange = (field: keyof DatosPerfil, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
        setProfileErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handlePasswordChange = (field: keyof DatosCambioContrasena, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        setPasswordErrors(prev => ({ ...prev, [field]: '' }));

        if (field === 'nuevaContrasena') {
            const strength = calcularFortalezaContrasena(value);
            setPasswordStrength(strength);
        }
    };

    const calcularFortalezaContrasena = (password: string) => {
        if (password.length < 8) {
            return { strength: 'Débil', color: 'text-red-600' };
        }
        if (password.length < 12) {
            return { strength: 'Media', color: 'text-yellow-600' };
        }
        return { strength: 'Fuerte', color: 'text-green-600' };
    };

    const validarPerfil = () => {
        const errors: Partial<Record<keyof DatosPerfil, string>> = {};
        if (!profileData.nombre) errors.nombre = 'El nombre es requerido';
        if (!profileData.apellido) errors.apellido = 'El apellido es requerido';
        if (!profileData.correo) errors.correo = 'El correo es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.correo)) {
            errors.correo = 'Correo electrónico inválido';
        }
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validarContrasena = () => {
        const errors: Partial<Record<keyof DatosCambioContrasena, string>> = {};
        if (!passwordData.contrasenaActual) errors.contrasenaActual = 'La contraseña actual es requerida';
        if (!passwordData.nuevaContrasena) errors.nuevaContrasena = 'La nueva contraseña es requerida';
        else if (passwordData.nuevaContrasena.length < 8) {
            errors.nuevaContrasena = 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!passwordData.confirmarContrasena) errors.confirmarContrasena = 'Debes confirmar la contraseña';
        else if (passwordData.nuevaContrasena !== passwordData.confirmarContrasena) {
            errors.confirmarContrasena = 'Las contraseñas no coinciden';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileSave = async () => {
        if (!validarPerfil()) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await authService.actualizarPerfil(profileData);
            setSuccess('Perfil actualizado correctamente');
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!validarContrasena()) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await authService.cambiarContrasena(passwordData);
            setSuccess('Contraseña actualizada correctamente');
            setPasswordSaved(true);
            setPasswordData({
                contrasenaActual: '',
                nuevaContrasena: '',
                confirmarContrasena: ''
            });
            setTimeout(() => setPasswordSaved(false), 3000);
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
                    <p className="text-gray-600">Gestiona tu información personal y configuración de seguridad</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Sección de Información Personal - 60% */}
                    <div className="lg:col-span-3">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-gray-900">Información Personal</CardTitle>
                                <CardDescription>Actualiza tu información personal y datos de contacto</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                                            Nombre *
                                        </Label>
                                        <Input
                                            id=""
                                            value={profileData.nombre}
                                            onChange={(e) => handleProfileChange("nombre", e.target.value)}
                                            placeholder="Ingresa tu nombre"
                                            className={cn(
                                                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                profileErrors.nombre && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                            )}
                                        />
                                        {profileErrors.nombre && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {profileErrors.nombre}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apellido" className="text-sm font-medium text-gray-700">
                                            Apellido *
                                        </Label>
                                        <Input
                                            id="apellido"
                                            value={profileData.apellido}
                                            onChange={(e) => handleProfileChange("apellido", e.target.value)}
                                            placeholder="Ingresa tu apellido"
                                            className={cn(
                                                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                profileErrors.apellido && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                            )}
                                        />
                                        {profileErrors.apellido && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {profileErrors.apellido}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="correo" className="text-sm font-medium text-gray-700">
                                        Correo Electrónico *
                                    </Label>
                                    <Input
                                        id="correo"
                                        type="email"
                                        value={profileData.correo}
                                        onChange={(e) => handleProfileChange("correo", e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        className={cn(
                                            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            profileErrors.correo && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                        )}
                                    />
                                    {profileErrors.correo && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {profileErrors.correo}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                                            Teléfono
                                        </Label>
                                        <Input
                                            id="telefono"
                                            type="tel"
                                            value={profileData.telefono}
                                            onChange={(e) => handleProfileChange("telefono", e.target.value)}
                                            placeholder="Opcional"
                                            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="genero" className="text-sm font-medium text-gray-700">
                                            Género
                                        </Label>
                                        <Select value={profileData.genero || ''} onValueChange={(value) => handleProfileChange("genero", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar género" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Masculino</SelectItem>
                                                <SelectItem value="F">Femenino</SelectItem>
                                                <SelectItem value="O">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                                        Dirección
                                    </Label>
                                    <Input
                                        id="direccion"
                                        value={profileData.direccion}
                                        onChange={(e) => handleProfileChange("direccion", e.target.value)}
                                        placeholder="Ej: Av. Principal 123"
                                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tipoDocumento" className="text-sm font-medium text-gray-700">
                                            Tipo de Documento
                                        </Label>
                                        <Select
                                            value={profileData.tipo_documento || ''}
                                            onValueChange={(value) => handleProfileChange("tipo_documento", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                                                <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                                                <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
                                                <SelectItem value="pp">Pasaporte</SelectItem>
                                                <SelectItem value="otro">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="numeroDocumento" className="text-sm font-medium text-gray-700">
                                            Número de Documento
                                        </Label>
                                        <Input
                                            id="numeroDocumento"
                                            value={profileData.numero_documento}
                                            onChange={(e) => handleProfileChange("numero_documento", e.target.value)}
                                            placeholder="Opcional"
                                            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <BirthDateInput
                                        value={profileData.fecha_nacimiento || ""}
                                        onChange={(value) => handleProfileChange("fecha_nacimiento", value)}
                                        role="cliente"
                                        minAge={13}
                                        required={false}
                                        showRealTimeValidation={true}
                                        id="fechaNacimiento"
                                        label="Fecha de Nacimiento"
                                    />
                                </div>

                                <Button
                                    onClick={handleProfileSave}
                                    disabled={loading}
                                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                >
                                    {profileSaved ? (
                                        <span className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Cambios Guardados
                                        </span>
                                    ) : (
                                        "Guardar Cambios"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sección de Cambio de Contraseña - 40% */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-gray-900">Seguridad de la Cuenta</CardTitle>
                                <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="contrasenaActual" className="text-sm font-medium text-gray-700">
                                        Contraseña Actual *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="contrasenaActual"
                                            type={showPasswords.actual ? "text" : "password"}
                                            value={passwordData.contrasenaActual}
                                            onChange={(e) => handlePasswordChange("contrasenaActual", e.target.value)}
                                            placeholder="Ingresa tu contraseña actual"
                                            className={cn(
                                                "pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                passwordErrors.contrasenaActual && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords((prev) => ({ ...prev, actual: !prev.actual }))}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.actual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.contrasenaActual && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {passwordErrors.contrasenaActual}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nuevaContrasena" className="text-sm font-medium text-gray-700">
                                        Nueva Contraseña *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="nuevaContrasena"
                                            type={showPasswords.nueva ? "text" : "password"}
                                            value={passwordData.nuevaContrasena}
                                            onChange={(e) => handlePasswordChange("nuevaContrasena", e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            className={cn(
                                                "pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                passwordErrors.nuevaContrasena && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords((prev) => ({ ...prev, nueva: !prev.nueva }))}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.nueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordData.nuevaContrasena && (
                                        <p className={cn("text-sm", passwordStrength.color)}>
                                            Fortaleza: {passwordStrength.strength}
                                        </p>
                                    )}
                                    {passwordErrors.nuevaContrasena && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {passwordErrors.nuevaContrasena}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmarContrasena" className="text-sm font-medium text-gray-700">
                                        Confirmar Nueva Contraseña *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmarContrasena"
                                            type={showPasswords.confirmar ? "text" : "password"}
                                            value={passwordData.confirmarContrasena}
                                            onChange={(e) => handlePasswordChange("confirmarContrasena", e.target.value)}
                                            placeholder="Repite la nueva contraseña"
                                            className={cn(
                                                "pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                passwordErrors.confirmarContrasena && "border-red-500 focus:ring-red-500 focus:border-red-500"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords((prev) => ({ ...prev, confirmar: !prev.confirmar }))}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmarContrasena && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {passwordErrors.confirmarContrasena}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-800 mb-2">Requisitos de contraseña:</h4>
                                    <ul className="text-sm text-gray-800 space-y-1">
                                        <li>• Mínimo 8 caracteres</li>
                                        <li>• Se recomienda incluir mayúsculas, minúsculas y números</li>
                                        <li>• Evita usar información personal</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handlePasswordSave}
                                    disabled={loading}
                                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                >
                                    {passwordSaved ? (
                                        <span className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Contraseña Actualizada
                                        </span>
                                    ) : (
                                        "Actualizar Contraseña"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}