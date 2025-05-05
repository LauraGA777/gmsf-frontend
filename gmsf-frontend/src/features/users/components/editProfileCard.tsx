import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Calendar } from "@/shared/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { cn } from "@/shared/lib/formatCop"
import { Progress } from "@/shared/components/ui/progress"

const profileSchema = z
    .object({
        fullName: z.string().min(2, { message: "El nombre es obligatorio" }),
        email: z.string().email({ message: "Email inválido" }),
        phone: z.string().optional(),
        birthDate: z.date().optional(),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
        confirmPassword: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.newPassword && !data.currentPassword) {
                return false
            }
            return true
        },
        {
            message: "La contraseña actual es requerida para cambiar la contraseña",
            path: ["currentPassword"],
        },
    )
    .refine(
        (data) => {
            if (data.newPassword && data.newPassword !== data.confirmPassword) {
                return false
            }
            return true
        },
        {
            message: "Las contraseñas no coinciden",
            path: ["confirmPassword"],
        },
    )

type ProfileFormValues = z.infer<typeof profileSchema>

const defaultValues: Partial<ProfileFormValues> = {
    fullName: "Laura García",
    email: "laura@example.com",
    phone: "+57 300 123 4567",
    birthDate: new Date("2002-09-25"),
}

export default function ProfileEditor() {
    const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=100&width=100")
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [formSubmitted, setFormSubmitted] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues,
        mode: "onChange",
    })

    const { formState } = form
    const isDirty = formState.isDirty

    // Calcular la fortaleza de la contraseña
    useEffect(() => {
        const password = form.watch("newPassword") || ""
        let strength = 0

        if (password.length > 0) {
            // Incrementar por longitud
            if (password.length > 5) strength += 20
            if (password.length > 8) strength += 20

            // Incrementar por complejidad
            if (/[A-Z]/.test(password)) strength += 20
            if (/[0-9]/.test(password)) strength += 20
            if (/[^A-Za-z0-9]/.test(password)) strength += 20
        }

        setPasswordStrength(strength)
    }, [form.watch("newPassword")])

    // Manejar el envío del formulario
    function onSubmit(data: ProfileFormValues) {
        console.log(data)
        setFormSubmitted(true)
        setTimeout(() => setFormSubmitted(false), 3000)
    }

    // Manejar el cambio de avatar
    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                if (e.target?.result) {
                    setAvatarUrl(e.target.result as string)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <>
            {/* Cabecera */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                        <img src={avatarUrl || "/placeholder.svg"} alt="Foto de perfil" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-md">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </div>
                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Editar Perfil</h1>
            </div>

            {formSubmitted && (
                <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded-md flex items-center">
                    <Check className="mr-2 h-5 w-5" />
                    <span>Cambios guardados correctamente</span>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sección Izquierda (Datos Básicos) */}
                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-lg font-medium mb-4">Datos Básicos</h2>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre completo *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Correo electrónico *</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teléfono</FormLabel>
                                                <FormControl>
                                                    <Input type="tel" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="birthDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Fecha de nacimiento</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground",
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP", { locale: es })
                                                                ) : (
                                                                    <span>Seleccionar fecha</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sección Derecha (Seguridad y Personalización) */}
                        <div className="space-y-8">
                            {/* Subsección "Cambiar contraseña" */}
                            <Card>
                                <CardContent className="pt-6">
                                    <h2 className="text-lg font-medium mb-4">Cambiar contraseña</h2>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contraseña actual</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nueva contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    {field.value && (
                                                        <div className="mt-2">
                                                            <Progress value={passwordStrength} className="h-2" />
                                                            <div className="flex justify-between text-xs mt-1">
                                                                <span>Débil</span>
                                                                <span>Media</span>
                                                                <span>Fuerte</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sección Inferior (Acciones) */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => (isDirty ? setShowCancelDialog(true) : window.location.reload())}
                            >
                                Cancelar
                            </Button>
                            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="link" className="text-destructive">
                                        Eliminar cuenta
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>¿Estás seguro?</DialogTitle>
                                        <DialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos los datos
                                            asociados.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                            Cancelar
                                        </Button>
                                        <Button variant="destructive">Eliminar cuenta</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Button type="submit">Guardar cambios</Button>
                    </div>
                </form>
            </Form>

            {/* Diálogo de confirmación para cancelar */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Descartar cambios?</DialogTitle>
                        <DialogDescription>
                            Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Continuar editando
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowCancelDialog(false)
                                form.reset(defaultValues)
                            }}>
                            Descartar cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}