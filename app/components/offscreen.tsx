"use client"

import type React from "react"

interface OffscreenProps {
  children: React.ReactNode
}

export function Offscreen({ children }: OffscreenProps) {
  return <div className="hidden">{children}</div>
}
