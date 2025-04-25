"use client"

import { UserMenu } from "./UserMenu"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  toggleSidebar: () => void
}

/**
 * Application header component with sidebar toggle and user menu
 */
export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-primary">GMSF</h1>
      </div>
      <UserMenu />
    </header>
  )
}