"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowDown, Check, X } from "lucide-react"
import { getAgentWithdrawalRequests, processWithdrawalRequest } from "@/app/actions/balance-actions"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  userPhone: string
  amount: number
  currency: string
  status: string
  createdAt: any
  notes?: string
}

export function WithdrawalRequests({ agentId }: { agentId?: string }) {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notes, setNotes] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const { toast } = useToast()

  const fetchRequests = useCallback(async () => {
    // Skip fetching if agentId is not available yet
    if (!agentId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await getAgentWithdrawalRequests(agentId)

      if (result.success) {
        setRequests(result.requests)
      } else {
        setError(result.message || "Failed to fetch withdrawal requests")
        // Initialize with empty array instead of demo data
        setRequests([])
      }
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error)
      setError("An error occurred while fetching withdrawal requests")
      // Initialize with empty array instead of demo data
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleProcess = (request: WithdrawalRequest, actionType: "approve" | "reject") => {
    setSelectedRequest(request)
    setAction(actionType)
    setNotes("")
    setIsDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedRequest || !action) return

    try {
      setIsProcessing(true)

      const result = await processWithdrawalRequest(selectedRequest.id, action === "approve", notes || undefined)

      if (result.success) {
        toast({
          title: action === "approve" ? "Withdrawal Approved" : "Withdrawal Rejected",
          description: result.message,
        })

        // Remove the processed request from the list
        setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error)
      toast({
        title: "Error",
        description: "An error occurred while processing the withdrawal",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setIsDialogOpen(false)
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

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchRequests} disabled={isLoading}>
            <ArrowDown className={`h-4 w-4 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh requests</span>
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-red-500 mb-2">{error}</div>
          ) : isLoading ? (
            <div className="space-y-2">
              <div className="h-16 animate-pulse rounded bg-gray-200"></div>
              <div className="h-16 animate-pulse rounded bg-gray-200"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No pending withdrawal requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-xs text-gray-500">{request.userPhone}</div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      {request.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="font-medium">
                      {formatCurrency(request.amount)} {request.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Requested</span>
                    <span className="text-xs">{formatDate(request.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                      onClick={() => handleProcess(request, "reject")}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                      onClick={() => handleProcess(request, "approve")}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}</DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Confirm that you want to approve this withdrawal request."
                : "Please provide a reason for rejecting this withdrawal request."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Customer</span>
                  <span className="font-medium">{selectedRequest.userName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(selectedRequest.amount)} {selectedRequest.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="font-medium">{selectedRequest.userPhone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{action === "approve" ? "Notes (Optional)" : "Reason for Rejection"}</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={action === "approve" ? "Add any notes..." : "Provide a reason..."}
                  required={action === "reject"}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing || (action === "reject" && !notes)}
              className={action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isProcessing ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
