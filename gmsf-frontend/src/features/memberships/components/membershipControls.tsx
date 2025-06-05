import { Search, Plus, Filter } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import type { FilterStatus } from "@/shared/types/membership"

interface MembershipControlsProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: FilterStatus
  onFilterChange: (value: FilterStatus) => void
  onCreateNew: () => void
}

export function MembershipControls({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onCreateNew,
}: MembershipControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Button onClick={onCreateNew} className="sm:order-3 bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Nueva Membresía
      </Button>

      <div className="relative flex-1 sm:order-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por código, nombre o descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filterStatus} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full sm:w-48 sm:order-2">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
