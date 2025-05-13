"use client"

import { useEffect, useState } from "react"
import { firebaseApp, firebaseError } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "configured" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    try {
      // Check Firebase initialization status
      if (firebaseApp) {
        setStatus("configured")
      } else {
        setStatus("error")
        setErrorMessage(firebaseError || "Firebase is not properly initialized")
      }

      // Collect environment variables for debugging (masking sensitive values)
      const vars = {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "***" : undefined,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "***" : undefined,
      }
      setEnvVars(vars)
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error.message || "Unknown error initializing Firebase")
    }
  }, [])

  if (status === "loading") {
    return null
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Configuration Error</AlertTitle>
        <AlertDescription>
          <p>{errorMessage || "There was an error initializing Firebase. Check your environment variables."}</p>

          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="mt-2">
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>

          {showDetails && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p className="font-semibold">Environment Variables:</p>
              <ul className="mt-1 space-y-1">
                {Object.entries(envVars).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-medium">{key}:</span> {value ? "Set" : "Not Set"}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-red-600">
                Make sure all required Firebase environment variables are set in your .env.local file.
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return null // Don't show anything when configured correctly
}
