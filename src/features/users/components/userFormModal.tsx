import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import type { User } from "../types/user";
import { userService } from "../services/userService";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { roleService } from '@/features/roles/services/roleService';
import { Info } from "lucide-react";

const userFormSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
  correo: z.string().email("Formato de correo inválido"),
  confirmarCorreo: z.string().email("Formato de correo inválido"),
  tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
  numero_documento: z.string().min(5, "El documento debe tener entre 5 y 20 caracteres").max(20),
  fecha_nacimiento: z.string().refine(d => new Date(d).toString() !== 'Invalid Date', "Fecha inválida"),
  id_rol: z.number({ required_error: "Debe seleccionar un rol"}).min(1, "Debe seleccionar un rol"),
  // ✅ Se eliminan campos de contraseña
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  genero: z.enum(['M', 'F', 'O']).optional(),
}).refine(data => data.correo === data.confirmarCorreo, {
    message: "Los correos no coinciden",
    path: ["confirmarCorreo"],
});
// ✅ Se elimina la validación de contraseñas

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormValues) => void;
  user?: User | null;
}

export function UserFormModal({ isOpen, onClose, onSave, user }: UserFormModalProps) {
  const { register, handleSubmit, control, watch, reset, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
        nombre: '',
        apellido: '',
        correo: '',
        confirmarCorreo: '',
        numero_documento: '',
        fecha_nacimiento: '',
        telefono: '',
        direccion: '',
    }
  });

  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  const [documentValidation, setDocumentValidation] = useState({ isChecking: false, exists: false, message: "" });
  const [emailValidation, setEmailValidation] = useState({ isChecking: false, exists: false, message: "" });

  const watchedDocument = watch("numero_documento");
  const watchedEmail = watch("correo");
  const debouncedDocument = useDebounce(watchedDocument, 500);
  const debouncedEmail = useDebounce(watchedEmail, 500);

  useEffect(() => {
    if (isOpen) {
        if (user) {
          reset({
            ...user,
            id_rol: user.id_rol || undefined,
            confirmarCorreo: user.correo,
            fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toISOString().split('T')[0] : "",
            genero: user.genero as 'M' | 'F' | 'O' | undefined,
            tipo_documento: user.tipo_documento as 'CC' | 'CE' | 'TI' | 'PP' | 'DIE' | undefined,
          });
        } else {
          reset({
            nombre: "",
            apellido: "",
            correo: "",
            confirmarCorreo: "",
            numero_documento: "",
            fecha_nacimiento: "",
            id_rol: undefined,
            // ✅ Se eliminan campos de contraseña
            telefono: "",
            direccion: "",
            genero: undefined,
            tipo_documento: 'CC'
          });
        }
    }
  }, [user, isOpen, reset]);
  
  useEffect(() => {
    const loadRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const rolesData = await roleService.getRolesForSelect();
        setRoles(rolesData);
      } catch (error) {
        
      } finally {
        setIsLoadingRoles(false);
      }
    };

    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  // Document validation
  useEffect(() => {
    const checkDocument = async () => {
      if (!debouncedDocument || debouncedDocument.length < 5) {
        setDocumentValidation({ isChecking: false, exists: false, message: "" });
        clearErrors("numero_documento");
        return;
      }
      setDocumentValidation({ isChecking: true, exists: false, message: "" });
      try {
        const exists = await userService.checkDocumentExists(debouncedDocument, user?.id);
        if (exists) {
          setError("numero_documento", { type: "manual", message: "Este documento ya está registrado." });
          setDocumentValidation({ isChecking: false, exists: true, message: "Documento ya registrado" });
        } else {
          clearErrors("numero_documento");
          setDocumentValidation({ isChecking: false, exists: false, message: "Documento disponible" });
        }
      } catch (error) {
        setDocumentValidation({ isChecking: false, exists: false, message: "Error al verificar" });
      }
    };
    checkDocument();
  }, [debouncedDocument, user?.id, setError, clearErrors]);

  // Email validation
  useEffect(() => {
    const checkEmail = async () => {
        if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
            setEmailValidation({ isChecking: false, exists: false, message: "" });
            return;
        }
        setEmailValidation({ isChecking: true, exists: false, message: "" });
        try {
            const exists = await userService.checkEmailExists(debouncedEmail.toLowerCase(), user?.id);
            if (exists) {
                setError("correo", { type: "manual", message: "Este correo ya está registrado." });
                setEmailValidation({ isChecking: false, exists: true, message: "Correo ya registrado" });
            } else {
                clearErrors("correo");
                setEmailValidation({ isChecking: false, exists: false, message: "Correo disponible" });
            }
        } catch (error) {
            setEmailValidation({ isChecking: false, exists: false, message: "Error al verificar" });
        }
    };
    checkEmail();
  }, [debouncedEmail, user?.id, setError, clearErrors]);

  const onSubmit = async (data: UserFormValues) => {
    // ✅ Se elimina validación de contraseña para nuevos usuarios
    try {
      await onSave(data);
      Swal.fire("¡Éxito!", user ? "Usuario actualizado" : "Usuario registrado correctamente. Se enviará un correo con las credenciales de acceso.", "success");
      onClose();
    } catch (error) {
      Swal.fire("Error", "Ocurrió un error", "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Registrar Usuario"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Document Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Controller
                  control={control}
                  name="tipo_documento"
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                              <SelectItem value="PP">Pasaporte</SelectItem>
                              <SelectItem value="DIE">Documento de Identidad Extranjero</SelectItem>
                          </SelectContent>
                      </Select>
                  )}
              />
              {errors.tipo_documento && <p className="text-red-500 text-xs mt-1">{errors.tipo_documento.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número de Documento</Label>
              <div className="relative">
                <Input
                  id="numero_documento"
                  {...register("numero_documento")}
                  placeholder="Ingrese el número de documento"
                  className={documentValidation.exists ? "border-red-500" : documentValidation.message && !documentValidation.exists ? "border-green-500" : ""}
                />
                {documentValidation.isChecking && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
                {!documentValidation.isChecking && documentValidation.message && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {documentValidation.exists ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {documentValidation.message && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${documentValidation.exists ? 'text-red-500' : 'text-green-600'}`}>
                  {documentValidation.exists ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {documentValidation.message}
                </p>
              )}
              {errors.numero_documento && <p className="text-red-500 text-sm">{errors.numero_documento.message}</p>}
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                {...register("fecha_nacimiento")}
              />
              {errors.fecha_nacimiento && <p className="text-red-500 text-sm">{errors.fecha_nacimiento.message}</p>}
            </div>
          )}

          {/* Name Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                {...register("nombre")}
                placeholder="Ingrese nombre"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                {...register("apellido")}
                placeholder="Ingrese apellido"
              />
              {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
            </div>
          </div>

          {/* Contact Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="correo">Correo Electrónico</Label>
              <div className="relative">
                <Input
                  id="correo"
                  type="email"
                  {...register("correo")}
                  placeholder="ejemplo@correo.com"
                  className={emailValidation.exists ? "border-red-500" : emailValidation.message && !emailValidation.exists ? "border-green-500" : ""}
                />
                {emailValidation.isChecking && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
                {!emailValidation.isChecking && emailValidation.message && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailValidation.exists ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {emailValidation.message && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${emailValidation.exists ? 'text-red-500' : 'text-green-600'}`}>
                  {emailValidation.exists ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {emailValidation.message}
                </p>
              )}
              {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmarCorreo">Confirmar Correo Electrónico</Label>
              <Input
                id="confirmarCorreo"
                type="email"
                {...register("confirmarCorreo")}
                placeholder="ejemplo@correo.com"
              />
              {errors.confirmarCorreo && <p className="text-red-500 text-xs mt-1">{errors.confirmarCorreo.message}</p>}
            </div>
          </div>

          {/* Password Fields - ✅ SE ELIMINAN COMPLETAMENTE */}
          {/* {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contrasena">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="contrasena"
                    type={showPassword ? "text" : "password"}
                    {...register("contrasena")}
                    placeholder="********"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirmarContrasena">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmarContrasena"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmarContrasena")}
                    placeholder="********"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmarContrasena && <p className="text-red-500 text-xs mt-1">{errors.confirmarContrasena.message}</p>}
              </div>
            </div>
          )} */}

          {/* ✅ Agregar mensaje informativo sobre contraseña automática */}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Info className="h-4 w-4" />
                <p className="text-sm font-medium">Contraseña automática</p>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                La contraseña inicial será el número de documento del usuario. Se enviará un correo electrónico con las credenciales de acceso.
              </p>
            </div>
          )}

          {/* Optional Fields */}
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              {...register("telefono")}
              placeholder="Ingrese número de teléfono"
            />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              {...register("direccion")}
              placeholder="Ingrese dirección completa"
            />
          </div>

          {/* Role, Birth Date and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_rol">Rol</Label>
              <Controller
                  control={control}
                  name="id_rol"
                  render={({ field }) => (
                      <Select
                          value={field.value ? field.value.toString() : ""}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={isLoadingRoles}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder={isLoadingRoles ? "Cargando roles..." : "Seleccionar rol"} />
                          </SelectTrigger>
                          <SelectContent>
                              {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                      {role.nombre}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  )}
              />
              {errors.id_rol && <p className="text-red-500 text-xs mt-1">{errors.id_rol.message}</p>}
            </div>

            <div>
              <Label htmlFor="genero">Género</Label>
              <Controller
                  name="genero"
                  control={control}
                  render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                              <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="M">Masculino</SelectItem>
                              <SelectItem value="F">Femenino</SelectItem>
                              <SelectItem value="O">Otro</SelectItem>
                          </SelectContent>
                      </Select>
                  )}
              />
              {errors.genero && <p className="text-red-500 text-xs mt-1">{errors.genero.message}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                documentValidation.isChecking || 
                emailValidation.isChecking ||
                documentValidation.exists ||
                emailValidation.exists
              } 
              className="bg-black hover:bg-gray-800"
            >
              {isSubmitting ? "Guardando..." : user ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
