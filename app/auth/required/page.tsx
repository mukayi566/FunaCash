"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/app/components/logo"

export default function AuthenticationRequired() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [returnUrl, setReturnUrl] = useState<string | null>(null)
  const [userType, setUserType] = useState<string>("user")

  useEffect(() => {
    // Get the return URL from the query parameters
    const returnTo = searchParams.get("returnTo")
    if (returnTo) {
      setReturnUrl(decodeURIComponent(returnTo))
    }

    // Determine user type from the return URL
    if (returnTo?.includes("/dashboard/agent")) {
      setUserType("agent")
    } else if (returnTo?.includes("/dashboard/customer")) {
      setUserType("customer")
    }
  }, [searchParams])

  const handleLogin = () => {
    const loginUrl = returnUrl ? `/auth/login?returnTo=${encodeURIComponent(returnUrl)}` : "/auth/login"
    router.push(loginUrl)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container flex flex-1 items-center justify-center px-4 py-12 md:px-6">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="large" href="/" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-red-500 mb-6">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>

            <p className="text-gray-600 dark:text-gray-300 mb-8">Please log in to access the {userType} dashboard.</p>

            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-lg py-6"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
