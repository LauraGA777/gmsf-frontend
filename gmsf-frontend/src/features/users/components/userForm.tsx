import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from 'lucide-react';
import type { User } from "../types/user";
import { cn } from "@/shared/lib/formatCop";
import Swal from 'sweetalert2';

const tiposDocumento = [
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "TI", label: "Tarjeta de Identidad" },
    { value: "TE", label: "Tarjeta de Extranjería" },
    { value: "PP", label: "Pasaporte" },
    { value: "NIT", label: "NIT" },
    { value: "PEP", label: "Permiso Especial de Permanencia" },
    { value: "DIE", label: "Documento de Identidad Extranjero" },
];

interface UserFormProps {
    user: User | null;
    onSave: (user: User) => void;
    onCancel: () => void;
    existingUsers: User[];
}

export function UserForm({ user, onSave, onCancel, existingUsers }: UserFormProps) {
    const formSchema = z
        .object({
            tipoDocumento: z.string().min(1, { message: "El tipo de documento es obligatorio" }),
            numeroDocumento: z
                .string()
                .min(1, { message: "El número de documento es obligatorio" })
                .refine(
                    (value) => {
                        return !existingUsers.some((u) => u.numeroDocumento === value && u.id !== user?.id);
                    },
                    { message: "Este número de documento ya está registrado" },
                ),
            nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
            apellido: z.string().min(3, { message: "El apellido debe tener al menos 3 caracteres" }),
            correo: z
                .string()
                .email({ message: "Ingrese un correo válido" })
                .refine(
                    (value) => {
                        return !existingUsers.some((u) => u.correo === value && u.id !== user?.id);
                    },
                    { message: "Este correo ya está registrado" },
                ),
            contrasena: user
                ? z.string().optional()
                : z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
            confirmPassword: z.string().optional(),
            telefono: z
                .string()
                .optional()
                .refine((value) => !value || (value.length >= 7 && value.length <= 15), {
                    message: "El teléfono debe tener entre 7 y 15 dígitos",
                }),
            estado: z.boolean(),  // Cambiado para que siempre sea boolean
        })
        .refine(
            (data) => {
                if (data.contrasena && data.confirmPassword) {
                    return data.contrasena === data.confirmPassword;
                }
                return true;
            },
            {
                message: "Las contraseñas no coinciden",
                path: ["confirmPassword"],
            },
        );

    type FormValues = z.infer<typeof formSchema>;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipoDocumento: user?.tipoDocumento || "",
            numeroDocumento: user?.numeroDocumento || "",
            nombre: user?.nombre || "",
            apellido: user?.apellido || "",
            correo: user?.correo || "",
            contrasena: "",
            confirmPassword: "",
            telefono: user?.telefono || "",
            estado: user?.estado ?? true, // Cambiado para usar el operador de coalescencia nula
        },
    });

    const onSubmit = async (data: FormValues) => {
        const savedUser: User = {
            id: user?.id || "",
            ...data,
            // Mantener los valores existentes para los campos eliminados si estamos editando
            genero: user?.genero || "No especificado",
            direccion: user?.direccion,
            fechaNacimiento: user?.fechaNacimiento,
            fechaRegistro: user?.fechaRegistro || new Date().toISOString(),
        };

        // Guardar el usuario
        onSave(savedUser);

        // Mostrar mensaje de éxito
        Swal.fire({
            title: user ? 'Usuario Actualizado' : 'Usuario Creado',
            text: user
                ? `El usuario ${data.nombre} ${data.apellido} ha sido actualizado correctamente.`
                : `El usuario ${data.nombre} ${data.apellido} ha sido creado correctamente.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tipo de Documento */}
                        <div className="space-y-2">
                            <Label htmlFor="tipoDocumento">
                                Tipo de Documento <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="tipoDocumento"
                                className={cn(
                                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                    errors.tipoDocumento && "border-red-500",
                                )}
                                {...register("tipoDocumento")}
                            >
                                <option value="">Seleccione...</option>
                                {tiposDocumento.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                            {errors.tipoDocumento && <p className="text-red-500 text-xs mt-1">{errors.tipoDocumento.message}</p>}
                        </div>

                        {/* Número de Documento */}
                        <div className="space-y-2">
                            <Label htmlFor="numeroDocumento">
                                Número de Documento <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="numeroDocumento"
                                {...register("numeroDocumento")}
                                className={errors.numeroDocumento ? "border-red-500" : ""}
                            />
                            {errors.numeroDocumento && <p className="text-red-500 text-xs mt-1">{errors.numeroDocumento.message}</p>}
                        </div>

                        {/* Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre">
                                Nombre <span className="text-red-500">*</span>
                            </Label>
                            <Input id="nombre" {...register("nombre")} className={errors.nombre ? "border-red-500" : ""} />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                        </div>

                        {/* Apellido */}
                        <div className="space-y-2">
                            <Label htmlFor="apellido">
                                Apellido <span className="text-red-500">*</span>
                            </Label>
                            <Input id="apellido" {...register("apellido")} className={errors.apellido ? "border-red-500" : ""} />
                            {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
                        </div>

                        {/* Correo */}
                        <div className="space-y-2">
                            <Label htmlFor="correo">
                                Correo <span className="text-red-500">*</span>
                            </Label>
                            <Input id="correo" type="email" {...register("correo")} className={errors.correo ? "border-red-500" : ""} />
                            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="contrasena">Contraseña {!user && <span className="text-red-500">*</span>}</Label>
                            <Input
                                id="contrasena"
                                type="password"
                                {...register("contrasena")}
                                className={errors.contrasena ? "border-red-500" : ""}
                                placeholder={user ? "Dejar en blanco para mantener" : ""}
                            />
                            {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena.message}</p>}
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input id="telefono" {...register("telefono")} className={errors.telefono ? "border-red-500" : ""} />
                            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="contrasena">Contraseña {!user && <span className="text-red-500">*</span>}</Label>
                            <Input
                                id="contrasena"
                                type="password"
                                {...register("contrasena")}
                                className={errors.contrasena ? "border-red-500" : ""}
                                placeholder={user ? "Dejar en blanco para mantener" : ""}
                            />
                            {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena.message}</p>}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirmar Contraseña {!user && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                                placeholder={user ? "Dejar en blanco para mantener" : ""}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Fecha de Registro (solo lectura) */}
                        {user && (
                            <div className="space-y-2">
                                <Label htmlFor="fechaRegistro">Fecha de Registro</Label>
                                <Input
                                    id="fechaRegistro"
                                    value={user.fechaRegistro ? format(new Date(user.fechaRegistro), "PP", { locale: es }) : ""}
                                    disabled
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white py-2 h-9 text-sm px-4 bg-black hover:bg-gray-800"
                    >
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}