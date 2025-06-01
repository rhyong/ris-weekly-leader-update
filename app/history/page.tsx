"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WeeklyUpdate {
  id: string
  week_date: string
  team_name: string
  client_org: string
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/updates")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()
        setUpdates(data)
      } catch (error) {
        console.error("Error fetching updates:", error)
        setError("Failed to load updates. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load your weekly updates",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpdates()
  }, [toast])

  const viewUpdate = (id: string) => {
    router.push(`/update/${id}`)
  }

  const retryFetch = () => {
    setIsLoading(true)
    setError(null)
    fetchUpdates()
  }

  const fetchUpdates = async () => {
    try {
      const response = await fetch("/api/updates")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()
      setUpdates(data)
    } catch (error) {
      console.error("Error fetching updates:", error)
      setError("Failed to load updates. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to load your weekly updates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10 px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Weekly Updates History</h1>
        <p className="text-muted-foreground">View and manage your past weekly leadership updates</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={retryFetch}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading your updates...</p>
          </div>
        </div>
      ) : updates.length === 0 && !error ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any weekly updates yet</p>
            <Button onClick={() => router.push("/update/add")}>Create Your First Update</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {updates.map((update) => (
            <Card key={update.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{format(new Date(update.week_date), "MMMM d, yyyy")}</CardTitle>
                    <CardDescription>
                      {update.team_name} • {update.client_org}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {(user?.role.toLowerCase() === "admin" || user?.role.toLowerCase() === "manager") && (
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/update/${update.id}/edit`)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button onClick={() => viewUpdate(update.id)}>View</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Created: {format(new Date(update.created_at), "MMM d, yyyy")}</span>
                  <span>Last updated: {format(new Date(update.updated_at), "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
