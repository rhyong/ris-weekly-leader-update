"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Printer, X } from "lucide-react"
import ReportPreview from "@/components/report-preview"
import type { WeeklyUpdateFormData } from "@/components/weekly-update-form"
import { useAuth } from "@/lib/auth-context"

// Add print-specific styles
const printStyles = `
  @media print {
    header, nav, .navigation, [class*="navigation"], [class*="header"] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      top: -9999px !important;
      left: -9999px !important;
    }
    body {
      padding: 0 !important;
      margin: 0 !important;
    }
    .print-view {
      padding: 0 !important;
      margin: 0 !important;
    }
  }
`

export default function UpdatePrintPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [update, setUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Effect to hide the navigation header
  useEffect(() => {
    // Use JavaScript to hide the navigation header
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }
    
    // Add a class to the body for print-specific styles
    document.body.classList.add('print-page');
    
    return () => {
      document.body.classList.remove('print-page');
    };
  }, []);

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

  const handlePrint = () => {
    window.print()
  }
  
  const handleClose = () => {
    router.back()
  }

  return (
    <>
      {/* Inject print styles */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className="py-6 px-4 min-h-screen flex flex-col items-center bg-white print:p-0 print-view">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 w-full max-w-4xl print:hidden">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20 print:hidden">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading update...</p>
          </div>
        </div>
      ) : update && update.data ? (
        <div className="w-full max-w-4xl">
          <div className="flex justify-start mb-6 print:hidden">
            <Button variant="outline" onClick={handleClose} size="sm">
              <X className="h-4 w-4 mr-2" /> Close
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow print:shadow-none">
            <div className="p-6 print:p-0">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Weekly Update - {user?.name || "Team Lead"}</h1>
              </div>
              
              <ReportPreview data={update.data as WeeklyUpdateFormData} />
            </div>
          </div>
        </div>
      ) : !error ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md mb-6 w-full max-w-4xl print:hidden">
          <p className="font-medium">Not Found</p>
          <p>The requested update could not be found.</p>
        </div>
      ) : null}
      
      {/* Fixed position buttons */}
      {update && update.data && (
        <div className="fixed bottom-6 right-6 print:hidden flex gap-3">
          <Button size="lg" onClick={handlePrint} className="shadow-lg">
            <Printer className="h-5 w-5 mr-2" /> Print
          </Button>
        </div>
      )}
      </div>
    </>
  )
}