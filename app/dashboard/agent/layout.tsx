"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/toaster"
import { DashboardSidebar } from "@/app/components/dashboard-sidebar"
import { AgentDashboardHeader } from "@/app/components/agent-dashboard-header"
import { SettingsProvider } from "@/contexts/settings-context"

export default function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)

    // Get userId from cookie
    const storedUserId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_id="))
      ?.split("=")[1]

    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  // Prevent hydration errors by not rendering until client-side
  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <SettingsProvider isAgent={true}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar userType="agent" />
        <div className="flex flex-1 flex-col">
          <AgentDashboardHeader agentId={userId} />
          <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">{children}</main>
        </div>
        <Toaster />
      </div>
    </SettingsProvider>
  )
}
