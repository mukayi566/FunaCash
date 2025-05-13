"use client"

import { useState, useEffect } from "react"
import { Share2, Copy, Check, RefreshCw, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateUserReferralCode, getUserReferralStats, getCurrentUserReferrals } from "@/app/actions/referral-actions"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface ReferralStats {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalRewardsEarned: number
  rewardsPaid: number
  rewardsPending: number
}

interface Referral {
  id?: string
  referredId: string
  status: "pending" | "completed"
  rewardAmount: number
  rewardPaid: boolean
  createdAt?: any
  completedAt?: any
}

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = async () => {
    setIsLoading(true)
    try {
      // Load referral code, stats, and referrals in parallel
      const [codeResult, statsResult, referralsResult] = await Promise.all([
        generateUserReferralCode(),
        getUserReferralStats(),
        getCurrentUserReferrals(),
      ])

      if (codeResult.success && codeResult.code) {
        setReferralCode(codeResult.code)
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats)
      }

      if (referralsResult.success && referralsResult.referrals) {
        setReferrals(referralsResult.referrals)
      }
    } catch (error) {
      console.error("Error loading referral data:", error)
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateCode = async () => {
    setIsGenerating(true)
    try {
      const result = await generateUserReferralCode()

      if (result.success && result.code) {
        setReferralCode(result.code)
        toast({
          title: "Success",
          description: "Referral code generated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate referral code.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating referral code:", error)
      toast({
        title: "Error",
        description: "Failed to generate referral code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!referralCode) return

    try {
      await navigator.clipboard.writeText(referralCode)
      setIsCopied(true)
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard.",
      })

      setTimeout(() => {
        setIsCopied(false)
      }, 3000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const shareReferral = async () => {
    if (!referralCode) return

    const shareText = `Join me on Funacash and get rewarded! Use my referral code: ${referralCode} when you sign up. https://funacash.com/auth/signup`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Funacash",
          text: shareText,
          url: "https://funacash.com/auth/signup",
        })

        toast({
          title: "Shared!",
          description: "Thanks for sharing Funacash!",
        })
      } catch (error) {
        console.error("Error sharing:", error)
        // Fall back to clipboard
        copyToClipboard()
      }
    } else {
      // Fall back to clipboard
      copyToClipboard()
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const refreshData = () => {
    loadReferralData()
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground">Refer friends and earn rewards when they complete transactions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this code with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {referralCode ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="text-xl font-bold tracking-wider">{referralCode}</div>
                  <Button size="sm" variant="ghost" onClick={copyToClipboard} disabled={isCopied}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy code</span>
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Reward Structure</AlertTitle>
                  <AlertDescription>
                    Earn 5 Kwacha for each of your first 10 successful referrals, then 2.5 Kwacha for each additional
                    referral.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="mb-4 text-center text-muted-foreground">
                  Generate your unique referral code to start earning rewards
                </p>
                <Button onClick={generateCode} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Code"}
                </Button>
              </div>
            )}
          </CardContent>
          {referralCode && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={refreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={shareReferral}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Statistics</CardTitle>
            <CardDescription>Track your referral performance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">Successful Referrals</span>
                    <span className="text-sm font-medium">{stats.successfulReferrals} / 10</span>
                  </div>
                  <Progress value={(stats.successfulReferrals / 10) * 100} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.successfulReferrals < 10
                      ? `${10 - stats.successfulReferrals} more to reach the next tier`
                      : "You've reached the second tier (2.5 Kwacha per referral)"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Referrals</p>
                    <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rewards</p>
                    <p className="text-2xl font-bold">{stats.totalRewardsEarned.toFixed(2)} ZMW</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Rewards</p>
                    <p className="text-2xl font-bold">{stats.rewardsPending.toFixed(2)} ZMW</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No statistics available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Track the status of your referrals</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-16 animate-pulse rounded bg-gray-200"></div>
              <div className="h-16 animate-pulse rounded bg-gray-200"></div>
            </div>
          ) : referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Reward</th>
                    <th className="px-4 py-2 text-left">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b">
                      <td className="px-4 py-2">{formatDate(referral.createdAt)}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            referral.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {referral.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-2">{referral.rewardAmount.toFixed(2)} ZMW</td>
                      <td className="px-4 py-2">
                        {referral.rewardPaid ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">You haven't referred anyone yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Share your referral code with friends to start earning rewards
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
