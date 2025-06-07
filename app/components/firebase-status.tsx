"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { firebaseApp, firebaseError } from "@/lib/firebase"

export function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "configured" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Only check Firebase status in the browser
    if (typeof window !== "undefined") {
      try {
        // Check Firebase initialization status
        if (firebaseApp) {
          setStatus("configured")
        } else {
          setStatus("error")
          setErrorMessage(firebaseError || "Firebase is not properly initialized")
        }
      } catch (error: any) {
        setStatus("error")
        setErrorMessage(error.message || "Unknown error initializing Firebase")
      }
    }
  }, [])

  // Don't show anything during loading or when configured correctly
  if (status === "loading" || status === "configured") {
    return null
  }

  // Only show error alert when there's an actual error
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Firebase Configuration Notice</AlertTitle>
      <AlertDescription>
        <p>Firebase services are currently unavailable. Some features may be limited.</p>

        <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="mt-2">
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>

        {showDetails && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p className="font-semibold">Details:</p>
            <p>{errorMessage || "No specific error details available."}</p>
            <p className="mt-2">
              This is not affecting the current page view. Firebase is only needed for authenticated features.
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
