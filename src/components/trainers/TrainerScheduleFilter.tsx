"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface TrainerScheduleFilterProps {
  selectedTrainer: string | null
  onTrainerChange: (trainerId: string | null) => void
}

export function TrainerScheduleFilter({ selectedTrainer, onTrainerChange }: TrainerScheduleFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Datos de ejemplo para entrenadores
  const trainers = [
    { id: "1", name: "Juan Pérez" },
    { id: "2", name: "María García" },
    { id: "3", name: "Carlos López" },
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Filtrar Entrenadores</h2>

      <div className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Buscar entrenador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <Select
          value={selectedTrainer || "all"}
          onValueChange={(value) => onTrainerChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los entrenadores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los entrenadores</SelectItem>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.id}>
                {trainer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

