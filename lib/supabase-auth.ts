import { createClient } from "@/lib/supabase/client"

const REGISTRATION_CODE = "Schlosser"

export async function register(
  username: string,
  password: string,
  registrationCode: string,
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Register attempt:", { username, registrationCode })

  if (registrationCode !== REGISTRATION_CODE) {
    console.log("[v0] Registration failed: Invalid code")
    return { success: false, error: "Ungültiger Registrierungscode" }
  }

  const supabase = createClient()
  const email = `${username}@bending-app.local`

  console.log("[v0] Registering with email:", email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    console.log("[v0] Registration error:", error)
    return { success: false, error: error.message }
  }

  console.log("[v0] Registration successful:", data)
  return { success: true }
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const email = `${username}@bending-app.local`

  console.log("[v0] Login attempt:", { username, email })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("[v0] Login error:", error)
    return { success: false, error: "Ungültige Anmeldedaten" }
  }

  console.log("[v0] Login successful:", data)
  return { success: true }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

export function getUsername(user: any): string {
  return user?.user_metadata?.username || user?.email?.split("@")[0] || "User"
}
