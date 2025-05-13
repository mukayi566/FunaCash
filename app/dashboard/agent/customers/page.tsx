"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample customers data
const customers = [
  {
    id: "c1",
    name: "Grace Moyo",
    email: "grace.moyo@example.com",
    phone: "+263 71 234 5678",
    country: "Zimbabwe",
    status: "active",
    transactions: 12,
    lastTransaction: "2023-05-20T10:30:00",
    totalVolume: "5,600.00",
  },
  {
    id: "c2",
    name: "David Banda",
    email: "david.banda@example.com",
    phone: "+260 97 876 5432",
    country: "Zambia",
    status: "active",
    transactions: 8,
    lastTransaction: "2023-05-19T15:15:00",
    totalVolume: "3,200.00",
  },
  {
    id: "c3",
    name: "Tendai Ncube",
    email: "tendai.ncube@example.com",
    phone: "+263 77 876 5432",
    country: "Zimbabwe",
    status: "active",
    transactions: 5,
    lastTransaction: "2023-05-15T09:45:00",
    totalVolume: "1,800.00",
  },
  {
    id: "c4",
    name: "Chipo Mulenga",
    email: "chipo.mulenga@example.com",
    phone: "+260 96 345 6789",
    country: "Zambia",
    status: "inactive",
    transactions: 3,
    lastTransaction: "2023-04-25T10:15:00",
    totalVolume: "2,700.00",
  },
  {
    id: "c5",
    name: "John Phiri",
    email: "john.phiri@example.com",
    phone: "+260 95 123 4567",
    country: "Zambia",
    status: "active",
    transactions: 7,
    lastTransaction: "2023-05-10T11:10:00",
    totalVolume: "4,100.00",
  },
  {
    id: "c6",
    name: "Grace Ncube",
    email: "grace.ncube@example.com",
    phone: "+263 73 456 7890",
    country: "Zimbabwe",
    status: "active",
    transactions: 4,
    lastTransaction: "2023-05-12T14:20:00",
    totalVolume: "1,500.00",
  },
  {
    id: "c7",
    name: "Tafadzwa Moyo",
    email: "tafadzwa.moyo@example.com",
    phone: "+263 71 987 6543",
    country: "Zimbabwe",
    status: "inactive",
    transactions: 2,
    lastTransaction: "2023-03-15T08:30:00",
    totalVolume: "900.00",
  },
  {
    id: "c8",
    name: "Mutale Banda",
    email: "mutale.banda@example.com",
    phone: "+260 97 234 5678",
    country: "Zambia",
    status: "active",
    transactions: 6,
    lastTransaction: "2023-05-05T16:30:00",
    totalVolume: "2,200.00",
  },
]

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/agent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Customers
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-700" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Manage your customer database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Country</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead className="hidden md:table-cell">Last Transaction</TableHead>
                      <TableHead>Total Volume</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`/placeholder.svg?height=32&width=32&text=${customer.name.charAt(0)}`}
                                  alt={customer.name}
                                />
                                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-xs text-gray-500">{customer.phone}</div>
                                <div className="text-xs text-gray-500 md:hidden">{customer.country}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{customer.country}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={customer.status === "active" ? "success" : "secondary"}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.transactions}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(customer.lastTransaction).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{customer.totalVolume} ZMW</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/agent/customers/${customer.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
