"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LoginForm } from "@/components/login-form"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setAuthenticated(!!session)
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
      setMounted(true)
    }
  }

  if (!mounted || loading) {
    return null
  }

  if (!authenticated) {
    return <LoginForm onLoginSuccess={() => setAuthenticated(true)} />
  }

  return <>{children}</>
}
