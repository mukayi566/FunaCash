import { NextResponse } from "next/server"

export async function GET() {
  // Only enable this in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
  }

  // Get all environment variables that start with NEXT_PUBLIC_
  const publicEnvVars: Record<string, string | undefined> = {}

  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("NEXT_PUBLIC_")) {
      // Mask sensitive values
      if (
        key.includes("KEY") ||
        key.includes("SECRET") ||
        key.includes("PASSWORD") ||
        key.includes("TOKEN") ||
        key.includes("ID")
      ) {
        publicEnvVars[key] = process.env[key] ? "[MASKED]" : undefined
      } else {
        publicEnvVars[key] = process.env[key]
      }
    }
  })

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    publicEnvVars,
  })
}
