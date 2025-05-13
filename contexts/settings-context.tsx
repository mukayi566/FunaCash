"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"
type Language = "en" | "fr" | "es" | "pt" | "sw"

interface SettingsContextType {
  // Common settings
  theme: Theme
  language: Language
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  twoFactorAuth: boolean
  loginAlerts: boolean
  transactionAlerts: boolean

  // Agent-specific settings
  autoLogout?: boolean
  receiptPrinting?: boolean

  // Methods
  updateSettings: (settings: Partial<SettingsContextType>) => void
  isAgent: boolean
}

const defaultSettings: SettingsContextType = {
  theme: "light",
  language: "en",
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: false,
  twoFactorAuth: true,
  loginAlerts: true,
  transactionAlerts: true,
  autoLogout: true,
  receiptPrinting: true,
  updateSettings: () => {},
  isAgent: false,
}

const SettingsContext = createContext<SettingsContextType>(defaultSettings)

export const useSettings = () => useContext(SettingsContext)

export function SettingsProvider({
  children,
  isAgent = false,
}: {
  children: ReactNode
  isAgent?: boolean
}) {
  // Initialize state from localStorage if available
  const [settings, setSettings] = useState<SettingsContextType>(() => {
    if (typeof window !== "undefined") {
      const storedSettings = localStorage.getItem(isAgent ? "agent-settings" : "customer-settings")
      if (storedSettings) {
        return { ...defaultSettings, ...JSON.parse(storedSettings), isAgent, updateSettings }
      }
    }
    return { ...defaultSettings, isAgent, updateSettings }
  })

  // Update settings method
  function updateSettings(newSettings: Partial<SettingsContextType>) {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      return updated
    })
  }

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const settingsToSave = { ...settings }
      // Remove methods before saving
      delete settingsToSave.updateSettings

      localStorage.setItem(isAgent ? "agent-settings" : "customer-settings", JSON.stringify(settingsToSave))

      // Apply theme
      if (settings.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (settings.theme === "light") {
        document.documentElement.classList.remove("dark")
      } else if (settings.theme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (isDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    }
  }, [settings, isAgent])

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}
