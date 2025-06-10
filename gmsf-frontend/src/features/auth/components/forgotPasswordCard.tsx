import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { useToast } from "@/shared/components/ui/use-toast"
import { formSchemaForgot, FormValuesForgot } from "@/shared/lib/formSchemasLogin"
import { authService } from "../services/authService"

export default function ForgotPasswordCard() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const { toast } = useToast()

    const form = useForm<FormValuesForgot>({
        resolver: zodResolver(formSchemaForgot),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(data: FormValuesForgot) {
        setIsLoading(true)

        try {
            await authService.recuperarContrasena(data.email);
            setIsSuccess(true);
            toast({
                title: "Correo enviado",
                description: "Revisa tu bandeja de entrada",
                variant: "default"
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Ha ocurrido un error inesperado",
                variant: "destructive"
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
                    <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
                    <CardDescription>
                        {isSuccess
                            ? "Te hemos enviado las instrucciones para recuperar tu contraseña"
                            : "Ingresa tu correo para recibir instrucciones"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Revisa tu bandeja de entrada y sigue las instrucciones enviadas a tu correo.
                            </p>
                            <Button asChild className="w-full">
                                <Link to="/">Volver al inicio</Link>
                            </Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingresa tu correo registrado"
                                                    {...field}
                                                    className="transition-all focus-visible:ring-primary hover:border-primary/50"
                                                    disabled={isLoading}
                                                />
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
                                        "Enviar instrucciones"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </>
    )
}