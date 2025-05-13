import { type NextRequest, NextResponse } from "next/server"
import { getAgentTransactions } from "@/app/actions/balance-actions"

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId")

  if (!agentId) {
    return NextResponse.json({ error: "Missing agentId parameter" }, { status: 400 })
  }

  try {
    const result = await getAgentTransactions(agentId)

    // Cache the result for 1 minute
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error prefetching agent transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
