"use client"

import { useState } from "react"
import { ArrowDown, Check, Copy, PhoneIcon as WhatsappIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createWithdrawalRequest, verifyWithdrawal } from "@/app/actions/balance-actions"
import { useToast } from "@/hooks/use-toast"

export function WhatsAppWithdrawal() {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [withdrawalDetails, setWithdrawalDetails] = useState(null)
  const [copied, setCopied] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setFormErrors({})

    const formData = new FormData(e.currentTarget)
    const amount = Number.parseFloat(formData.get("amount"))

    if (!amount || amount <= 0) {
      setFormErrors({ amount: "Please enter a valid amount" })
      setIsLoading(false)
      return
    }

    const result = await createWithdrawalRequest({
      userId: "user1", // In a real app, this would come from auth context
      amount,
      phoneNumber: "+447860088593", // This would be the user's phone number
      notes: formData.get("note") || "Requested via app",
    })

    setIsLoading(false)

    if (result.success) {
      setWithdrawalDetails(result)
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal request has been submitted",
      })
    } else {
      if (result.message === "Insufficient balance") {
        setFormErrors({ amount: "Insufficient balance for this withdrawal" })
      }

      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWhatsApp = () => {
    if (!withdrawalDetails) return

    const message = encodeURIComponent(`withdraw ${withdrawalDetails.amount}`)

    window.open(`https://wa.me/+447860088593?text=${message}`, "_blank")
  }

  const handleVerifyWithdrawal = async () => {
    if (!withdrawalDetails) return

    setVerificationLoading(true)
    const result = await verifyWithdrawal(withdrawalDetails.requestId)
    setVerificationLoading(false)

    if (result.success) {
      toast({
        title: "Withdrawal verified",
        description: "Your withdrawal has been processed successfully",
      })
      setIsOpen(false)
      router.refresh()
    } else {
      toast({
        title: "Verification failed",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setWithdrawalDetails(null)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <ArrowDown className="h-4 w-4 text-green-600" />
          Withdraw via WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{withdrawalDetails ? "Complete WhatsApp Withdrawal" : "Withdraw via WhatsApp"}</DialogTitle>
          <DialogDescription>
            {withdrawalDetails
              ? "Follow the instructions to complete your withdrawal"
              : "Withdraw money quickly and securely using our WhatsApp service"}
          </DialogDescription>
        </DialogHeader>

        {!withdrawalDetails ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount</Label>
                <span className="text-xs text-gray-500">Available: 2,500 ZMW</span>
              </div>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                className={formErrors.amount ? "border-red-500" : ""}
              />
              {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input id="note" name="note" placeholder="Add a note for this withdrawal" />
            </div>

            <div className="rounded-md bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <WhatsappIcon className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium">WhatsApp Withdrawal Process</p>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                After clicking "Continue", you'll be directed to message our official WhatsApp number to complete the
                withdrawal.
              </p>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-700" disabled={isLoading}>
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle>Withdrawal Initiated</AlertTitle>
              <AlertDescription>
                Your withdrawal request has been submitted. Complete the process via WhatsApp.
              </AlertDescription>
            </Alert>

            <div className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Request ID</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{withdrawalDetails.requestId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(withdrawalDetails.requestId)}
                  >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="font-medium">
                  {withdrawalDetails.amount} {withdrawalDetails.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="font-medium text-yellow-600">Pending</span>
              </div>
              {withdrawalDetails.notes && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Note</span>
                  <span className="font-medium">{withdrawalDetails.notes}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Next Steps:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                    1
                  </span>
                  <span>Click the "Open WhatsApp" button below</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                    2
                  </span>
                  <span>Send the pre-filled message to our official number</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                    3
                  </span>
                  <span>Follow the instructions provided by our WhatsApp assistant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                    4
                  </span>
                  <span>Return here and click "Verify Withdrawal" when complete</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" className="gap-2" onClick={openWhatsApp}>
                <WhatsappIcon className="h-4 w-4 text-green-600" />
                Open WhatsApp
              </Button>

              <Button
                className="bg-gradient-to-r from-green-500 to-green-700"
                onClick={handleVerifyWithdrawal}
                disabled={verificationLoading}
              >
                {verificationLoading ? "Verifying..." : "Verify Withdrawal"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
