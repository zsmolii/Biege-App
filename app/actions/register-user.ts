"use server"

import { createClient } from "@/lib/supabase/server"

export async function registerUserInDatabase(userId: string, email: string, username: string) {
  try {
    console.log("[v0] Server Action: Registering user in database:", { userId, email, username })

    const supabase = await createClient()

    // Check if user is admin
    const isAdmin = email === "zsmolii@icloud.com"

    // Insert into users table
    const { error: usersError } = await supabase.from("users").insert({
      id: userId,
      email: email,
      is_admin: isAdmin,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (usersError) {
      console.error("[v0] Server Action: Error saving to users table:", usersError)
      throw new Error(`Database error saving new user: ${usersError.message}`)
    }

    // Insert into app_users table
    const { error: appUsersError } = await supabase.from("app_users").insert({
      id: userId,
      username: username,
      created_at: new Date().toISOString(),
    })

    if (appUsersError) {
      console.error("[v0] Server Action: Error saving to app_users table:", appUsersError)
      throw new Error(`Database error saving user profile: ${appUsersError.message}`)
    }

    console.log("[v0] Server Action: User saved to database successfully!")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Server Action: Error:", error)
    return { success: false, error: error.message }
  }
}
