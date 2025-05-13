"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

export function LoadingTransition() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const handleStart = () => {
      setLoading(true)
      setProgress(0)

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          // Faster at the beginning, slower as it approaches 80%
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : prev < 80 ? 2 : 0.5
          return Math.min(prev + increment, 99)
        })
      }, 100)
    }

    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
      }, 200)
    }

    router.events?.on("routeChangeStart", handleStart)
    router.events?.on("routeChangeComplete", handleComplete)
    router.events?.on("routeChangeError", handleComplete)

    return () => {
      clearInterval(interval)
      router.events?.off("routeChangeStart", handleStart)
      router.events?.off("routeChangeComplete", handleComplete)
      router.events?.off("routeChangeError", handleComplete)
    }
  }, [router])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress value={progress} className="h-1 rounded-none bg-blue-100" indicatorClassName="bg-blue-600" />
    </div>
  )
}
