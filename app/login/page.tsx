"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    // Check authentication state on mount
    const hasLocalUser = typeof window !== 'undefined' && !!localStorage.getItem('user_data')
    const hasSessionId = typeof window !== 'undefined' && !!localStorage.getItem('session_id')
    
    // Get login diagnostic log if available
    const diagnosticLog = typeof window !== 'undefined' 
      ? localStorage.getItem("login_diagnostic_log") 
      : null
    
    console.log("Login page: Auth check", { 
      hasContextUser: !!user,
      hasLocalUser,
      hasLocalUserDetails: typeof window !== 'undefined' 
        ? localStorage.getItem('user_data') 
        : null,
      hasSessionId,
      sessionIdValue: hasSessionId && typeof window !== 'undefined'
        ? `${localStorage.getItem('session_id')?.substring(0, 8)}...`
        : null,
      hasLoggedInFlag: typeof window !== 'undefined'
        ? !!localStorage.getItem('logged_in')
        : null,
      pathname: window.location.pathname,
      hasDiagnosticLog: !!diagnosticLog
    })
    
    // Log the diagnostic log if available
    if (diagnosticLog) {
      try {
        console.log("Login diagnostic log:", JSON.parse(diagnosticLog));
      } catch (e) {
        console.error("Error parsing diagnostic log:", e);
      }
    }
    
    // If already logged in, redirect to dashboard
    if (user || hasLocalUser) {
      console.log("Login page: User already logged in, redirecting to dashboard");
      
      // Let's add a slight delay to allow for hooks to stabilize
      setTimeout(() => {
        router.push("/");
      }, 100);
    }
  }, [user, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Get the form element and submit it
    const form = e.currentTarget as HTMLFormElement
    form.submit()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Weekly Leadership Update</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your leadership dashboard
          </CardDescription>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-md text-sm border border-blue-100 dark:border-blue-900">
            <div className="flex items-center text-blue-800 dark:text-blue-300 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">Authentication Required</p>
            </div>
            <p className="mb-2 text-blue-700 dark:text-blue-400">
              Please use one of the following test accounts:
            </p>
            <div className="bg-white dark:bg-blue-900 rounded p-2 border border-blue-100 dark:border-blue-800 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Admin:</span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">Recommended</span>
              </div>
              <div className="font-mono text-sm">
                <div>Username: <span className="font-bold">admin</span></div>
                <div>Password: <span className="font-bold">password123</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-blue-900 rounded p-2 border border-blue-100 dark:border-blue-800">
              <div className="font-medium mb-1">Team Lead:</div>
              <div className="font-mono text-sm">
                <div>Username: <span className="font-bold">teamlead</span></div>
                <div>Password: <span className="font-bold">password123</span></div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Server-side form for direct POST */}
        <form action="/api/direct-login" method="POST" onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs text-muted-foreground">
                  Case sensitive
                </span>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <input type="hidden" name="redirectTo" value="/" />
            
            {isLoading && (
              <div className="flex items-center justify-center py-2">
                <svg className="animate-spin mr-2 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging in...</span>
              </div>
            )}
            
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-2">Quick Login:</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs h-auto py-1"
                  onClick={() => {
                    setUsername("admin");
                    setPassword("password123");
                    // Auto-submit after a small delay to allow state update
                    setTimeout(() => {
                      document.querySelector('form')?.dispatchEvent(
                        new Event('submit', { cancelable: true, bubbles: true })
                      );
                    }, 100);
                  }}
                >
                  Admin Account
                </Button>
                <Button
                  type="button"
                  variant="outline" 
                  className="text-xs h-auto py-1"
                  onClick={() => {
                    setUsername("teamlead");
                    setPassword("password123");
                    // Auto-submit after a small delay to allow state update
                    setTimeout(() => {
                      document.querySelector('form')?.dispatchEvent(
                        new Event('submit', { cancelable: true, bubbles: true })
                      );
                    }, 100);
                  }}
                >
                  Team Lead Account
                </Button>
              </div>
              
              <div className="mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    router.push("/diagnostics");
                  }}
                  className="text-xs"
                >
                  View Auth Diagnostics
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            
            <div className="flex items-center justify-center mt-2">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/help')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Database Setup & Help
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure login - Only valid credentials are accepted
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}