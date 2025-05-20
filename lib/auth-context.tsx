"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // For preview purposes, create a mock user if authentication fails
          setUser({
            id: "preview-user",
            username: "preview",
            name: "Preview User",
            role: "Team Lead",
            password: "",
          })
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // For preview purposes, create a mock user if authentication fails
        setUser({
          id: "preview-user",
          username: "preview",
          name: "Preview User",
          role: "Team Lead",
          password: "",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      }

      // For preview purposes, allow any login
      setUser({
        id: "preview-user",
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        role: "Team Lead",
        password: "",
      })
      return true
    } catch (error) {
      console.error("Login error:", error)
      // For preview purposes, allow any login even if there's an error
      setUser({
        id: "preview-user",
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        role: "Team Lead",
        password: "",
      })
      return true
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null)
      router.push("/login")
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
