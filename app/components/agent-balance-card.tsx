"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { getAgentBalance } from "@/app/actions/balance-actions"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AgentBalanceCard({ agentId }: { agentId?: string }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [currency, setCurrency] = useState("ZMW")
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Skip fetching if agentId is not available yet
    if (!agentId) {
      setIsLoading(false)
      return
    }

    fetchBalance()
  }, [agentId])

  const fetchBalance = async () => {
    if (!agentId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await getAgentBalance(agentId)

      if (result.success) {
        setBalance(result.balance)
        setCurrency(result.currency)
        setLastUpdated(new Date())
      } else {
        setError(result.message || "Failed to fetch balance")
        // Don't set fallback balance
      }
    } catch (error) {
      console.error("Error fetching agent balance:", error)
      setError("An error occurred while fetching your balance")
      // Don't set fallback balance
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "0.00"

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getTimeAgo = () => {
    if (!lastUpdated) return ""

    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)

    if (seconds < 60) return "Updated just now"
    if (seconds < 120) return "Updated 1 minute ago"
    if (seconds < 3600) return `Updated ${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 7200) return "Updated 1 hour ago"
    return `Updated ${Math.floor(seconds / 3600)} hours ago`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agent Balance</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchBalance} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh balance</span>
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-red-500 mb-2">{error}</div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
              ) : (
                `${formatCurrency(balance)} ${currency}`
              )}
            </div>
            <p className="text-xs text-gray-500">{getTimeAgo()}</p>
            <div className="mt-4 rounded-md bg-amber-50 p-2">
              <p className="text-xs text-amber-800">
                This is the total amount available for processing customer withdrawals.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
