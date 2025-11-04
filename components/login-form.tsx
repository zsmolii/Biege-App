"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail } from "lucide-react"

export function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerCode, setRegisterCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (signInError) {
        throw signInError
      }

      if (!data.user) {
        throw new Error("Anmeldung fehlgeschlagen")
      }

      onLoginSuccess()
    } catch (err: any) {
      setError(err.message || "Ungültige Anmeldedaten")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    setNeedsEmailConfirmation(false)

    try {
      if (registerCode !== "Schlosser") {
        throw new Error("Ungültiger Registrierungscode")
      }

      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            username: registerUsername,
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (!data.user) {
        throw new Error("Registrierung fehlgeschlagen")
      }

      if (data.session) {
        setSuccess("Registrierung erfolgreich! Sie werden angemeldet...")
        setTimeout(() => {
          onLoginSuccess()
        }, 1500)
      } else {
        setNeedsEmailConfirmation(true)
        setConfirmationEmail(registerEmail)
        setSuccess(
          "Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse. Überprüfen Sie auch Ihren Spam-Ordner.",
        )
      }

      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterUsername("")
      setRegisterCode("")
    } catch (err: any) {
      setError(err.message || "Registrierung fehlgeschlagen")
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setError("")
    setSuccess("")
    setResendLoading(true)

    try {
      const supabase = createClient()

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: confirmationEmail,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (resendError) {
        throw resendError
      }

      setSuccess("Bestätigungs-E-Mail wurde erneut gesendet! Bitte überprüfen Sie Ihren Posteingang und Spam-Ordner.")
    } catch (err: any) {
      setError(err.message || "Fehler beim Senden der E-Mail. Bitte versuchen Sie es später erneut.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Biege-Regisseur</CardTitle>
          <CardDescription>Anmelden oder registrieren</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="register">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-Mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ihre@email.de"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Wird geladen..." : "Anmelden"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Benutzername</Label>
                  <Input
                    id="register-username"
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Benutzername"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-Mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="ihre@email.de"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Passwort</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-code">Registrierungscode</Label>
                  <Input
                    id="register-code"
                    type="text"
                    value={registerCode}
                    onChange={(e) => setRegisterCode(e.target.value)}
                    placeholder="Code eingeben"
                    required
                    disabled={loading}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Wird geladen..." : "Registrieren"}
                </Button>
                {needsEmailConfirmation && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {resendLoading ? "Wird gesendet..." : "Bestätigungs-E-Mail erneut senden"}
                  </Button>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
