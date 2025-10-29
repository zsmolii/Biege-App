import { createClient } from "@/lib/supabase/client"

const REGISTRATION_CODE = "Schlosser"

export async function register(
  name: string,
  email: string,
  password: string,
  registrationCode: string,
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Register attempt:", { name, email, registrationCode })

  if (registrationCode !== REGISTRATION_CODE) {
    console.log("[v0] Invalid registration code")
    return { success: false, error: "Ungültiger Registrierungscode" }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    console.log("[v0] Registration error:", error)
    return { success: false, error: error.message }
  }

  console.log("[v0] Registration successful")
  return { success: true }
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Convert username to lowercase and create email
  const email = `${username.toLowerCase()}@bending-app.local`
  console.log("[v0] Login attempt with email:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("[v0] Login error:", error)
    return { success: false, error: "Ungültige Anmeldedaten" }
  }

  console.log("[v0] Login successful")
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
  return user?.user_metadata?.name || user?.email?.split("@")[0] || "User"
}
