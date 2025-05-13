"use client"

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { getUserBalance } from "@/app/actions/balance-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: any
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [currency, setCurrency] = useState("ZMW")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Get userId from cookie
    const userId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_id="))
      ?.split("=")[1]

    if (!userId) {
      setError("Authentication required")
      toast({
        title: "Authentication required",
        description: "Please log in to view your notifications",
        variant: "destructive",
      })
      return
    }

    fetchData(userId)
  }, [])

  const fetchData = async (userId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch user balance
      const balanceResult = await getUserBalance(userId)

      if (balanceResult.success) {
        setBalance(balanceResult.balance)
        setCurrency(balanceResult.currency)
      } else {
        setError(balanceResult.message || "Failed to fetch balance")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("An error occurred while fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded bg-gray-200"></div>
          <div className="h-16 animate-pulse rounded bg-gray-200"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balance ? `${formatCurrency(balance)} ${currency}` : "Loading..."}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No notifications</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="rounded-lg border p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{notification.title}</span>
                        <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
