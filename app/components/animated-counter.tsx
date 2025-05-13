"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  endValue: number
  duration?: number
  title?: string
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  endValue,
  duration = 2000,
  title,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  // Easing function for smooth animation
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }

  useEffect(() => {
    // Reset animation when endValue changes
    countRef.current = 0
    startTimeRef.current = null
    setCount(0)

    if (endValue <= 0) return

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)

      countRef.current = Math.floor(easedProgress * endValue)
      setCount(countRef.current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [endValue, duration])

  const formattedCount = new Intl.NumberFormat().format(count)

  return (
    <div className={cn("text-center", className)}>
      <div className="text-4xl font-bold text-gray-900" aria-live="polite" aria-atomic="true">
        {prefix}
        {formattedCount}
        {suffix}
      </div>
      {title && <h3 className="text-lg font-medium text-gray-700 mt-2">{title}</h3>}
    </div>
  )
}
