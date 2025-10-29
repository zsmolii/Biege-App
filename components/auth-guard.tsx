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
      console.log("[v0] Checking auth...")
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("[v0] Session:", session ? "exists" : "none")
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <LoginForm onLoginSuccess={() => setAuthenticated(true)} />
  }

  return <>{children}</>
}
