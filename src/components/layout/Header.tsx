"use client"

import { UserMenu } from "@/components/layout/UserMenu"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  toggleSidebar: () => void
  currentSection?: string
}

export function Header({ toggleSidebar, currentSection }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex space-x-3 items-center">
          {/* Logo/Título para desktop */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">GMSF</h1>
          </div>

          {/* Separador */}
          {currentSection && (
            <>
              <div className="hidden md:block h-4 w-px bg-gray-200" />
              <div className={cn(
                "text-sm md:text-base font-medium text-gray-700",
                "animate-in fade-in duration-500"
              )}>
                {currentSection}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />
        <UserMenu />
      </div>
    </header>
  )
}

