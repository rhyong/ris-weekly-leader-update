"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "./auth-db"
import { useSession } from "./session-provider"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // We need to prevent hydration mismatch errors
  const [initialRender, setInitialRender] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize user after first render to avoid hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInitialRender(false);
      const savedUser = localStorage.getItem('user_data');
      if (savedUser) {
        try {
          console.log("Initializing user from localStorage");
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse saved user data:", e);
        }
      }
    }
  }, []);
  // Start with loading state true
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { sessionId, setSessionId } = useSession()
  
  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      console.log("Saving user to localStorage");
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      console.log("Clearing user from localStorage");
      localStorage.removeItem('user_data');
    }
  }, [user])

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        console.log("AuthContext: Checking auth status...");
        
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        
        // Try to get session ID from localStorage first if not in context
        const localSessionId = !sessionId && typeof window !== 'undefined' 
          ? localStorage.getItem('session_id')
          : null;
          
        if (localSessionId && !sessionId) {
          console.log(`AuthContext: Found session ID in localStorage: ${localSessionId.substring(0, 8)}...`);
          // Update our session context with the localStorage value
          setSessionId(localSessionId);
        }
        
        // Use sessionId from context, localStorage, or none
        const activeSessionId = sessionId || localSessionId;
        
        // If we have a sessionId, send it as a query param
        const url = activeSessionId 
          ? `/api/auth/me?t=${timestamp}&sid=${activeSessionId}` 
          : `/api/auth/me?t=${timestamp}`;
          
        console.log(`AuthContext: Checking auth with URL: ${url}`);
          
        const response = await fetch(url, {
          // Ensure cookies are sent with the request
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          // Only set the user if this is not a preview user
          if (userData.id !== "preview-user") {
            console.log("AuthContext: User authenticated:", userData.username);
            setUser(userData);
          } else {
            console.log("AuthContext: Preview user not stored");
            setUser(null);
          }
        } else {
          console.log(`AuthContext: Auth check failed: ${response.status}`, 
            activeSessionId ? `with session ID: ${activeSessionId.substring(0, 8)}...` : 'without session ID');
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth()
  }, [sessionId, setSessionId])

  useEffect(() => {
    // Skip if we're still initializing
    if (typeof window === 'undefined') return;
    
    // Only run once the loading state is settled
    if (isLoading) return;
    
    // Debug logging
    console.log("Auth redirect check:", { 
      isLoading, 
      hasUser: !!user, 
      pathname,
      sessionId: sessionId ? sessionId.substring(0, 8) + '...' : 'none',
      hasLocalUser: !!localStorage.getItem('user_data'),
      hasLocalSession: !!localStorage.getItem('session_id')
    });
    
    // If we have a user, no need to redirect
    if (user) return;
    
    // Double-check localStorage as a fallback
    const savedUser = localStorage.getItem('user_data');
    const savedSessionId = localStorage.getItem('session_id');
    
    if (savedUser) {
      console.log("Found user in localStorage, preventing redirect");
      try {
        // Parse and validate the user data
        const parsedUser = JSON.parse(savedUser);
        
        // Log the parsed user to see what's in there
        console.log("Parsed user from localStorage:", parsedUser);
        
        // Make sure it has the minimum required fields
        if (parsedUser && parsedUser.id && parsedUser.name) {
          console.log("Valid user data found in localStorage");
          setUser(parsedUser);
          
          // If we have a session ID in localStorage but not in context, set it
          if (savedSessionId && !sessionId) {
            console.log(`Setting session ID from localStorage: ${savedSessionId.substring(0, 8)}...`);
            setSessionId(savedSessionId);
          }
          
          return;
        } else {
          console.warn("User data in localStorage is incomplete:", parsedUser);
          // Don't set the user if it's incomplete
        }
      } catch (e) {
        console.error("Failed to parse saved user data during redirect check:", e);
      }
    }
    
    // If we have a session ID in localStorage but not in user data, try to verify it
    if (savedSessionId && !user) {
      console.log(`Found session ID in localStorage: ${savedSessionId.substring(0, 8)}... but no user data`);
      
      // Set the session ID in context
      if (!sessionId) {
        console.log("Setting session ID from localStorage");
        setSessionId(savedSessionId);
      }
      
      // We'll let the auth check effect verify this session
      return;
    }
    
    // Re-enable automatic redirects
    // Excluded pages: /login (authentication page) and /help (public help page)
    if (pathname !== "/login" && pathname !== "/help") {
      console.log("Redirecting to login from:", pathname);
      router.push("/login");
    }
  }, [user, isLoading, pathname, router, sessionId, setSessionId])

  const login = async (username: string, password: string) => {
    try {
      console.log(`Attempting to log in with username: ${username}`)
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log(`Login response status: ${response.status}`)
      
      if (response.ok) {
        const userData = await response.json()
        console.log(`Login successful, user data received:`, userData)
        
        // Extract session ID from response
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          console.log(`Set-Cookie header:`, setCookieHeader);
          const sessionIdMatch = setCookieHeader.match(/session_id=([^;]+)/);
          if (sessionIdMatch && sessionIdMatch[1]) {
            console.log(`Extracted session ID from response headers: ${sessionIdMatch[1].substring(0, 8)}...`);
            setSessionId(sessionIdMatch[1]);
          } else {
            console.log(`Could not extract session_id from cookie header`);
          }
        } else {
          console.log(`No Set-Cookie header found in response`);
        }
        
        // Also check for session ID in response body
        if (userData.sessionId) {
          console.log(`Found session ID in response body: ${userData.sessionId.substring(0, 8)}...`);
          setSessionId(userData.sessionId);
        } else {
          console.log(`No sessionId found in response body`);
        }
        
        // Save user data directly to ensure it's available
        console.log(`Setting user data in auth context:`, userData);
        
        // Make sure we're saving a properly formatted user object
        const userToSave = {
          id: userData.id,
          name: userData.name || "User",
          username: userData.username || "user",
          role: userData.role || "User",
          email: userData.email || ""
        };
        
        setUser(userToSave);
        
        // Force browser to prevent race condition
        localStorage.setItem('user_data', JSON.stringify(userToSave));
        
        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`Login complete, user state:`, { 
          userSet: !!userData,
          sessionIdSet: !!userData.sessionId
        });
        
        return true
      }
      
      // Try to get the error message
      try {
        const errorData = await response.json()
        console.error(`Login failed: ${JSON.stringify(errorData)}`)
      } catch (e) {
        console.error(`Login failed with status ${response.status}`)
      }
      
      // Login failed, return false
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      console.log("Logging out...");
      await fetch("/api/auth/logout", { method: "POST" })
      
      // Clear user data
      setUser(null)
      
      // Clear session ID
      setSessionId(null)
      
      // Manually clear localStorage
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_id');
      
      console.log("Logout complete, redirecting to login page");
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      
      // Clear user data even on error
      setUser(null)
      setSessionId(null)
      
      // Manually clear localStorage
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_id');
      
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
