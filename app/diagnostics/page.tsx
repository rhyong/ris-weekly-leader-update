"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function DiagnosticsPage() {
  // Start with proper initial states to avoid hydration errors
  const [authState, setAuthState] = useState<any>(null)
  const [cookieState, setCookieState] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginLog, setLoginLog] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)  // Track client-side rendering
  const router = useRouter()

  // Mark as client-side rendered after mount
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Separate effect for data fetching to avoid hydration issues
  useEffect(() => {
    // Only fetch data on the client side
    if (!isClient) return
    
    async function fetchDiagnostics() {
      setIsLoading(true)
      
      try {
        // Fetch auth state
        const authResponse = await fetch("/api/debug/auth-state")
        if (authResponse.ok) {
          const authData = await authResponse.json()
          setAuthState(authData)
        }
        
        // Fetch cookie state
        const cookieResponse = await fetch("/api/debug/cookie-check")
        if (cookieResponse.ok) {
          const cookieData = await cookieResponse.json()
          setCookieState(cookieData)
        }
        
        // Get login log from localStorage
        const storedLog = localStorage.getItem("login_diagnostic_log")
        if (storedLog) {
          try {
            const parsedLog = JSON.parse(storedLog)
            setLoginLog(parsedLog)
          } catch (e) {
            console.error("Error parsing login log:", e)
          }
        }
      } catch (e) {
        console.error("Error fetching diagnostics:", e)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDiagnostics()
  }, [isClient])
  
  const clearLocalStorage = () => {
    localStorage.clear()
    window.location.reload()
  }
  
  const clearJustAuth = () => {
    localStorage.removeItem("logged_in")
    localStorage.removeItem("user_data")
    localStorage.removeItem("session_id")
    window.location.reload()
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Auth State</CardTitle>
            <CardDescription>Current authentication state from server</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(authState, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cookie State</CardTitle>
            <CardDescription>Current cookies as seen by the server</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(cookieState, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>LocalStorage State</CardTitle>
          <CardDescription>Current localStorage authentication data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium mb-2">user_data</h3>
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-40">
                {isClient && localStorage.getItem("user_data")
                  ? JSON.stringify(JSON.parse(localStorage.getItem("user_data") || "{}"), null, 2)
                  : "Not found"}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">session_id</h3>
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-40">
                {isClient && localStorage.getItem("session_id")
                  ? `${localStorage.getItem("session_id")?.substring(0, 8)}...`
                  : "Not found"}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">logged_in</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-40">
              {isClient 
                ? localStorage.getItem("logged_in") || "Not found"
                : "Not available"}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <div className="flex space-x-4">
            <Button onClick={clearJustAuth} variant="outline">
              Clear Auth Data Only
            </Button>
            <Button onClick={clearLocalStorage} variant="destructive">
              Clear All LocalStorage
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Warning: Clearing storage will log you out of the application
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Login Diagnostic Log</CardTitle>
          <CardDescription>Debug log from recent login attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isClient && loginLog.length > 0 ? (
            <div className="space-y-4">
              {loginLog.map((entry, index) => (
                <div key={index} className="border-b pb-2">
                  <div className="text-xs text-muted-foreground">
                    {entry.timestamp}
                  </div>
                  <div className="font-medium text-sm">{entry.message}</div>
                  {entry.data && (
                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded mt-1 overflow-auto max-h-32">
                      {JSON.stringify(entry.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No login log found</div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => localStorage.removeItem("login_diagnostic_log")} variant="outline">
            Clear Login Log
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex justify-between mt-8">
        <Button onClick={() => router.push("/")} variant="outline">
          Back to Dashboard
        </Button>
        <Button onClick={() => window.location.reload()} variant="default">
          Refresh Diagnostics
        </Button>
      </div>
    </div>
  )
}