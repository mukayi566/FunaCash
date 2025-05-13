"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle } from "lucide-react"
import { getAgentNotifications, markNotificationAsRead } from "@/app/actions/balance-actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: any
}

export function AgentNotifications({ agentId }: { agentId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexNeeded, setIndexNeeded] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Skip fetching if agentId is not available yet
    if (!agentId) {
      setIsLoading(false)
      return
    }

    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await getAgentNotifications(agentId)

        if (result.success) {
          setNotifications(result.notifications)

          // Check if index is needed
          if (result.indexNeeded && result.indexUrl) {
            setIndexNeeded(result.indexUrl)
          } else {
            setIndexNeeded(null)
          }
        } else {
          setError(result.message || "Failed to fetch notifications")
          // Initialize with empty array instead of demo data
          setNotifications([])
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setError("An error occurred while fetching notifications")
        // Initialize with empty array instead of demo data
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [agentId])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id)

        // Update local state
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    }

    // Handle different notification types
    if (notification.type === "withdrawal_request" && notification.data?.requestId) {
      // In a real app, you might navigate to a specific page
      // router.push(`/dashboard/agent/withdrawals/${notification.data.requestId}`);
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

    // If today, show time only
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If yesterday, show "Yesterday" + time
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // Otherwise, show date and time
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      {indexNeeded && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Index Required</AlertTitle>
          <AlertDescription>
            For optimal performance, a database index needs to be created.{" "}
            <a href={indexNeeded} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Click here to create the index
            </a>
          </AlertDescription>
        </Alert>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          ) : (
            <>
              {notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  {!notification.read && <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-blue-500"></span>}
                </DropdownMenuItem>
              ))}
              {notifications.length > 5 && (
                <DropdownMenuItem className="text-center text-sm text-blue-600 cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
