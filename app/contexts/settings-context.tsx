"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

type SettingsContextType = {
  settings: {
    theme: string
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
    twoFactorEnabled: boolean
    transactionPinEnabled: boolean
    autoLogout?: boolean
    autoPrintReceipts?: boolean
    defaultCommission?: string
    businessName?: string
  }
  updateSettings: (newSettings: Partial<SettingsContextType["settings"]>) => void
}

const defaultSettings = {
  theme: "system",
  emailNotifications: true,
  smsNotifications: false,
  whatsappNotifications: true,
  twoFactorEnabled: false,
  transactionPinEnabled: true,
  autoLogout: false,
  autoPrintReceipts: true,
  defaultCommission: "2.5",
  businessName: "Funacash Agent",
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
})

export function SettingsProvider({
  children,
  isAgent = false,
}: {
  children: React.ReactNode
  isAgent?: boolean
}) {
  const { setTheme } = useTheme()
  const [settings, setSettings] = useState(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem(isAgent ? "agent-settings" : "customer-settings")
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings)
      setSettings(parsedSettings)
      setTheme(parsedSettings.theme)
    }
    setLoaded(true)
  }, [isAgent, setTheme])

  // Update settings
  const updateSettings = (newSettings: Partial<SettingsContextType["settings"]>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem(isAgent ? "agent-settings" : "customer-settings", JSON.stringify(updated))

      // Update theme if it changed
      if (newSettings.theme && newSettings.theme !== prev.theme) {
        setTheme(newSettings.theme)
      }

      return updated
    })
  }

  // Don't render until settings are loaded from localStorage
  if (!loaded) {
    return null
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
