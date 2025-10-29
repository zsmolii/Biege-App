import * as auth from "./auth"

export interface User {
  id: string
  username: string
  email?: string
}

// Initialize auth on import
if (typeof window !== "undefined") {
  auth.initializeAuth()
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Extract username from email (before @)
  const username = email.split("@")[0]
  return auth.login(username, password)
}

export async function register(
  name: string,
  email: string,
  password: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  // Extract username from email (before @)
  const username = email.split("@")[0]
  return auth.register(username, password, code)
}

export async function logout(): Promise<void> {
  auth.logout()
}

export async function getCurrentUser(): Promise<User | null> {
  const user = auth.getCurrentUser()
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: `${user.username}@bending-app.local`,
  }
}

export function getUsername(user: User): string {
  return user.username
}

export async function isAuthenticated(): Promise<boolean> {
  return auth.isAuthenticated()
}
