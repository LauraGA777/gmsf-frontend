import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/shared/components/input"
import { Button } from "@/shared/components/button"
import { Search, Filter, X, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/popover"
import { format, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/shared/components/badge"
import { Calendar as CalendarComponent } from "@/shared/components/calendar"
import type { SearchFilters } from "@/shared/types"

// Add a safe date formatter function
const formatSafeDate = (date: Date | null): string => {
  if (!date) return ""

  try {
    return isValid(date) ? format(date, "dd/MM/yyyy") : ""
  } catch (e) {
    return ""
  }
}

// Improve date range validation
const isValidDateRange = (from: Date | null, to: Date | null): boolean => {
  if (!from || !to) return true

  try {
    if (!isValid(from) || !isValid(to)) return false
    return from <= to
  } catch (e) {
    return false
  }
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  trainers: string[]
  services: string[]
  includeContracts?: boolean // New prop to indicate if contracts should be included in search
}

export function SearchBar({ onSearch, trainers, services, includeContracts = false }: SearchBarProps) {
  const [isAdvancedSearch, setIsAdvancedSearch] = useState<boolean>(false)
  const [searchType, setSearchType] = useState<"client" | "trainer" | "contract">("client")
  const [filters, setFilters] = useState<SearchFilters>({
    client: "",
    trainer: "",
    service: "",
    dateRange: { from: null, to: null },
    status: "", // Added status field for estado column
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Efecto para aplicar la búsqueda cuando cambia el entrenador seleccionado
  useEffect(() => {
    if (filters.trainer && filters.trainer !== "all") {
      handleSearch(new Event("submit") as any)
    }
  }, [filters.trainer])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)

    // Actualizar filtros activos
    const newActiveFilters: string[] = []
    if (filters.client) newActiveFilters.push(`Cliente: ${filters.client}`)
    if (filters.trainer && filters.trainer !== "all") newActiveFilters.push(`Entrenador: ${filters.trainer}`)
    if (filters.service && filters.service !== "all") newActiveFilters.push(`Servicio: ${filters.service}`)
    if (filters.status && filters.status !== "all") newActiveFilters.push(`Estado: ${filters.status}`)
    if (filters.dateRange.from && filters.dateRange.to) {
      newActiveFilters.push(
        `Fechas: ${format(filters.dateRange.from, "dd/MM/yyyy")} - ${format(filters.dateRange.to, "dd/MM/yyyy")}`,
      )
    }

    setActiveFilters(newActiveFilters)
  }

  const clearFilters = () => {
    setFilters({
      client: "",
      trainer: "",
      service: "",
      dateRange: { from: null, to: null },
      status: "", // Clear status field
    })
    setActiveFilters([])
    onSearch({
      client: "",
      trainer: "",
      service: "",
      dateRange: { from: null, to: null },
      status: "", // Clear status field
    })
  }

  const removeFilter = (index: number) => {
    const filterType = activeFilters[index].split(":")[0].trim()
    const newFilters = { ...filters }

    if (filterType === "Cliente") newFilters.client = ""
    if (filterType === "Entrenador") newFilters.trainer = ""
    if (filterType === "Servicio") newFilters.service = ""
    if (filterType === "Estado") newFilters.status = ""
    if (filterType === "Fechas") newFilters.dateRange = { from: null, to: null }

    setFilters(newFilters)
    onSearch(newFilters)

    const newActiveFilters = [...activeFilters]
    newActiveFilters.splice(index, 1)
    setActiveFilters(newActiveFilters)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Buscador</h2>

      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={searchType === "client" ? "default" : "outline"}
            onClick={() => setSearchType("client")}
            className="flex-1"
          >
            Buscar por Cliente
          </Button>
          <Button
            type="button"
            variant={searchType === "trainer" ? "default" : "outline"}
            onClick={() => setSearchType("trainer")}
            className="flex-1"
          >
            Buscar por Entrenador
          </Button>
          {includeContracts && (
            <Button
              type="button"
              variant={searchType === "contract" ? "default" : "outline"}
              onClick={() => setSearchType("contract")}
              className="flex-1"
            >
              Buscar por Contrato
            </Button>
          )}
        </div>

        {searchType === "client" ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre, documento, email, teléfono o estado"
                value={filters.client}
                onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {isAdvancedSearch ? "Ocultar filtros" : "Más filtros"}
                </Button>

                <Button variant="default" onClick={clearFilters} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {isAdvancedSearch && renderAdvancedSearch()}
          </form>
        ) : searchType === "trainer" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Entrenador</label>
              <Select value={filters.trainer} onValueChange={(value) => setFilters({ ...filters, trainer: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar entrenador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los entrenadores</SelectItem>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer} value={trainer}>
                      {trainer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {isAdvancedSearch ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
              </Button>

              <Button type="button" variant="default" onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>

            {isAdvancedSearch && renderAdvancedSearch()}
          </div>
        ) : (
          // Contract search form
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por código, cliente, membresía, estado o precio"
                value={filters.client}
                onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {isAdvancedSearch ? "Ocultar filtros" : "Más filtros"}
                </Button>

                <Button variant="default" onClick={clearFilters} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {isAdvancedSearch && renderAdvancedSearch()}
          </form>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 p-3 bg-gray-50 rounded-md">
          <div className="w-full mb-1 text-sm font-medium text-gray-700">Filtros activos:</div>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {filter}
              <button
                type="button"
                onClick={() => removeFilter(index)}
                className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs">
            Limpiar todos
          </Button>
        </div>
      )}
    </div>
  )

  function renderAdvancedSearch() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
        {searchType === "client" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Entrenador</label>
            <Select value={filters.trainer} onValueChange={(value) => setFilters({ ...filters, trainer: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los entrenadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los entrenadores</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer} value={trainer}>
                    {trainer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {searchType === "trainer" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <Input
              placeholder="Nombre del cliente"
              value={filters.client}
              onChange={(e) => setFilters({ ...filters, client: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Servicio</label>
          <Select value={filters.service} onValueChange={(value) => setFilters({ ...filters, service: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los servicios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los servicios</SelectItem>
              {services.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select value={filters.status || ""} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Congelado">Congelado</SelectItem>
              <SelectItem value="Pendiente de pago">Pendiente de pago</SelectItem>
              {searchType === "contract" && (
                <>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Por vencer">Por vencer</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Rango de fechas</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {filters.dateRange.from ? format(filters.dateRange.from, "dd/MM/yyyy") : <span>Fecha inicial</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={(date) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, from: date },
                    })
                  }
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {filters.dateRange.to ? format(filters.dateRange.to, "dd/MM/yyyy") : <span>Fecha final</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={(date) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, to: date },
                    })
                  }
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="col-span-2 flex justify-end">
          <Button type="button" variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </div>
    )
  }
}

