"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/app/actions/auth-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw, Clock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errorCode, setErrorCode] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [remainingAttempts, setRemainingAttempts] = useState(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [nextRetryAt, setNextRetryAt] = useState(null)
  const maxRetries = 3

  // Countdown timer for rate limiting
  useEffect(() => {
    let interval = null

    if (retryAfter && retryAfter > 0) {
      interval = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev && prev > 1000) {
            return prev - 1000
          } else {
            setIsRateLimited(false)
            return null
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [retryAfter])

  // Retry countdown timer
  useEffect(() => {
    let interval = null

    if (nextRetryAt && nextRetryAt > Date.now()) {
      interval = setInterval(() => {
        if (nextRetryAt && Date.now() >= nextRetryAt) {
          setNextRetryAt(null)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [nextRetryAt])

  const calculateRetryDelay = (attemptCount) => {
    return Math.min(Math.pow(2, attemptCount) * 1000, 30000)
  }

  const canRetry = () => {
    return retryCount < maxRetries && (!nextRetryAt || Date.now() >= nextRetryAt) && !isRateLimited
  }

  const handleRetry = () => {
    if (!canRetry()) return

    setError(null)
    setErrorCode(null)

    if (errorCode === "invalid_credentials") {
      setPassword("")
    }
  }

  async function handleSubmit(formData) {
    setIsLoading(true)
    setError(null)
    setErrorCode(null)

    const usernameValue = formData.get("username")
    const passwordValue = formData.get("password")

    if (!usernameValue || !passwordValue) {
      setError("Username and password are required")
      setErrorCode("missing_credentials")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn(formData)

      if (result?.error) {
        setError(result.error)
        setErrorCode(result.errorCode || "unknown_error")
        setRemainingAttempts(result.remainingAttempts || null)

        if (result.rateLimited) {
          setIsRateLimited(true)
          setRetryAfter(result.retryAfter || null)
        } else {
          const newRetryCount = retryCount + 1
          const retryDelay = calculateRetryDelay(newRetryCount)

          setRetryCount(newRetryCount)
          setNextRetryAt(Date.now() + retryDelay)
        }

        setIsLoading(false)
      } else if (result?.success && result?.redirectTo) {
        setRetryCount(0)
        setNextRetryAt(null)
        router.push(result.redirectTo)
      } else {
        setError("An unexpected error occurred. Please try again.")
        setErrorCode("unexpected_error")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("A network error occurred. Please check your connection and try again.")
      setErrorCode("network_error")
      setIsLoading(false)
    }
  }

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)

    if (minutes > 0) {
      return minutes + "m " + seconds + "s"
    }
    return seconds + "s"
  }

  const getRetryCountdown = () => {
    if (!nextRetryAt) return ""
    const remaining = Math.max(0, nextRetryAt - Date.now())
    return formatTime(remaining)
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setUsername("democustomer")
      setPassword("password123")
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
          </div>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex flex-col space-y-2">
                  <span>{error}</span>

                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <span className="text-sm">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining
                    </span>
                  )}

                  {isRateLimited && retryAfter && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>Try again in {formatTime(retryAfter)}</span>
                    </div>
                  )}

                  {!isRateLimited && canRetry() && nextRetryAt && Date.now() < nextRetryAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>Next retry in {getRetryCountdown()}</span>
                    </div>
                  )}

                  {!isRateLimited && canRetry() && (!nextRetryAt || Date.now() >= nextRetryAt) && (
                    <Button type="button" variant="outline" size="sm" onClick={handleRetry} className="w-fit">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try Again ({maxRetries - retryCount} left)
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading || isRateLimited}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading || isRateLimited}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isRateLimited || (nextRetryAt !== null && Date.now() < nextRetryAt)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : isRateLimited ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Rate Limited
                </>
              ) : nextRetryAt && Date.now() < nextRetryAt ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Wait {getRetryCountdown()}
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            <span className="text-muted-foreground">Do not have an account? </span>
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
