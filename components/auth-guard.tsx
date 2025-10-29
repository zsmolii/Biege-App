"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { isAuthenticated, initializeAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    initializeAuth()
    const isAuth = isAuthenticated()
    setAuthenticated(isAuth)
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!authenticated) {
    return <LoginForm onLoginSuccess={() => setAuthenticated(true)} />
  }

  return <>{children}</>
}
