import React from "react";
import { ContractsTable } from "../ContractsTable";
import { ContractDetails } from "../ContractDetails";
import { EditContractModal } from "../EditContractModal";
import { NewContractForm } from "../NewContractForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MOCK_CONTRACTS, mockClients, mockMemberships } from "@/data/mockData";
import type { Contract, Client, Membership } from "@/types";

// Mapear los datos simulados de contratos al formato que esperan los componentes
const contracts: Contract[] = MOCK_CONTRACTS.map((c: any) => ({
    id: c.id,
    codigo: c.codigo || "",
    id_cliente: c.id_cliente,
    id_membresia: c.id_membresia,
    fecha_inicio: new Date(c.fecha_inicio),
    fecha_fin: new Date(c.fecha_fin),
    estado: c.estado,
    cliente_nombre: c.cliente_nombre || "",
    membresia_nombre: c.membresia_nombre || "",
    membresia_precio: c.membresia_precio || 0,
    precio_total: c.precio_total
}));

// Funciones simuladas para manejar operaciones de contratos
const handleUpdateContract = (id: number, updates: Partial<Contract>) => {
    console.log("Contrato actualizado:", id, updates);
};

const handleCreateContract = (contract: Omit<Contract, "id">) => {
    console.log("Nuevo contrato:", contract);
    return 100; // ID simulado del nuevo contrato
};

// Cliente de ejemplo para el NewContractForm
const clients: Client[] = mockClients.map((c: any) => ({
    id: c.id_persona?.toString() || "",
    codigo: c.codigo || "",
    name: `${c.nombre || ""} ${c.apellido || ""}`,
    email: c.email || "",
    status: c.estado ? "Activo" : "Inactivo",
}));

// Convertir mockMemberships a tipo Membership de @/types
const typedMemberships: Membership[] = mockMemberships.map((m: any) => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion || "",
    duracion_dias: m.duracion_dias,
    precio: m.precio,
    estado: m.estado
}));

export const contractsRoutes = [
    {
        path: "contracts",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <ContractsTable
                    contracts={contracts}
                    onUpdateContract={handleUpdateContract}
                    memberships={typedMemberships}
                    clients={clients}
                    onAddContract={() => console.log("Agregar contrato")}
                    onDeleteContract={(id) => console.log("Eliminar contrato", id)}
                    onAddClient={() => console.log("Agregar cliente")}
                />
            </ProtectedRoute>
        ),
        children: [
            {
                path: ":contractId",
                element: (
                    <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                        <ContractDetails
                            contract={contracts[0]}
                            onClose={() => console.log("Cerrar detalles")}
                            memberships={typedMemberships}
                            clients={clients}
                            onRenew={(id) => console.log("Renovar contrato", id)}
                            onCancel={(id) => console.log("Cancelar contrato", id)}
                        />
                    </ProtectedRoute>
                ),
            },
            {
                path: "edit/:contractId",
                element: (
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <EditContractModal
                            contract={contracts[0]}
                            onUpdateContract={(updates) => handleUpdateContract(contracts[0].id, updates)}
                            onClose={() => console.log("Cerrar edición")}
                            memberships={typedMemberships}
                        />
                    </ProtectedRoute>
                ),
            },
            {
                path: "new",
                element: (
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <NewContractForm
                            clients={clients}
                            memberships={typedMemberships}
                            onSubmit={(data) => { console.log("Crear contrato", data); return 100; }}
                            onClose={() => console.log("Cerrar formulario")}
                        />
                    </ProtectedRoute>
                ),
            },
        ],
    },
];