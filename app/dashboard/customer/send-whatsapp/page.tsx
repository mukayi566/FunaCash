"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, RefreshCw, ArrowRight, PhoneIcon as WhatsappIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { fetchExchangeRate, convertAmount } from "@/app/actions/exchange-actions"
import { useToast } from "@/hooks/use-toast"

export default function SendWhatsAppPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [isLoadingRate, setIsLoadingRate] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Form state
  const [amount, setAmount] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [note, setNote] = useState("")

  // Calculated amount in ZMW
  const [convertedAmount, setConvertedAmount] = useState<string>("0.00")

  // Fetch exchange rate on component mount
  useEffect(() => {
    getExchangeRate()
  }, [])

  // Update converted amount when amount or exchange rate changes
  useEffect(() => {
    const updateConvertedAmount = async () => {
      if (exchangeRate && amount) {
        const numericAmount = Number.parseFloat(amount)
        if (!isNaN(numericAmount)) {
          // Await the convertAmount function since it's now async
          const converted = await convertAmount(numericAmount, exchangeRate)
          setConvertedAmount(converted.toFixed(2))
        }
      }
    }

    updateConvertedAmount()
  }, [amount, exchangeRate])

  const getExchangeRate = async () => {
    setIsLoadingRate(true)
    try {
      const result = await fetchExchangeRate()
      if (result.success) {
        setExchangeRate(Number.parseFloat(result.rate))
        setLastUpdated(result.lastUpdated)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exchange rate",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRate(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!exchangeRate) {
      toast({
        title: "Error",
        description: "Exchange rate is not available. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Generate a transaction ID
    const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Format the message for WhatsApp
    const message = encodeURIComponent(
      `*Funacash Money Transfer*\n\n` +
        `Transaction ID: ${transactionId}\n` +
        `Amount: ${amount} ZWL → ${convertedAmount} ZMW\n` +
        `Recipient: ${recipientName}\n` +
        `Phone: ${recipientPhone}\n` +
        (note ? `Note: ${note}\n` : "") +
        `\nExchange Rate: 1 ZWL = ${exchangeRate?.toFixed(4)} ZMW\n` +
        `Date: ${new Date().toLocaleString()}`,
    )

    // The WhatsApp number to send to
    const whatsappNumber = "+447860088593" // Replace with your actual WhatsApp business number

    // Simulate a delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800))

    setIsLoading(false)

    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/${whatsappNumber.replace(/\s+/g, "")}?text=${message}`, "_blank")

    // Show success toast
    toast({
      title: "WhatsApp opened",
      description: "Complete your transaction in the WhatsApp chat",
    })

    // Reset form
    setAmount("")
    setRecipientName("")
    setRecipientPhone("")
    setNote("")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-md">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/customer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Send Money via WhatsApp</CardTitle>
            <CardDescription>Transfer money from Zimbabwe (ZWL) to Zambia (ZMW) quickly and securely</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Exchange Rate Information */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className={`h-4 w-4 text-blue-600 ${isLoadingRate ? "animate-spin" : ""}`} />
                      <span className="text-sm font-medium">Exchange Rate</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={getExchangeRate}
                      disabled={isLoadingRate}
                    >
                      Refresh
                    </Button>
                  </div>

                  {exchangeRate ? (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-center text-lg font-bold text-blue-700">
                        1 ZWL = {exchangeRate.toFixed(4)} ZMW
                      </div>
                      <div className="text-xs text-center text-gray-500">
                        Last updated: {formatDate(lastUpdated || "")}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center py-2">
                      <div className="animate-pulse h-6 w-32 bg-blue-200 rounded"></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount">Amount (ZWL)</Label>
                  <span className="text-xs text-gray-500">Zimbabwe Dollar</span>
                </div>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">ZWL</div>
                </div>
              </div>

              {/* Converted Amount Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Recipient Gets (ZMW)</Label>
                  <span className="text-xs text-gray-500">Zambian Kwacha</span>
                </div>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Input value={convertedAmount} readOnly className="bg-gray-50" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">ZMW</div>
                  </div>
                  <div className="mx-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100">
                    <WhatsappIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Recipient Information */}
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  placeholder="Enter recipient's full name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Recipient Phone Number</Label>
                <Input
                  id="recipientPhone"
                  placeholder="e.g. +260 97 123 4567"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Enter the Zambian phone number with country code (+260)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add a message to the recipient"
                  className="resize-none"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Alert className="bg-green-50 border-green-200">
                <WhatsappIcon className="h-4 w-4 text-green-600" />
                <AlertTitle>WhatsApp Payment</AlertTitle>
                <AlertDescription className="text-xs">
                  After clicking "Send via WhatsApp", you&apos;ll be redirected to WhatsApp with a pre-filled message.
                  Complete the transaction by sending the message to our official number.
                </AlertDescription>
              </Alert>

              <CardFooter className="flex flex-col gap-2 px-0">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-700"
                  disabled={isLoading || !exchangeRate || !amount || !recipientName || !recipientPhone}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <WhatsappIcon className="mr-2 h-4 w-4" />
                      Send via WhatsApp
                    </>
                  )}
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard/customer">Cancel</Link>
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
