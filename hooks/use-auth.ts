"use client"

import { useState, useEffect } from "react"
import { firebaseAuth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

interface AuthHook {
  user: User | null
  loading: boolean
}

export const useAuth = (): AuthHook => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
