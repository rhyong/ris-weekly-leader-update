"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, Edit, Users, Building } from "lucide-react"
import { TeamMembersList } from "@/components/team-members-list"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useSession } from "@/lib/session-provider"
import type { User } from "@/lib/auth-db"
import type { TeamMember } from "@/lib/auth-db"

interface ProfileData {
  user: Omit<User, "password">
  teamMembers: TeamMember[]
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user: authUser } = useAuth()
  const { sessionId } = useSession()

  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch(sessionId ? `/api/debug/session?sid=${sessionId}` : "/api/debug/session")
        const data = await response.json()
        setDebugInfo(data)
      } catch (err) {
        console.error("Error fetching debug info:", err)
        setDebugInfo({ error: "Failed to fetch debug info" })
      }
    }
    
    fetchDebugInfo()
  }, [sessionId])
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Attach a timestamp to prevent caching
        const timestamp = new Date().getTime()
        
        // Add session ID to query params if available
        const url = sessionId 
          ? `/api/user/profile?t=${timestamp}&sid=${sessionId}` 
          : `/api/user/profile?t=${timestamp}`;
          
        const response = await fetch(url, {
          // Add explicit credentials to ensure cookies are sent
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`)
        }

        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data")
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (authUser) {
      fetchProfile()
    } else {
      // If no authenticated user, set loading to false to avoid endless loading state
      setIsLoading(false)
      setError("You must be logged in to view your profile")
    }
  }, [authUser, toast, sessionId])

  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Could not load profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{error || "Unknown error occurred"}</p>
              
              {debugInfo && (
                <div className="mt-4 p-3 bg-slate-100 rounded text-xs">
                  <h4 className="font-medium mb-1">Debug Info:</h4>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                  <div className="mt-2">
                    <h4 className="font-medium mb-1">Auth Context:</h4>
                    <p>User in context: {authUser ? 'Yes' : 'No'}</p>
                    <p>Session ID: {sessionId ? `${sessionId.substring(0, 8)}...` : 'Not found'}</p>
                    {authUser && (
                      <div className="mt-1">
                        <p>User ID: {authUser.id}</p>
                        <p>Username: {authUser.username}</p>
                        <p>Name: {authUser.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.location.href = "/api/auth/login?debug=true"}
                      className="mr-2"
                    >
                      Debug Login API
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.location.href = "/api/user/profile?debug=true"}
                    >
                      Debug Profile API
                    </Button>
                  </div>
                </div>
              )}
              
              {error === "You must be logged in to view your profile" ? (
                <Button onClick={() => router.push("/login")} className="mt-4">Go to Login</Button>
              ) : (
                <Button onClick={() => router.refresh()} className="mt-4">Try Again</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { user, teamMembers } = profileData

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <Button onClick={handleEditProfile}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background">
                  <Image
                    src={user.profileImage || "/placeholder-user.jpg"}
                    alt={user.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Username</p>
                  <p>{user.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p>{user.email || "Not provided"}</p>
                </div>
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p>{user.clientOrg || "No organization set"}</p>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p>{user.teamName || "No team set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">{user.bio || "No bio information available."}</p>
              
              <div className="mt-6">
                <TeamMembersList 
                  teamMembers={teamMembers} 
                  teamName={user.teamName} 
                  clientOrg={user.clientOrg}
                  readOnly={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}