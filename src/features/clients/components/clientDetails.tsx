import { format } from "date-fns"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import type { Client } from "@/shared/types/client"
import { User, Mail, Phone, Calendar, CreditCard, UserCheck, AlertCircle, CheckCircle, Shield, Contact } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface ClientDetailsProps {
  client: Client
  onClose: () => void
}

export function ClientDetails({ client, onClose }: ClientDetailsProps) {
  const usuario = client.usuario

  return (
    <div className="p-1">
      <h2 className="text-xl font-bold mb-3 px-4">Detalles del Cliente</h2>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 mb-3 mx-4">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="emergency">Contactos</TabsTrigger>
          {client.beneficiarios && client.beneficiarios.length > 0 && (
            <TabsTrigger value="beneficiaries">Beneficiarios</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="personal" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-500">Nombre Completo</p>
                  <p>{usuario?.nombre} {usuario?.apellido}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Estado</p>
                  <Badge variant={client.estado ? "default" : "destructive"}>
                    {client.estado ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-500">Documento</p>
                  <p>{usuario?.tipo_documento} {usuario?.numero_documento}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Fecha de Nacimiento</p>
                  <p>{usuario?.fecha_nacimiento ? format(new Date(usuario.fecha_nacimiento), "dd/MM/yyyy") : 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-500">Correo Electrónico</p>
                  <p>{usuario?.correo}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Teléfono</p>
                  <p>{usuario?.telefono || "No especificado"}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-500">Dirección</p>
                <p>{usuario?.direccion || "No especificada"}</p>
              </div>
            </CardContent>
          </Card>
          {client.titular && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5"/> Información del Titular</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-gray-500">Nombre</p>
                  <p>{client.titular.usuario?.nombre} {client.titular.usuario?.apellido}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Relación</p>
                  <p>{client.relacion || 'No especificada'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Contactos de Emergencia</CardTitle>
            </CardHeader>
            <CardContent>
              {client.contactos_emergencia && client.contactos_emergencia.length > 0 ? (
                <ul className="space-y-3">
                  {client.contactos_emergencia.map(contact => (
                    <li key={contact.id} className="p-3 bg-gray-50 rounded-lg border text-sm">
                      <p className="font-semibold">{contact.nombre_contacto}</p>
                      <p className="text-gray-600">{contact.relacion_contacto}</p>
                      <p className="text-gray-600 flex items-center gap-2"><Phone className="h-3 w-3"/>{contact.telefono_contacto}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No hay contactos de emergencia registrados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {client.beneficiarios && client.beneficiarios.length > 0 && (
          <TabsContent value="beneficiaries" className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Beneficiarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {client.beneficiarios.map(beneficiary => (
                    <li key={beneficiary.id_persona} className="p-3 bg-gray-50 rounded-lg border text-sm">
                      <p className="font-semibold">{beneficiary.usuario?.nombre} {beneficiary.usuario?.apellido}</p>
                      <p className="text-gray-600">{beneficiary.relacion}</p>
                      <p className="text-gray-600 flex items-center gap-2"><Mail className="h-3 w-3"/>{beneficiary.usuario?.correo || 'N/A'}</p>
                      <p className="text-gray-600 flex items-center gap-2"><Phone className="h-3 w-3"/>{beneficiary.usuario?.telefono || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-4 flex justify-end border-t pt-3 mx-4">
        <Button size="sm" onClick={onClose} className="bg-black hover:bg-gray-800">
          Cerrar
        </Button>
      </div>
    </div>
  )
}

