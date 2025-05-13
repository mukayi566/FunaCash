import { type NextRequest, NextResponse } from "next/server"
import { getUserTransactions } from "@/app/actions/balance-actions"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
  }

  try {
    const result = await getUserTransactions(userId)

    // Cache the result for 1 minute
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error prefetching customer transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
