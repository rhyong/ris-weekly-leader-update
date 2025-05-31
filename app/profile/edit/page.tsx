"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Mail, Users, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
// Define our own types to match what's in the API
interface UserType {
  id: string;
  username: string;
  name: string;
  role: string;
  email?: string;
  teamName?: string;
  clientOrg?: string;
  bio?: string;
  profileImage?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface ProfileData {
  user: Omit<UserType, "password">
  teamMembers: TeamMember[]
}

export default function EditProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  // Only include fields that exist in the database
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get session ID from localStorage if available
        const sessionId = localStorage.getItem('session_id');
        const url = sessionId ? `/api/user/profile?sid=${sessionId}` : "/api/user/profile";
        
        console.log("Fetching profile with URL:", url);
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`)
        }

        const data = await response.json()
        console.log("Profile data received:", data);
        
        setProfileData(data)
        // Only include fields that exist in the database
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          role: data.user.role || ""
        })
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
    }
  }, [authUser, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Get session ID from localStorage if available
      const sessionId = localStorage.getItem('session_id');
      const url = sessionId ? `/api/user/profile?sid=${sessionId}` : "/api/user/profile";
      
      console.log("Updating profile with URL:", url);
      console.log("Profile update data:", formData);
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Profile update error response:", errorText);
        throw new Error(`Failed to update profile: ${response.status}${errorText ? ' - ' + errorText : ''}`)
      }

      const data = await response.json()
      console.log("Profile update success response:", data);
      setProfileData(data)
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      
      router.push("/profile")
    } catch (err) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: `Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/profile")
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
              <Button onClick={() => router.refresh()} className="mt-4">Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal and team information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center">
                      <User className="w-4 h-4 mr-1" /> Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" /> Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center">
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Your role"
                  />
                </div>
              </div>
              
              {/* Additional fields hidden - not in database schema */}
              <div className="pt-4">
                <p className="text-sm text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 rounded-md p-3">
                  <strong>Note:</strong> Additional profile fields are not available in this database. Only basic user information can be edited.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Note: Team members can only be managed through your weekly updates or by your administrator.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}