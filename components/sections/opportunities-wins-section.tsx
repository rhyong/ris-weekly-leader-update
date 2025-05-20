"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import TrafficLightIndicator from "../ui/traffic-light-indicator"

interface OpportunitiesWinsSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function OpportunitiesWinsSection({ form }: OpportunitiesWinsSectionProps) {
  const { register, watch, setValue } = form
  const wins = watch("opportunities_wins.wins")
  const growthOps = watch("opportunities_wins.growth_ops")

  const addWin = () => {
    setValue("opportunities_wins.wins", [...wins, ""])
  }

  const removeWin = (index: number) => {
    const updated = wins.filter((_, i) => i !== index)
    setValue("opportunities_wins.wins", updated.length ? updated : [""])
  }

  const addGrowthOp = () => {
    setValue("opportunities_wins.growth_ops", [...growthOps, ""])
  }

  const removeGrowthOp = (index: number) => {
    const updated = growthOps.filter((_, i) => i !== index)
    setValue("opportunities_wins.growth_ops", updated.length ? updated : [""])
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Opportunities & Wins</CardTitle>
        <TrafficLightIndicator value="Green" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Wins</Label>
          {wins.map((item, index) => (
            <div key={`win-${index}`} className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Reduced build time by 30%"
                value={item}
                onChange={(e) => {
                  const updated = [...wins]
                  updated[index] = e.target.value
                  setValue("opportunities_wins.wins", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeWin(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addWin}>
            <Plus className="h-4 w-4 mr-2" /> Add Win
          </Button>
        </div>

        <div>
          <Label>Growth Opportunities</Label>
          {growthOps.map((item, index) => (
            <div key={`growth-${index}`} className="flex items-center gap-2 mt-2">
              <Input
                placeholder="AI build-copilot POC proposed"
                value={item}
                onChange={(e) => {
                  const updated = [...growthOps]
                  updated[index] = e.target.value
                  setValue("opportunities_wins.growth_ops", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeGrowthOp(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addGrowthOp}>
            <Plus className="h-4 w-4 mr-2" /> Add Growth Opportunity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
