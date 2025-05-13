"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Download,
  FileText,
  MoreHorizontal,
  Search,
  Send,
  User,
  LogOut,
  Settings,
  AlertTriangle,
} from "lucide-react"
import { getAgentTransactions } from "@/app/actions/balance-actions"
import { logoutUser } from "@/app/actions/auth-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AgentNotifications } from "@/app/components/agent-notifications"
import { AgentBalanceCard } from "@/app/components/agent-balance-card"
import { WithdrawalRequests } from "@/app/components/withdrawal-requests"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { DashboardSkeleton } from "@/app/components/loading-skeleton"

interface Transaction {
  id: string
  userId: string
  agentId?: string
  type: string
  amount: number
  currency: string
  recipientName?: string
  recipientPhone?: string
  senderName?: string
  senderPhone?: string
  status: string
  fee: number
  createdAt: any
  customer?: string
}

export default function AgentDashboard() {
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessTransactionOpen, setIsProcessTransactionOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [indexNeeded, setIndexNeeded] = useState(false)
  const [indexUrl, setIndexUrl] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [authChecked, setAuthChecked] = useState(false)

  // Function to safely get a cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null // Server-side check

    try {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift() || null
        console.log(`Cookie ${name} value:`, cookieValue)
        return cookieValue
      }
      console.log(`Cookie ${name} not found`)
      return null
    } catch (error) {
      console.error(`Error getting cookie ${name}:`, error)
      return null
    }
  }

  // Set mounted state to true when component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use a separate effect for authentication check to avoid race conditions
  useEffect(() => {
    // Only run this on the client side
    if (typeof window === "undefined") return

    const checkAuth = () => {
      try {
        console.log("Checking authentication...")

        // Simple cookie parser function
        const getUserId = () => {
          return (
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("user_id="))
              ?.split("=")[1] || null
          )
        }

        const userId = getUserId()

        if (userId) {
          console.log("User ID found:", userId)
          setUserId(userId)
          setAuthChecked(true)

          // Start fetching data immediately after finding userId
          fetchAgentData(userId)
        } else {
          console.log("No user ID found, not authenticated")
          setAuthChecked(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setAuthChecked(true)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Function to fetch all agent data in parallel
  const fetchAgentData = async (id: string) => {
    try {
      // Fetch all data in parallel
      const [transactionsResult] = await Promise.all([
        getAgentTransactions(id),
        // Add other data fetching calls here
      ])

      if (transactionsResult.success) {
        // Check if index is needed
        if (transactionsResult.indexNeeded) {
          setIndexNeeded(true)
          setIndexUrl(transactionsResult.indexUrl)
        }

        // Enhance transactions with customer info
        const enhancedTransactions = transactionsResult.transactions.map((tx: any) => {
          return {
            ...tx,
            customer: tx.type === "send" ? tx.recipientName || "Customer" : tx.senderName || "Customer",
          }
        })

        setTransactions(enhancedTransactions)
      } else {
        console.error("Failed to fetch transactions:", transactionsResult.message)
        setError(transactionsResult.message || "Failed to fetch transactions")
      }
    } catch (error) {
      console.error("Error fetching agent data:", error)
      setError("An error occurred while fetching dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsProcessTransactionOpen(true)
  }

  const handleLogout = async () => {
    // Clear client-side cookies first
    if (typeof document !== "undefined") {
      document.cookie = "user_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }

    try {
      const result = await logoutUser()
      if (result.success) {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      // Still redirect even if the server-side logout fails
      router.push("/auth/login")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""

    let date
    try {
      date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }

    // If today, show "Today" + time
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // If yesterday, show "Yesterday" + time
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // Otherwise, show date
    return date.toLocaleDateString()
  }

  // Don't render anything during server-side rendering to prevent hydration issues
  if (!mounted || !authChecked) {
    return null
  }

  // If still loading, show the skeleton UI
  if (isLoading) {
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
        <p className="text-gray-600 mb-4">Please log in to access the agent dashboard.</p>
        <Button onClick={() => router.push("/auth/login")} className="bg-gradient-to-r from-blue-500 to-blue-700">
          Go to Login
        </Button>
      </div>
    )
  }

  // Calculate stats
  const todayTransactions = transactions.filter((tx) => {
    try {
      const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt)
      const today = new Date()
      return txDate.toDateString() === today.toDateString()
    } catch (error) {
      console.error("Error filtering transactions:", error)
      return false
    }
  })

  const todayRevenue = todayTransactions.reduce((sum, tx) => sum + (tx.fee || 0), 0)

  // Get unique customers
  const uniqueCustomers = new Set()
  transactions.forEach((tx) => {
    if (tx.userId) uniqueCustomers.add(tx.userId)
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="relative hidden md:flex md:flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input type="search" placeholder="Search transactions..." className="w-full pl-9" />
          </div>
          <div className="flex items-center gap-4">
            <AgentNotifications agentId={userId} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32&text=AB" alt="Agent Business" />
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Agent Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/agent/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/agent/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {indexNeeded && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Database Index Required</AlertTitle>
              <AlertDescription>
                For better performance, please{" "}
                <a
                  href={indexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  create the required index
                </a>{" "}
                for transaction queries.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mx-auto max-w-7xl">
            {/* Welcome Card */}
            <Card className="col-span-full">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">Welcome, ABC Money Services</h2>
                  <p className="text-sm text-gray-500">Here's what's happening with your agent account today.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row justify-center sm:justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-700">
                        <Send className="mr-2 h-4 w-4" />
                        Process Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Process New Transaction</DialogTitle>
                        <DialogDescription>Enter the transaction details to process.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="transactionType">Transaction Type</Label>
                          <select id="transactionType" className="w-full rounded-md border border-gray-300 p-2">
                            <option value="send">Send Money</option>
                            <option value="receive">Receive Money</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerName">Customer Name</Label>
                          <Input id="customerName" placeholder="Enter customer name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input id="amount" type="number" placeholder="Enter amount" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipientName">Recipient Name</Label>
                          <Input id="recipientName" placeholder="Enter recipient name" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          Cancel
                        </Button>
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-700">Continue</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayTransactions.length}</div>
                <p className="text-xs text-gray-500">+{Math.max(0, todayTransactions.length - 10)} from yesterday</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-xs">
                    <span className="font-medium text-green-600">+20%</span> from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(todayRevenue)} ZMW</div>
                <p className="text-xs text-gray-500">+15.00 ZMW from yesterday</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-xs">
                    <span className="font-medium text-green-600">+15%</span> from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers Served</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueCustomers.size}</div>
                <p className="text-xs text-gray-500">+1 from yesterday</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-xs">
                    <span className="font-medium text-green-600">+10%</span> from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <AgentBalanceCard agentId={userId} />
            <WithdrawalRequests agentId={userId} />

            {/* Recent Transactions Card */}
            <Card className="col-span-full">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent processed transactions</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-sm text-red-500 mb-2">{error}</div>
                ) : (
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="sent">Sent</TabsTrigger>
                      <TabsTrigger value="received">Received</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead className="hidden md:table-cell">Date</TableHead>
                              <TableHead className="hidden md:table-cell">Status</TableHead>
                              <TableHead className="hidden md:table-cell">Fee</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                  No transactions found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                  <TableCell>
                                    <div className="font-medium">{transaction.customer}</div>
                                    <div className="text-xs text-gray-500 md:hidden">
                                      {formatDate(transaction.createdAt)} • {transaction.status}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {transaction.type === "send"
                                        ? `To: ${transaction.recipientName || "N/A"}`
                                        : `From: ${transaction.senderName || "N/A"}`}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={transaction.type === "send" ? "destructive" : "success"}>
                                      {transaction.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatCurrency(transaction.amount)} {transaction.currency}
                                    <div className="text-xs text-gray-500 md:hidden">
                                      Fee: {formatCurrency(transaction.fee)} ZMW
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {formatDate(transaction.createdAt)}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      {transaction.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {formatCurrency(transaction.fee)} ZMW
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">More options</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View details</DropdownMenuItem>
                                        <DropdownMenuItem>Print receipt</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">Report issue</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    <TabsContent value="sent" className="mt-4">
                      {/* Sent transactions tab content */}
                    </TabsContent>
                    <TabsContent value="received" className="mt-4">
                      {/* Received transactions tab content */}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Process Transaction Dialog */}
      <Dialog open={isProcessTransactionOpen} onOpenChange={setIsProcessTransactionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Transaction</DialogTitle>
            <DialogDescription>Review and process the pending transaction.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && <div className="space-y-4 py-4">{/* Transaction details */}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessTransactionOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-700"
              onClick={() => setIsProcessTransactionOpen(false)}
            >
              Confirm & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
