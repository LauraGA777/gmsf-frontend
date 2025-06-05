import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Switch } from "@/shared/components/ui/switch"
import { Label } from "@/shared/components/ui/label"
import type { Membership } from "@/shared/types/membership"
import { formatCOP, formatDays } from "@/shared/lib/utils"

interface MembershipDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  membership: Membership | null
  onToggleStatus: () => void
}

export function MembershipDetailsModal({ isOpen, onClose, membership, onToggleStatus }: MembershipDetailsModalProps) {
  if (!membership) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de Membresía</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Código</Label>
              <Badge variant="outline" className="font-mono mt-1">
                {membership.code}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Estado</Label>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={membership.isActive}
                  onCheckedChange={onToggleStatus}
                  disabled={membership.isActive && membership.activeContracts > 0}
                />
                <Badge
                  variant={membership.isActive ? "default" : "secondary"}
                  className={membership.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {membership.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Nombre</Label>
            <p className="mt-1 font-medium">{membership.name}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Descripción</Label>
            <p className="mt-1 text-gray-700">{membership.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Precio</Label>
              <p className="mt-1 font-semibold text-lg">{formatCOP(membership.price)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Días Acceso/Vigencia</Label>
              <p className="mt-1 font-medium">{formatDays(membership.accessDays, membership.validityDays)}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
            <p className="mt-1">{membership.createdAt.toLocaleDateString("es-ES")}</p>
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-gray-600">Contratos Vinculados</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Contratos activos:</span>
                <Badge variant={membership.activeContracts > 0 ? "default" : "secondary"}>
                  {membership.activeContracts}
                </Badge>
              </div>
              {membership.activeContracts > 0 && membership.isActive && (
                <p className="text-xs text-amber-600 mt-2">⚠️ No se puede desactivar mientras tenga contratos activos</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
