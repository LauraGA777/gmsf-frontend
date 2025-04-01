"use client"

import { useState, useEffect } from "react"
import { differenceInDays } from "date-fns"
import { useAuth } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { DashboardSummary } from "@/components/dashboard/DashboardSummary"
import { UpcomingTrainings } from "@/components/dashboard/UpcomingTrainings"
import type { Client, Training } from "@/types"

export function DashboardPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([
    {
      id: "0001",
      name: "Juan Pérez",
      email: "juan@example.com",
      membershipType: "Premium",
      status: "Activo",
      membershipEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días desde hoy
    },
    {
      id: "0002",
      name: "María González",
      email: "maria@example.com",
      membershipType: "Estándar",
      status: "Activo",
      membershipEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días desde hoy
    },
    {
      id: "0003",
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      membershipType: "Básico",
      status: "Inactivo",
      membershipEndDate: null,
    },
    {
      id: "0004",
      name: "Ana Martínez",
      email: "ana@example.com",
      membershipType: "Premium",
      status: "Activo",
      membershipEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días desde hoy
    },
    {
      id: "0005",
      name: "Luis Sánchez",
      email: "luis@example.com",
      membershipType: "Estándar",
      status: "Inactivo",
      membershipEndDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expirada hace 10 días
    },
  ])

  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: 1,
      client: "Juan Pérez",
      clientId: "0001",
      trainer: "Carlos Ruiz",
      trainerId: "t1",
      service: "Entrenamiento personal",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días desde hoy
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 10:00 AM
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 11:00 AM
      maxCapacity: 5,
      occupiedSpots: 3,
      status: "Activo",
    },
    {
      id: 2,
      client: "María González",
      clientId: "0002",
      trainer: "Ana Gómez",
      trainerId: "t2",
      service: "Yoga",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días desde hoy
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4:00 PM
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // 5:00 PM
      maxCapacity: 10,
      occupiedSpots: 7,
      status: "Activo",
    },
    {
      id: 3,
      client: "Carlos Rodríguez",
      clientId: "0003",
      trainer: "Miguel Sánchez",
      trainerId: "t3",
      service: "Crossfit",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día desde hoy
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 6:00 PM
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 7:00 PM
      maxCapacity: 8,
      occupiedSpots: 8,
      status: "Activo",
    },
  ])

  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([])

  // Filtrar entrenamientos según el rol del usuario
  useEffect(() => {
    if (!user) {
      setFilteredTrainings([])
      return
    }

    let filtered = [...trainings]

    // Si es cliente, solo mostrar sus entrenamientos
    if (user.role === "client" && user.clientId) {
      filtered = filtered.filter((training) => training.clientId === user.clientId)
    }

    // Si es entrenador, mostrar solo los entrenamientos que imparte
    else if (user.role === "trainer" && user.trainerId) {
      filtered = filtered.filter((training) => training.trainerId === user.trainerId)
    }

    setFilteredTrainings(filtered)
  }, [user, trainings])

  return (
    <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardSummary
          activeClients={clients.filter((c) => c.status === "Activo").length}
          activeTrainings={trainings.filter((t) => t.status === "Activo").length}
          upcomingExpirations={
            clients.filter(
              (c) =>
                c.status === "Activo" && c.membershipEndDate && differenceInDays(c.membershipEndDate, new Date()) <= 7,
            ).length
          }
        />
        <UpcomingTrainings trainings={filteredTrainings.slice(0, 3)} />
      </div>
    </ProtectedRoute>
  )
}

