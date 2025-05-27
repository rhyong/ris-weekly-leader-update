"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import WeeklyUpdateView from "@/components/weekly-update-view"
import type { WeeklyUpdateFormData } from "@/components/weekly-update-form"

export default function UpdateViewPage() {
  const params = useParams()
  const router = useRouter()
  const [update, setUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/updates/${params.id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()
        setUpdate(data)
      } catch (error) {
        console.error("Error fetching update:", error)
        setError("Failed to load update. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchUpdate()
    }
  }, [params.id])

  const handleBack = () => {
    router.push("/history")
  }

  return (
    <div className="container py-10 px-10">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading update...</p>
          </div>
        </div>
      ) : update && update.data ? (
        <>
          <WeeklyUpdateView
            data={update.data as WeeklyUpdateFormData}
            date={update.weekDate}
            teamName={update.teamName}
            clientOrg={update.clientOrg}
            showBackButton={true}
            onBack={handleBack}
          />

          <div className="mt-6 print:hidden">
            <Button variant="outline" onClick={handleBack}>
              Back to History
            </Button>
          </div>
        </>
      ) : !error ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested update could not be found.</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
