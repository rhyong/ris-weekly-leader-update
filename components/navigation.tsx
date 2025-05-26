"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  // Use a state variable to track client-side rendering
  const [isClient, setIsClient] = useState(false)
  
  // Track local authentication state
  const [localAuth, setLocalAuth] = useState<{userId?: string; name?: string} | null>(null)
  
  // Set isClient to true after first render and check localStorage
  useEffect(() => {
    setIsClient(true)
    
    // Check localStorage for user data as fallback
    const storedUserData = localStorage.getItem('user_data')
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData)
        if (userData && userData.id) {
          console.log("Navigation: Found user in localStorage")
          setLocalAuth(userData)
        }
      } catch (e) {
        console.error("Navigation: Error parsing user data from localStorage", e)
      }
    }
  }, [])
  
  // Return null for login and help pages
  if (pathname === "/login" || pathname === "/help") return null
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-10">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Weekly Leadership Update</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/update/add"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/update/add" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              Add Weekly Update
            </Link>
            <Link
              href="/history"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/history" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              View Weekly Updates History
            </Link>
          </div>
          
          {/* User section - only show on client after hydration */}
          {isClient ? (
            <>
              {user || localAuth ? (
                <div className="flex items-center gap-4 logged-in-indicator">
                  <span className="text-sm text-muted-foreground">
                    Logged in as{" "}
                    <Link 
                      href="/profile" 
                      className="font-medium text-foreground hover:underline"
                    >
                      {user?.name || localAuth?.name || "User"}
                    </Link>
                  </span>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      My Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="default" size="sm">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            // Empty div with same structure for hydration
            <div className="flex items-center gap-4"></div>
          )}
        </nav>
      </div>
    </header>
  )
}