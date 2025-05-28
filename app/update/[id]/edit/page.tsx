"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import WeeklyUpdateForm from "@/components/weekly-update-form"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditWeeklyUpdate() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateExists, setUpdateExists] = useState(false)
  
  // Check if the update exists before rendering the form
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (!params.id) {
          setError("No update ID provided")
          return
        }
        
        const response = await fetch(`/api/updates/${params.id}`)
        
        if (response.ok) {
          setUpdateExists(true)
        } else {
          setError(`Update not found: ${response.status}`)
        }
      } catch (err) {
        console.error("Error checking update:", err)
        setError("Failed to check if update exists")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkUpdate()
  }, [params.id])
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading update...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Weekly Update</h1>
        <p className="text-muted-foreground">
          Continue editing your weekly update with Team Members and Personal Updates
        </p>
      </div>
      <WeeklyUpdateForm 
        isNewUpdate={false} 
        existingUpdateId={params.id as string} 
        initialActiveTab="edit"
      />
    </div>
  )
}