export interface User {
  id: string
  username: string
  password: string
  createdAt: string
}

const STORAGE_KEYS = {
  USERS: "bending_users",
  CURRENT_USER: "bending_current_user",
}

const REGISTRATION_CODE = "Schlosser"

// Initialize with default user
export function initializeAuth(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUser: User = {
      id: "1",
      username: "ZSmolii",
      password: "Admin",
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultUser]))
  }
}

export function register(
  username: string,
  password: string,
  registrationCode: string,
): { success: boolean; error?: string } {
  if (registrationCode !== REGISTRATION_CODE) {
    return { success: false, error: "Ungültiger Registrierungscode" }
  }

  const users = getAllUsers()

  if (users.find((u) => u.username === username)) {
    return { success: false, error: "Benutzername bereits vergeben" }
  }

  const newUser: User = {
    id: Date.now().toString(),
    username,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

  return { success: true }
}

export function login(username: string, password: string): { success: boolean; error?: string } {
  const users = getAllUsers()
  const user = users.find((u) => u.username === username && u.password === password)

  if (!user) {
    return { success: false, error: "Ungültige Anmeldedaten" }
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  return { success: true }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

function getAllUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}
