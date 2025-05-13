"use client"

import { useState, useEffect } from "react"
import { RefreshCw, ArrowDown } from 'lucide-react'
import { getUserBalance } from "@/app/actions/balance-actions"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function CustomerBalanceCard({ userId }: { userId?: string }) {
 const [balance, setBalance] = useState<number | null>(null)
 const [currency, setCurrency] = useState("ZMW")
 const [isLoading, setIsLoading] = useState(true)
 const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
 const [error, setError] = useState<string | null>(null)

 // Get userId from cookies if not provided
 useEffect(() => {
   if (!userId) {
     // In a real app, you'd get this from a context or cookie
     const storedUserId = document.cookie
       .split("; ")
       .find((row) => row.startsWith("user_id="))
       ?.split("=")[1]

     if (storedUserId) {
       userId = storedUserId
     }
   }

   fetchBalance()
 }, [userId])

 const fetchBalance = async () => {
   if (!userId) {
     setError("User ID not found")
     setIsLoading(false)
     return
   }

   try {
     setIsLoading(true)
     setError(null)

     const result = await getUserBalance(userId)

     if (result.success) {
       setBalance(result.balance)
       setCurrency(result.currency)
       setLastUpdated(new Date())
     } else {
       setError(result.message || "Failed to fetch balance")
       setBalance(0) // Set default balance to 0
     }
   } catch (error) {
     console.error("Error fetching user balance:", error)
     setError("An error occurred while fetching your balance")
     setBalance(0) // Set default balance to 0
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

 // Calculate monthly usage (for demo purposes)
 const monthlyLimit = 5000
 const currentUsage = balance ? Math.min(monthlyLimit - balance, monthlyLimit) : 0
 const usagePercentage = (currentUsage / monthlyLimit) * 100

 return (
   <Card>
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
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

           <div className="mt-4">
             <div className="flex items-center justify-between text-xs">
               <span>Monthly Limit</span>
               <span>
                 {formatCurrency(currentUsage)} / {formatCurrency(monthlyLimit)} {currency}
               </span>
             </div>
             <Progress value={usagePercentage} className="mt-1 h-2" />
           </div>

           <div className="mt-4">
             <Button
               variant="outline"
               size="sm"
               className="h-8 w-full text-xs gap-1"
               onClick={() => window.open("https://wa.me/+447860088593?text=balance", "_blank")}
             >
               <ArrowDown className="h-3 w-3 text-green-600" />
               Check via WhatsApp
             </Button>
           </div>
         </>
       )}
     </CardContent>
   </Card>
 )
}
