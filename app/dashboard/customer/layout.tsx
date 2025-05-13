"use client"

import type React from "react"

import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { DashboardSidebar } from "@/app/components/dashboard-sidebar"
import { CustomerDashboardHeader } from "@/app/components/customer-dashboard-header"
import { SettingsProvider } from "@/contexts/settings-context"
\
-
+
import { initializeDemoData } from "@/app/actions/balance-actions"

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Initialize demo data when the dashboard loads
    const initData = async () => {
      await initializeDemoData()
    }

    initData()
  }, [])

  return (
    <SettingsProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar userType="customer" />
        <div className="flex flex-1 flex-col">
          <CustomerDashboardHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </SettingsProvider>
  )
}
