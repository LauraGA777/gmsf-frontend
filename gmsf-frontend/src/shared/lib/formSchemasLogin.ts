import { z } from "zod";

export const formSchemaLogin = z.object({
    correo: z.string().email("Correo electrónico inválido"),
    contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export type FormValuesLogin = z.infer<typeof formSchemaLogin>;

export const formSchemaForgot = z.object({
    email: z.string().email("Correo electrónico inválido"),
})

export type FormValuesForgot = z.infer<typeof formSchemaForgot>

const contrasenaSchema = z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/\d/, "La contraseña debe incluir al menos un número")

export const formSchemaReset = z
    .object({
        contrasena: contrasenaSchema,
        nuevaContrasena: z.string(),
    })
    .refine((data) => data.contrasena === data.nuevaContrasena, {
        message: "Las contraseñas no coinciden",
        path: ["nuevaContrasena"],
    })

export type FormValuesReset = z.infer<typeof formSchemaReset>