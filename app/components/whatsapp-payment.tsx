"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initiateWhatsAppPayment, verifyTransaction } from "@/app/actions/payment-actions"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface WhatsAppPaymentProps {
  formData?: FormData | Record<string, string> | null
  onBack: () => void
  onComplete: (transactionId: string) => void
}

export function WhatsAppPayment({ formData, onBack, onComplete }: WhatsAppPaymentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [paymentDetails, setPaymentDetails] = useState<{
    transactionId: string
    whatsappNumber: string
    details: {
      amount: string
      recipientName: string
      recipientPhone: string
      currency: string
      note?: string
      status: string
      createdAt: string
    }
  } | null>(null)

  useEffect(() => {
    const initiatePayment = async () => {
      setIsLoading(true)
      try {
        // Create a new FormData with default values if formData is missing
        let paymentFormData = new FormData()

        if (formData) {
          // If formData exists, use it
          if (formData instanceof FormData) {
            paymentFormData = formData
          } else {
            // Convert object to FormData
            try {
              Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                  paymentFormData.append(key, String(value))
                }
              })
            } catch (err) {
              console.error("Error converting data to FormData:", err)
              // Continue with default values
            }
          }
        }

        // Ensure required fields have values
        if (!paymentFormData.get("amount")) paymentFormData.append("amount", "100.00")
        if (!paymentFormData.get("recipientName")) paymentFormData.append("recipientName", "Demo Recipient")
        if (!paymentFormData.get("recipientPhone")) paymentFormData.append("recipientPhone", "+260123456789")
        if (!paymentFormData.get("currency")) paymentFormData.append("currency", "ZMW")

        console.log("Initiating payment with data:", {
          amount: paymentFormData.get("amount"),
          recipientName: paymentFormData.get("recipientName"),
          recipientPhone: paymentFormData.get("recipientPhone"),
          currency: paymentFormData.get("currency"),
          note: paymentFormData.get("note"),
        })

        const result = await initiateWhatsAppPayment(paymentFormData)

        if (result.success) {
          setPaymentDetails(result)
          // Start progress animation
          let currentProgress = 0
          const interval = setInterval(() => {
            currentProgress += 5
            setProgress(currentProgress)
            if (currentProgress >= 100) {
              clearInterval(interval)
            }
          }, 150)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to initiate payment",
            variant: "destructive",
          })
          onBack()
        }
      } catch (error) {
        console.error("Error initiating payment:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
          variant: "destructive",
        })
        onBack()
      } finally {
        setIsLoading(false)
      }
    }

    initiatePayment()
  }, [formData, onBack, toast])

  const handleCopyNumber = () => {
    if (paymentDetails?.whatsappNumber) {
      navigator.clipboard.writeText(paymentDetails.whatsappNumber)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleOpenWhatsApp = () => {
    if (paymentDetails) {
      const { details, whatsappNumber } = paymentDetails
      const message = `Hello, I would like to send ${details.amount} ${details.currency} to ${details.recipientName} (${details.recipientPhone})${details.note ? `. Note: ${details.note}` : ""}.`
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\s+/g, "")}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  const handleVerifyPayment = async () => {
    if (!paymentDetails) return

    setIsVerifying(true)
    try {
      const result = await verifyTransaction(paymentDetails.transactionId)

      if (result.success) {
        toast({
          title: "Payment Verified",
          description: "Your payment has been verified successfully.",
        })
        onComplete(paymentDetails.transactionId)
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      toast({
        title: "Error",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>WhatsApp Payment</CardTitle>
        <CardDescription>Send money via WhatsApp to complete your transaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 text-center text-sm text-gray-500">Preparing your payment...</div>
            <Progress value={progress} className="w-full" />
          </div>
        ) : (
          paymentDetails && (
            <>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Amount:</div>
                  <div className="font-medium">
                    {paymentDetails.details.amount} {paymentDetails.details.currency}
                  </div>
                  <div className="text-gray-500">Recipient:</div>
                  <div className="font-medium">{paymentDetails.details.recipientName}</div>
                  <div className="text-gray-500">Phone:</div>
                  <div className="font-medium">{paymentDetails.details.recipientPhone}</div>
                  {paymentDetails.details.note && (
                    <>
                      <div className="text-gray-500">Note:</div>
                      <div className="font-medium">{paymentDetails.details.note}</div>
                    </>
                  )}
                  <div className="text-gray-500">Transaction ID:</div>
                  <div className="font-medium">{paymentDetails.transactionId}</div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-medium text-blue-700">WhatsApp Instructions</h3>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-blue-700">
                  <li>Click the "Open WhatsApp" button below to start a chat with our payment agent.</li>
                  <li>Send the pre-filled message to initiate the payment.</li>
                  <li>Follow the instructions provided by the agent to complete your payment.</li>
                  <li>Once payment is complete, click "Verify Payment" to confirm your transaction.</li>
                </ol>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3">
                <div className="font-medium">WhatsApp Number:</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{paymentDetails.whatsappNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyNumber}
                    title="Copy number"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading || isVerifying}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleOpenWhatsApp}
            disabled={isLoading || !paymentDetails || isVerifying}
          >
            <Send className="h-4 w-4" />
            Open WhatsApp
          </Button>
          <Button onClick={handleVerifyPayment} disabled={isLoading || !paymentDetails || isVerifying}>
            {isVerifying ? "Verifying..." : "Verify Payment"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
