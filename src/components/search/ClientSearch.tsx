"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { User } from "lucide-react"
import { MOCK_CLIENTS } from "@/data/mockData"
import { cn } from "@/lib/utils"
import type { Client } from "@/types"

interface ClientSearchProps {
    onSelectClient: (name: string, id: number) => void
    selectedClient?: string
    error?: boolean
    disabled?: boolean
}

export function ClientSearch({
    onSelectClient,
    selectedClient = "",
    error = false,
    disabled = false,
}: ClientSearchProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [showDropdown, setShowDropdown] = useState(false)
    const [filteredClients, setFilteredClients] = useState<typeof MOCK_CLIENTS>([])
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Filtrar clientes activos con membresía vigente
    const activeClients = MOCK_CLIENTS.filter(
        (client) => client.status === "Activo" && client.membershipEndDate && client.membershipEndDate > new Date(),
    )

    // Actualizar clientes filtrados cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredClients([])
            return
        }

        const filtered = activeClients.filter(
            (client) =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.documentNumber && client.documentNumber.includes(searchTerm)),
        )
        setFilteredClients(filtered)
    }, [searchTerm])

    // Cerrar el dropdown cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleClientSelect = (client: Client) => {
        onSelectClient(client.name, Number.parseInt(client.id))
        setSearchTerm("")
        setShowDropdown(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <User className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                <Input
                    placeholder="Buscar cliente con contrato activo"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setShowDropdown(true)
                    }}
                    onClick={() => setShowDropdown(true)}
                    className={cn("pl-9", error ? "border-red-500" : "")}
                    disabled={disabled || !!selectedClient}
                />
            </div>

            {selectedClient && (
                <div className="mt-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                    Cliente seleccionado: <span className="font-medium">{selectedClient}</span>
                </div>
            )}

            {showDropdown && filteredClients.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                    <ul className="py-1">
                        {filteredClients.map((client) => (
                            <li
                                key={client.id}
                                className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleClientSelect(client)}
                            >
                                {client.name}
                                <span className="text-xs text-gray-500 ml-1">
                                    {client.documentType} {client.documentNumber}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showDropdown && searchTerm && filteredClients.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
                    No se encontraron clientes con contratos activos
                </div>
            )}
        </div>
    )
}

