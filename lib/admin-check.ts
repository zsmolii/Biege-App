import { createClient } from "@/lib/supabase/client"

export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    // Check if user is admin in users table
    const { data: userData, error } = await supabase.from("users").select("is_admin, email").eq("id", user.id).single()

    if (error) {
      console.error("[v0] Admin check error:", error)
      return false
    }

    // Admin email hardcoded as fallback
    const isAdminEmail = user.email === "zsmolii@icloud.com"
    const isAdminInDb = userData?.is_admin === true

    return isAdminEmail || isAdminInDb
  } catch (error) {
    console.error("[v0] Admin check failed:", error)
    return false
  }
}

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.email || null
  } catch (error) {
    console.error("[v0] Get user email failed:", error)
    return null
  }
}
