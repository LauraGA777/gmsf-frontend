import React from "react";
import { ClientsTable } from "../ClientsTable";
import { ClientDetails } from "../ClientDetails";
import { EditClientModal } from "../EditClientModal";
import { RenewMembershipModal } from "../RenewMembershipModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { mockClients } from "@/data/mockData";
import type { Client } from "@/types";

// Mapear los datos simulados de clientes al formato que esperan los componentes
const clients: Client[] = mockClients.map(c => ({
    id: c.id_persona.toString(),
    codigo: c.codigo,
    name: `${c.nombre} ${c.apellido}`,
    firstName: c.nombre,
    lastName: c.apellido,
    email: c.email,
    phone: c.telefono,
    documentType: c.tipo_documento,
    documentNumber: c.numero_documento,
    address: c.direccion || "",
    birthdate: c.fecha_nacimiento ? new Date(c.fecha_nacimiento) : undefined,
    status: c.estado ? "Activo" : "Inactivo",
    membershipType: "Mensual",
    membershipEndDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 días en el futuro
    registrationDate: c.fecha_registro ? new Date(c.fecha_registro) : new Date(),
    asistencias_totales: c.asistencias_totales,
    genero: c.genero
}));

// Para los modales necesitamos un cliente de ejemplo
const sampleClient = clients[0];

// Función para manejar actualizaciones de clientes (simulada)
const handleUpdateClient = (updates: Partial<Client>) => {
    console.log("Cliente actualizado:", updates);
};

export const clientsRoutes = [
    {
        path: "clients",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <ClientsTable
                    clients={clients}
                    onUpdateClient={handleUpdateClient}
                />
            </ProtectedRoute>
        ),
        children: [
            {
                path: ":clientId",
                element: (
                    <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                        <ClientDetails
                            client={sampleClient}
                            onClose={() => console.log("Cerrar detalles")}
                        />
                    </ProtectedRoute>
                ),
            },
            {
                path: "edit/:clientId",
                element: (
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <EditClientModal
                            client={sampleClient}
                            onUpdateClient={handleUpdateClient}
                            onClose={() => console.log("Cerrar edición")}
                        />
                    </ProtectedRoute>
                ),
            },
            {
                path: "renew/:clientId",
                element: (
                    <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                        <RenewMembershipModal
                            client={sampleClient}
                            onSubmit={handleUpdateClient}
                        />
                    </ProtectedRoute>
                ),
            },
        ],
    },
];