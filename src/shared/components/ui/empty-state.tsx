import React from "react"
import { Button } from "@/shared/components/ui/button"
import { PlusCircle } from "lucide-react"

interface EmptyStateProps {
  Icon?: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  Icon = PlusCircle, 
  title, 
  description, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 border-2 border-dashed rounded-lg">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {onAction && actionText && (
        <Button onClick={onAction} className="mt-6">
          {actionText}
        </Button>
      )}
    </div>
  )
} 