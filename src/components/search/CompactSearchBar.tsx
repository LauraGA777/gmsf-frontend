"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { SearchFilters } from "@/types"
import type { Training } from "@/types"

interface CompactSearchBarProps {
  onSearch: (filters: SearchFilters) => void
  trainers: string[]
  services: string[]
  trainings: Training[]
}

export function CompactSearchBar({ onSearch, trainers, services, trainings }: CompactSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchResults, setSearchResults] = useState<{ type: string; name: string }[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [selectedFilter, setSelectedFilter] = useState<{ type: string; name: string } | null>(null)

  // Función para buscar coincidencias
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const results: { type: string; name: string }[] = []

    // Buscar en clientes
    const clientNames = [...new Set(trainings.map((t) => t.client))]
    clientNames.forEach((client) => {
      if (client.toLowerCase().includes(term.toLowerCase())) {
        results.push({ type: "client", name: client })
      }
    })

    // Buscar en entrenadores
    trainers.forEach((trainer) => {
      if (trainer.toLowerCase().includes(term.toLowerCase())) {
        results.push({ type: "trainer", name: trainer })
      }
    })

    setSearchResults(results)
    setShowResults(true)
  }

  // Actualizar resultados cuando cambia el término de búsqueda
  useEffect(() => {
    handleSearch(searchTerm)
  }, [searchTerm])

  // Manejar selección de resultado
  const handleSelectResult = (result: { type: string; name: string }) => {
    setSelectedFilter(result)
    setSearchTerm("")
    setShowResults(false)

    // Aplicar filtro según el tipo
    const filters: SearchFilters = {
      client: result.type === "client" ? result.name : "",
      trainer: result.type === "trainer" ? result.name : "",
      service: "",
      dateRange: { from: null, to: null },
    }

    onSearch(filters)
  }

  // Limpiar filtro
  const clearFilter = () => {
    setSelectedFilter(null)
    setSearchTerm("")
    setShowResults(false)

    onSearch({
      client: "",
      trainer: "",
      service: "",
      dateRange: { from: null, to: null },
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente o entrenador"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-gray-200 pr-10"
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="default"
            size="icon"
            className="bg-black hover:bg-gray-800"
            onClick={() => handleSearch(searchTerm)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Resultados de búsqueda */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {searchResults.map((result, index) => (
                <li
                  key={`${result.type}-${result.name}-${index}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  onClick={() => handleSelectResult(result)}
                >
                  <span>{result.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {result.type === "client" ? "Cliente" : "Entrenador"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filtro activo */}
      {selectedFilter && (
        <div className="mt-2 flex items-center">
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200 px-2 py-1"
          >
            {selectedFilter.name}
            <span className="ml-1 text-xs text-gray-500">
              ({selectedFilter.type === "client" ? "Cliente" : "Entrenador"})
            </span>
            <button type="button" onClick={clearFilter} className="ml-1 rounded-full hover:bg-gray-200 p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  )
}

