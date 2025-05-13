import { NextResponse } from "next/server"
import { fetchExchangeRate } from "@/app/actions/exchange-actions"

export async function GET() {
  try {
    const result = await fetchExchangeRate("USD", "ZMW")

    // Cache the result for 30 minutes
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
      },
    })
  } catch (error) {
    console.error("Error prefetching exchange rates:", error)
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 500 })
  }
}
