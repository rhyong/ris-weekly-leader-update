"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

// Define the session context type
interface SessionContextType {
  sessionId: string | null
  setSessionId: (id: string | null) => void
  isSessionValid: boolean
}

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined)

// Create a provider component
export function SessionProvider({ children }: { children: ReactNode }) {
  // Initial state must be the same on server and client to avoid hydration issues
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false)
  const [initialRender, setInitialRender] = useState(true)

  // Initialize from localStorage on mount - after first render to avoid hydration issues
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Mark first render as complete
    setInitialRender(false);
    
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem("session_id")
    console.log("SessionProvider: Found session in localStorage:", storedSession ? `${storedSession.substring(0, 8)}...` : "no")
    
    if (storedSession) {
      console.log("SessionProvider: Setting session ID from localStorage");
      setSessionId(storedSession)
      setIsSessionValid(true); // Assume valid initially to prevent flickering
      
      // Verify the session is still valid
      fetch(`/api/debug/session?sid=${storedSession}`)
        .then(res => res.json())
        .then(data => {
          const isValid = !!data.sessionExists;
          setIsSessionValid(isValid);
          console.log("SessionProvider: Session validation result:", isValid);
          
          // If session is invalid, clear it
          if (!isValid) {
            console.log("SessionProvider: Clearing invalid session");
            setSessionId(null);
            localStorage.removeItem("session_id");
          }
        })
        .catch(err => {
          console.error("SessionProvider: Failed to validate session:", err);
          // Don't clear the session on network error - might be temporary
        });
    }
  }, [])

  // Update localStorage when sessionId changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (sessionId) {
      console.log(`SessionProvider: Storing session in localStorage: ${sessionId.substring(0, 8)}...`)
      localStorage.setItem("session_id", sessionId)
      setIsSessionValid(true)
      
      // Verify the session immediately
      fetch(`/api/debug/session?sid=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          console.log("SessionProvider: Session validation on update:", data);
          const isValid = !!data.sessionExists;
          setIsSessionValid(isValid);
        })
        .catch(err => {
          console.error("SessionProvider: Error validating updated session:", err);
        });
    } else {
      console.log("SessionProvider: Clearing session from localStorage")
      localStorage.removeItem("session_id")
      setIsSessionValid(false)
    }
  }, [sessionId])

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, isSessionValid }}>
      {children}
    </SessionContext.Provider>
  )
}

// Custom hook to use the session context
export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}