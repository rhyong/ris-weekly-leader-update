"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, ArrowLeft } from "lucide-react"
import ReportPreview from "@/components/report-preview"
import { format } from "date-fns"
import type { WeeklyUpdateFormData } from "@/components/weekly-update-form"

interface WeeklyUpdateViewProps {
  data: WeeklyUpdateFormData
  date?: string
  teamName?: string
  clientOrg?: string
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

export default function WeeklyUpdateView({
  data,
  date,
  teamName,
  clientOrg,
  showBackButton = false,
  onBack,
  className = "",
}: WeeklyUpdateViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const formattedDate = date ? format(new Date(date), "MMMM d, yyyy") : format(new Date(data.meta.date), "MMMM d, yyyy")
  const displayTeamName = teamName || data.meta.team_name
  const displayClientOrg = clientOrg || data.meta.client_org

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          {showBackButton && (
            <Button variant="outline" size="sm" onClick={onBack} className="mb-2 print:hidden">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          )}
          <h1 className="text-2xl font-bold">Weekly Update</h1>
          <p className="text-muted-foreground">
            {formattedDate}
            {displayTeamName && ` • ${displayTeamName}`}
            {displayClientOrg && ` • ${displayClientOrg}`}
          </p>
        </div>
        <Button variant="outline" onClick={handlePrint} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" /> Print Report
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
