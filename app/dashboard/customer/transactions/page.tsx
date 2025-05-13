"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowLeft, ArrowUp, Calendar, Download, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

// Sample transaction data
const transactions = [
  {
    id: "tx1",
    type: "send",
    amount: "500.00",
    currency: "ZMW",
    recipient: "Grace Moyo",
    date: "2023-05-20T10:30:00",
    status: "completed",
  },
  {
    id: "tx2",
    type: "receive",
    amount: "750.00",
    currency: "ZMW",
    sender: "David Banda",
    date: "2023-05-19T15:15:00",
    status: "completed",
  },
  {
    id: "tx3",
    type: "send",
    amount: "300.00",
    currency: "ZMW",
    recipient: "Tendai Ncube",
    date: "2023-05-15T09:45:00",
    status: "completed",
  },
  {
    id: "tx4",
    type: "send",
    amount: "1,200.00",
    currency: "ZMW",
    recipient: "Chipo Mulenga",
    date: "2023-05-12T14:20:00",
    status: "completed",
  },
  {
    id: "tx5",
    type: "receive",
    amount: "450.00",
    currency: "ZMW",
    sender: "John Phiri",
    date: "2023-05-10T11:10:00",
    status: "completed",
  },
  {
    id: "tx6",
    type: "send",
    amount: "800.00",
    currency: "ZMW",
    recipient: "Grace Moyo",
    date: "2023-05-05T16:30:00",
    status: "completed",
  },
  {
    id: "tx7",
    type: "receive",
    amount: "350.00",
    currency: "ZMW",
    sender: "David Banda",
    date: "2023-05-03T09:20:00",
    status: "completed",
  },
  {
    id: "tx8",
    type: "send",
    amount: "600.00",
    currency: "ZMW",
    recipient: "Tendai Ncube",
    date: "2023-04-28T13:45:00",
    status: "completed",
  },
  {
    id: "tx9",
    type: "receive",
    amount: "900.00",
    currency: "ZMW",
    sender: "Chipo Mulenga",
    date: "2023-04-25T10:15:00",
    status: "completed",
  },
  {
    id: "tx10",
    type: "send",
    amount: "250.00",
    currency: "ZMW",
    recipient: "John Phiri",
    date: "2023-04-20T14:50:00",
    status: "completed",
  },
]

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by search query
    const searchMatch =
      transaction.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.includes(searchQuery)

    // Filter by date range
    let dateMatch = true
    if (dateRange.from || dateRange.to) {
      const txDate = new Date(transaction.date)
      if (dateRange.from && dateRange.to) {
        dateMatch = txDate >= dateRange.from && txDate <= dateRange.to
      } else if (dateRange.from) {
        dateMatch = txDate >= dateRange.from
      } else if (dateRange.to) {
        dateMatch = txDate <= dateRange.to
      }
    }

    // Filter by status
    const statusMatch = statusFilter === "all" || transaction.status === statusFilter

    // Filter by type (handled by Tabs)
    return searchMatch && dateMatch && statusMatch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/customer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Transactions
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View and filter your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd")
                          )
                        ) : (
                          "Date Range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                  <TabsTrigger value="received">Received</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4 space-y-4">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-3 sm:gap-0"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`rounded-full p-2 ${
                              transaction.type === "send" ? "bg-red-100" : "bg-green-100"
                            }`}
                          >
                            {transaction.type === "send" ? (
                              <ArrowUp className="h-5 w-5 text-red-600" />
                            ) : (
                              <ArrowDown className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {transaction.type === "send"
                                ? `To: ${transaction.recipient}`
                                : `From: ${transaction.sender}`}
                            </div>
                            <div className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-right ml-auto">
                          <div
                            className={`font-medium ${transaction.type === "send" ? "text-red-600" : "text-green-600"}`}
                          >
                            {transaction.type === "send" ? "-" : "+"}
                            {transaction.amount} {transaction.currency}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="mb-2 h-12 w-12 text-gray-300" />
                      <h3 className="text-lg font-medium">No transactions found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sent" className="mt-4 space-y-4">
                  {filteredTransactions.filter((t) => t.type === "send").length > 0 ? (
                    filteredTransactions
                      .filter((t) => t.type === "send")
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-3 sm:gap-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="rounded-full bg-red-100 p-2">
                              <ArrowUp className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium">To: {transaction.recipient}</div>
                              <div className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-right ml-auto">
                            <div className="font-medium text-red-600">
                              -{transaction.amount} {transaction.currency}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="mb-2 h-12 w-12 text-gray-300" />
                      <h3 className="text-lg font-medium">No sent transactions found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="received" className="mt-4 space-y-4">
                  {filteredTransactions.filter((t) => t.type === "receive").length > 0 ? (
                    filteredTransactions
                      .filter((t) => t.type === "receive")
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-3 sm:gap-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-2">
                              <ArrowDown className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">From: {transaction.sender}</div>
                              <div className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-right ml-auto">
                            <div className="font-medium text-green-600">
                              +{transaction.amount} {transaction.currency}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="mb-2 h-12 w-12 text-gray-300" />
                      <h3 className="text-lg font-medium">No received transactions found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
