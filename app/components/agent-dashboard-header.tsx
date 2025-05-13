"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, LogOut, Search, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/app/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { logoutUser } from "@/app/actions/auth-actions"
import { AgentNotifications } from "@/app/components/agent-notifications"
import { useAuth } from "@/hooks/use-auth"

export function AgentDashboardHeader({ agentId }: { agentId: string | null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const result = await logoutUser()
      if (result.success) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        })
        router.push("/auth/login")
      } else {
        toast({
          title: "Logout failed",
          description: result.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-gray-900 dark:border-gray-800 md:px-6">
      <div className="relative hidden md:flex md:flex-1 md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input type="search" placeholder="Search transactions..." className="w-full pl-9" />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
        {agentId && <AgentNotifications agentId={agentId} />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {user?.image ? (
                  <AvatarImage src={user?.image} alt={user?.name || "Agent"} />
                ) : (
                  <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "AB"}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Agent Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/agent/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/agent/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
