"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Send, Plus, BarChart3, RefreshCw, MessageCircle, Gift, AlertTriangle } from "lucide-react"
import { getUserTransactions, getUserBalance } from "@/app/actions/balance-actions"
import { fetchExchangeRate } from "@/app/actions/exchange-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { WhatsAppPayment } from "@/app/components/whatsapp-payment"
import { useToast } from "@/hooks/use-toast"
import { DashboardSkeleton } from "@/app/components/loading-skeleton"
import { FeaturedEvent } from "@/app/components/featured-event"
import { getEvents } from "@/lib/event-service"
import { Progress } from "@/components/ui/progress"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  recipientName?: string
  recipientPhone?: string
  senderName?: string
  senderPhone?: string
  status: string
  createdAt: any
}

export default function CustomerDashboard() {
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usdToZmwRate, setUsdToZmwRate] = useState<string | null>(null)
  const [isLoadingRate, setIsLoadingRate] = useState(true)
  const [featuredEvent, setFeaturedEvent] = useState<any>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number | null>(null)
  const [currency, setCurrency] = useState("ZMW")

  useEffect(() => {
    // Get userId from cookie
    const storedUserId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_id="))
      ?.split("=")[1]

    if (storedUserId) {
      setUserId(storedUserId)

      // Fetch all data sets in parallel
      Promise.all([
        fetchTransactions(storedUserId),
        fetchUsdToZmwRate(),
        fetchFeaturedEvent(),
        fetchUserBalance(storedUserId),
      ])
        .then(() => {
          // Set loading to false after all data is fetched
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching dashboard data:", error)
          setIsLoading(false)
        })
    } else {
      // Instead of setting error, redirect to login
      toast({
        title: "Authentication Error",
        description: "Please log in to access your dashboard",
        variant: "destructive",
      })
      router.push("/auth/login")
    }
  }, [router, toast])

  const fetchTransactions = async (id: string) => {
    try {
      setError(null)

      const result = await getUserTransactions(id)

      if (result.success) {
        setTransactions(result.transactions)
      } else {
        setError(result.message || "Failed to fetch transactions")
      }
      return result
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError("An error occurred while fetching transactions")
      throw error
    }
  }

  const fetchUsdToZmwRate = async () => {
    try {
      setIsLoadingRate(true)
      const result = await fetchExchangeRate("USD", "ZMW")

      if (result.success) {
        setUsdToZmwRate(result.rate)
      }
      setIsLoadingRate(false)
      return result
    } catch (error) {
      console.error("Error fetching exchange rate:", error)
      setIsLoadingRate(false)
      return { success: false }
    }
  }

  const fetchFeaturedEvent = async () => {
    try {
      setIsLoadingEvent(true)
      const result = await getEvents({ featured: true, status: "active", limit: 1 })

      if (result.success && result.events.length > 0) {
        setFeaturedEvent(result.events[0])
      }

      setIsLoadingEvent(false)
      return result
    } catch (error) {
      console.error("Error fetching featured event:", error)
      setIsLoadingEvent(false)
      return { success: false }
    }
  }

  const fetchUserBalance = async (id: string) => {
    try {
      const result = await getUserBalance(id)

      if (result.success) {
        setBalance(result.balance)
        setCurrency(result.currency)
      } else {
        setError(result.message || "Failed to fetch balance")
        setBalance(0) // Set default balance to 0
      }
      return result
    } catch (error) {
      console.error("Error fetching user balance:", error)
      setError("An error occurred while fetching your balance")
      setBalance(0) // Set default balance to 0
      return { success: false }
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "0.00"

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Clear the user_id cookie
      document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      router.push("/auth/login")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error: any) {
      console.error("Logout failed:", error)
      toast({
        title: "Error logging out",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // If still loading or no userId, show loading state
  if (isLoading && !userId) {
    return <DashboardSkeleton />
  }

  // If no userId after loading, show error
  if (!userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-red-600 mb-4">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
        <Button onClick={() => router.push("/auth/login")} className="bg-gradient-to-r from-blue-500 to-blue-700">
          Go to Login
        </Button>
      </div>
    )
  }

  // Get recent transactions (last 2)
  const recentTransactions = transactions.slice(0, 2)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Manage your transfers and account settings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchUserBalance(userId || "")}
              disabled={isLoading}
            >
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
                <p className="text-xs text-gray-500">Updated just now</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span>Monthly Limit</span>
                    <span>
                      {formatCurrency(0)} / {formatCurrency(5000)} {currency}
                    </span>
                  </div>
                  <Progress value={0} className="mt-1 h-2" />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </CardFooter>
        </Card>

        {/* Featured Event Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <WhatsAppPayment />

              <Button variant="outline" asChild>
                <Link href="/dashboard/customer/send-whatsapp">
                  <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
                  Send via WhatsApp
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/dashboard/customer/send">
                  <Send className="mr-2 h-4 w-4" />
                  Send Money
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/dashboard/customer/add-money">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Money
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p className="text-sm">Refer friends and earn rewards!</p>
              <div className="flex items-center justify-between rounded-lg border bg-blue-50 p-3">
                <div>
                  <p className="font-medium text-blue-700">First 10 referrals</p>
                  <p className="text-xs text-blue-600">5 Kwacha per referral</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">Additional referrals</p>
                  <p className="text-xs text-blue-600">2.5 Kwacha per referral</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/customer/referrals">
                <Gift className="mr-2 h-4 w-4" />
                View Referral Program
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/customer/transactions">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-sm text-red-500 mb-2">{error}</div>
            ) : isLoading ? (
              <div className="space-y-4">
                <div className="h-16 animate-pulse rounded bg-gray-200"></div>
                <div className="h-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">
                        {transaction.type === "send"
                          ? transaction.recipientName || "Send Money"
                          : transaction.senderName || "Received Money"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(transaction.amount)} {transaction.currency}
                      </p>
                      <p
                        className={`text-xs capitalize ${
                          transaction.status === "completed"
                            ? "text-green-600"
                            : transaction.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {isLoadingEvent ? (
          <div className="h-64 w-full bg-muted rounded-lg animate-pulse" />
        ) : featuredEvent ? (
          <FeaturedEvent event={featuredEvent} />
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No upcoming events at the moment.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/events">Browse All Events</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Exchange Rates</CardTitle>
            <CardDescription>Current rates for popular currency pairs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇿🇼</span>
                  <span>ZWL → ZMW</span>
                </div>
                <div className="font-medium">1 = 12.75</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇿🇲</span>
                  <span>ZMW → ZWL</span>
                </div>
                <div className="font-medium">1 = 0.078</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <span>USD → ZMW</span>
                </div>
                <div className="font-medium">
                  1 = {isLoadingRate ? "..." : usdToZmwRate ? Number.parseFloat(usdToZmwRate).toFixed(2) : "25.50"}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/customer/exchange">
                <RefreshCw className="mr-2 h-4 w-4" />
                Exchange Currency
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Stats</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Sent</span>
                <span className="font-medium">
                  {formatCurrency(transactions.filter((t) => t.type === "send").reduce((sum, t) => sum + t.amount, 0))}{" "}
                  ZMW
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Received</span>
                <span className="font-medium">
                  {formatCurrency(
                    transactions.filter((t) => t.type === "receive").reduce((sum, t) => sum + t.amount, 0),
                  )}{" "}
                  ZMW
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Transactions</span>
                <span className="font-medium">{transactions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Saved on Fees</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(transactions.reduce((sum, t) => sum + t.amount * 0.02, 0))} ZMW
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/customer/transactions">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Transactions
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>WhatsApp Support</CardTitle>
            <CardDescription>Get help via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <MessageCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="mb-1 font-medium">24/7 Customer Support</h3>
                <p className="text-sm text-gray-500 mb-4">Get instant help with your transactions and account</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() =>
                window.open(
                  "https://wa.me/+447860088593?text=Hi%20Funacash%2C%20I%20need%20help%20with%20my%20account",
                  "_blank",
                )
              }
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat with Support
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
