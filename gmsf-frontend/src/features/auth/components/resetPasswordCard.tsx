import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { useToast } from "@/shared/hooks/useToast"
import { formSchemaReset, FormValuesReset } from "@/shared/lib/formSchemasLogin"
import { authService } from "../services/authService"

export default function ResetPasswordCard() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { toast } = useToast()
    const navigate = useNavigate()

    const form = useForm<FormValuesReset>({
        resolver: zodResolver(formSchemaReset),
        defaultValues: {
            contrasena: "",
            nuevaContrasena: "",
        },
        mode: "onChange",
    })

    async function onSubmit(data: FormValuesReset) {
        setIsLoading(true)

        try {
            const response = await authService.restablecerContrasena(
                window.location.search.split("token=")[1] || "",
                data.contrasena
            );

            if (response.mensaje === "Contraseña actualizada") {
                toast({
                    title: "Éxito",
                    description: "Contraseña actualizada correctamente",
                });
                navigate("/", { replace: true });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al restablecer contraseña",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-start mb-4">
                        <Link to="/" className="flex items-center text-sm text-primary hover:underline">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver al login
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold">Crea una nueva contraseña</CardTitle>
                    <CardDescription>Ingresa y confirma tu nueva contraseña</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <FormField
                                    control={form.control}
                                    name="contrasena"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Nueva contraseña"
                                                        {...field}
                                                        className="transition-all focus-visible:ring-primary hover:border-primary/50 pr-10"
                                                        disabled={isLoading}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                                    <li className={form.watch("contrasena").length >= 8 ? "text-green-500" : ""}>✓ Mínimo 8 caracteres</li>
                                    <li className={/\d/.test(form.watch("contrasena")) ? "text-green-500" : ""}>
                                        ✓ Incluir al menos un número
                                    </li>
                                </ul>
                            </div>

                            <FormField
                                control={form.control}
                                name="nuevaContrasena"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirmar contraseña"
                                                    {...field}
                                                    className="transition-all focus-visible:ring-primary hover:border-primary/50 pr-10"
                                                    disabled={isLoading}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    <span className="sr-only">
                                                        {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                    </span>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    "Restablecer contraseña"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}
