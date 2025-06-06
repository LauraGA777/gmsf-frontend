import { AlertTriangle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import type { Membership } from "@/shared/types/membership"

interface ConfirmDeactivationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  membership: Membership | null
}

export function ConfirmDeactivationModal({ isOpen, onClose, onConfirm, membership }: ConfirmDeactivationModalProps) {
  if (!membership) return null

  const hasActiveContracts = membership.activeContracts > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirmar Desactivación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro que desea desactivar la membresía <strong>{membership.name}</strong>?
          </p>

          <p className="text-sm text-gray-600">Una vez desactivada, no podrá asignarse a nuevos contratos.</p>

          {hasActiveContracts && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>No se puede desactivar:</strong> Existen {membership.activeContracts} contratos activos
                vinculados a esta membresía.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={hasActiveContracts}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
            >
              {hasActiveContracts ? "No se puede desactivar" : "Confirmar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
