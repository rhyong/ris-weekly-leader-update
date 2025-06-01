"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, ArrowLeft, FileDown } from "lucide-react"
import ReportPreview from "@/components/report-preview"
import { format } from "date-fns"
import type { WeeklyUpdateFormData } from "@/components/weekly-update-form"
import { useRouter } from "next/navigation"

interface WeeklyUpdateViewProps {
  data: WeeklyUpdateFormData
  date?: string
  teamName?: string
  clientOrg?: string
  showBackButton?: boolean
  onBack?: () => void
  className?: string
  updateId?: string
}

export default function WeeklyUpdateView({
  data,
  date,
  teamName,
  clientOrg,
  showBackButton = false,
  onBack,
  className = "",
  updateId,
}: WeeklyUpdateViewProps) {
  const router = useRouter()
  
  const handlePrint = () => {
    // If we have an update ID, open the print view in a new tab
    if (updateId) {
      window.open(`/update/${updateId}/print`, '_blank')
    } else {
      // Fall back to regular printing if no ID is available
      window.print()
    }
  }

  const formattedDate = date ? format(new Date(date), "MMMM d, yyyy") : (data.meta?.date ? format(new Date(data.meta.date), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy"))
  const displayTeamName = teamName || data.meta?.team_name || "Team"
  const displayClientOrg = clientOrg || data.meta?.client_org || "Organization"

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          {showBackButton && (
            <Button variant="outline" size="sm" onClick={onBack} className="mb-2 print:hidden">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={handlePrint} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print Review
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ReportPreview data={data} />
        </CardContent>
      </Card>
    </div>
  )
}