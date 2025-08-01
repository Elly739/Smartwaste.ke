"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Settings, LogOut } from "lucide-react"
import { useAuth, type User } from "@/hooks/use-auth"

interface MobileHeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  onViewAdmin: () => void
  user: User
}

export function MobileHeader({ isDarkMode, toggleDarkMode, onViewAdmin, user }: MobileHeaderProps) {
  const { signOut } = useAuth()

  return (
    <header className="bg-green-600 dark:bg-green-700 text-white p-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">SmartWaste KE</h1>
        <p className="text-green-100 text-sm">Welcome back, {user.name.split(" ")[0]}!</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="text-white hover:bg-green-700 dark:hover:bg-green-600"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onViewAdmin}
          className="text-white hover:bg-green-700 dark:hover:bg-green-600"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="text-white hover:bg-green-700 dark:hover:bg-green-600"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
