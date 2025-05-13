"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CookieConsentProps {
  className?: string
}

export function CookieConsent({ className }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consentGiven = localStorage.getItem("cookieConsent")

    if (!consentGiven) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    setPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })

    localStorage.setItem("cookieConsent", "all")
    setShowBanner(false)
  }

  const savePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences))
    setShowBanner(false)
  }

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (!showBanner) return null

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 animate-fade-in", className)}>
      <div className="bg-white border-t border-gray-200 shadow-lg p-4 md:p-6">
        <div className="container mx-auto max-w-7xl">
          {!showPreferences ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">We value your privacy</h3>
                <p className="mt-1 text-sm text-gray-600">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our
                  traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
                  Customize
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowPreferences(false)}
                className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
                aria-label="Close preferences"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie Preferences</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="necessary"
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="necessary" className="font-medium text-gray-700">
                      Necessary Cookies
                    </label>
                    <p className="text-gray-500">These cookies are essential for the website to function properly.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="functional"
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handlePreferenceChange("functional")}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="functional" className="font-medium text-gray-700">
                      Functional Cookies
                    </label>
                    <p className="text-gray-500">These cookies enable personalized features and functionality.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="analytics"
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange("analytics")}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="analytics" className="font-medium text-gray-700">
                      Analytics Cookies
                    </label>
                    <p className="text-gray-500">
                      These cookies help us understand how visitors interact with our website.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="marketing"
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange("marketing")}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="marketing" className="font-medium text-gray-700">
                      Marketing Cookies
                    </label>
                    <p className="text-gray-500">
                      These cookies are used to display relevant advertisements and marketing campaigns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-sm text-gray-500">
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => setShowPreferences(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={savePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
