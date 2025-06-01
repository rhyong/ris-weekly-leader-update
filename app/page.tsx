"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
// Mock-data has been removed, using API endpoints instead
import { Loader2, FileText, PlusCircle, BarChart, Calendar, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [recentUpdates, setRecentUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage on init
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('user_data');
    }
    return false;
  })
  
  // Update authenticated state when user changes or from localStorage
  useEffect(() => {
    // Check if logged in from either auth context or localStorage
    const loggedInFromLocalStorage = typeof window !== 'undefined' && 
      (localStorage.getItem('logged_in') === 'true' || localStorage.getItem('user_data'));
    
    console.log("Dashboard: Authentication check", { 
      hasUser: !!user, 
      loggedInFromLocalStorage 
    });
    
    setIsAuthenticated(!!user || !!loggedInFromLocalStorage);
  }, [user]);
  
  useEffect(() => {
    // Only fetch updates if we're authenticated
    if (!isAuthenticated && !authLoading) {
      console.log("Dashboard: Not authenticated, skipping update fetch");
      return;
    }
    
    async function fetchUpdates() {
      try {
        console.log("Dashboard: Fetching updates");
        setIsLoading(true)
        
        // Get session ID from localStorage
        const sessionId = localStorage.getItem('session_id');
        const url = sessionId ? `/api/updates?sid=${sessionId}` : "/api/updates";
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        })
        
        if (!response.ok) {
          console.error("Dashboard: Failed to fetch updates:", response.status);
          // If we get a 401 Unauthorized, we need to redirect to login
          if (response.status === 401) {
            console.log("Dashboard: Unauthorized, user needs to log in");
            setRecentUpdates([]);
            // Clear any stored authentication data
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('user_data');
              localStorage.removeItem('logged_in');
              localStorage.removeItem('session_id');
            }
          }
          return;
        }
        
        const data = await response.json()
        setRecentUpdates(data.slice(0, 3)) // Get the most recent 3 updates
      } catch (error) {
        console.error("Dashboard: Error fetching updates:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUpdates()
  }, [isAuthenticated, authLoading])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date)
    } catch (e) {
      return dateString
    }
  }
  
  // Calculate statistics
  const getCurrentWeekDate = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Sunday
    const mondayDate = new Date(now.setDate(diff))
    return mondayDate.toISOString().split('T')[0]
  }
  
  const currentWeekDate = getCurrentWeekDate()
  const hasCurrentWeekUpdate = recentUpdates.some(update => 
    // Check both week_date and weekDate to support both API and mock-data formats
    (update.week_date === currentWeekDate || update.weekDate === currentWeekDate)
  )
  
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leadership Dashboard</h1>
        <p className="text-muted-foreground">
          Track and manage your weekly leadership updates
        </p>
      </div>
      
      {/* Top stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Updates Created</CardTitle>
            <CardDescription>Total leadership updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : recentUpdates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Current Week</CardTitle>
            <CardDescription>Status for this week</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : hasCurrentWeekUpdate ? (
                <>
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium">Update submitted</span>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm font-medium">Update needed</span>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-1">
            <Link href="/add" className="text-xs text-muted-foreground hover:text-primary">
              {hasCurrentWeekUpdate ? "Edit current update" : "Create update for this week"}
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Last Updated</CardTitle>
            <CardDescription>Most recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : recentUpdates.length > 0 ? (
              <div className="text-sm">
                {formatDistanceToNow(new Date(recentUpdates[0].updated_at || recentUpdates[0].updatedAt), { addSuffix: true })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No updates yet</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/update/add">
            <Button variant="outline" className="w-full h-auto py-4 px-4 justify-start">
              <PlusCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Create Update</div>
                <div className="text-xs text-muted-foreground mt-1">Add a new weekly update</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/history">
            <Button variant="outline" className="w-full h-auto py-4 px-4 justify-start">
              <Calendar className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">View History</div>
                <div className="text-xs text-muted-foreground mt-1">See all past updates</div>
              </div>
            </Button>
          </Link>
          
          <Link href={recentUpdates.length > 0 ? `/update/${recentUpdates[0]?.id}` : "/update/add"}>
            <Button variant="outline" className="w-full h-auto py-4 px-4 justify-start" disabled={recentUpdates.length === 0}>
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Latest Update</div>
                <div className="text-xs text-muted-foreground mt-1">View your most recent update</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/help">
            <Button variant="outline" className="w-full h-auto py-4 px-4 justify-start">
              <BarChart className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Setup & Help</div>
                <div className="text-xs text-muted-foreground mt-1">Configure the application</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Recent updates */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Updates</h2>
          <Link href="/history">
            <Button variant="link" size="sm">View all</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : recentUpdates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentUpdates.map((update) => (
              <Card key={update.id}>
                <CardHeader>
                  <CardTitle className="text-md">{update.team_name || update.teamName}</CardTitle>
                  <CardDescription>{formatDate(update.week_date || update.weekDate)}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm truncate">{update.client_org || update.clientOrg}</p>
                </CardContent>
                <CardFooter className="pt-1">
                  <Link href={`/update/${update.id}`}>
                    <Button variant="outline" size="sm">View Update</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                No Updates Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You haven't created any weekly updates yet. Get started by creating your first update.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/update/add">
                <Button>Create Your First Update</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}