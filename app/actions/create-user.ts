"use server"

import { createClient } from "@supabase/supabase-js"

export async function createUserInDatabase(userId: string, email: string, username: string) {
  try {
    console.log("[v0] Creating user in database:", { userId, email, username })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error: usersError } = await supabase.from("users").insert({
      id: userId,
      email: email,
      is_admin: email === "zsmolii@icloud.com",
      is_active: true,
    })

    if (usersError) {
      console.error("[v0] Error inserting into users table:", usersError)
      throw new Error(`Fehler beim Speichern in users Tabelle: ${usersError.message}`)
    }

    const { error: appUsersError } = await supabase.from("app_users").insert({
      id: userId,
      username: username,
    })

    if (appUsersError) {
      console.error("[v0] Error inserting into app_users table:", appUsersError)
      throw new Error(`Fehler beim Speichern in app_users Tabelle: ${appUsersError.message}`)
    }

    console.log("[v0] User created successfully in database")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error in createUserInDatabase:", error)
    return { success: false, error: error.message }
  }
}
