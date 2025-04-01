"use client"

import { UserMenu } from "@/components/layout/UserMenu"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  toggleSidebar: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm p-3 md:p-4 border-b sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        {/* Botón de hamburguesa para móviles */}
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="md:hidden" aria-label="Toggle menu">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Logo o título para desktop */}
        <div className="hidden md:block font-semibold text-lg">Gym Management</div>

        {/* UserMenu siempre visible */}
        <UserMenu />
      </div>
    </header>
  )
}

