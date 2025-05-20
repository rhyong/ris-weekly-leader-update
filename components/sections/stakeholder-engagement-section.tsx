"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import TrafficLightIndicator from "../ui/traffic-light-indicator"

interface StakeholderEngagementSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function StakeholderEngagementSection({ form }: StakeholderEngagementSectionProps) {
  const { register, watch, setValue } = form
  const feedbackNotes = watch("stakeholder_engagement.feedback_notes")
  const expectationShift = watch("stakeholder_engagement.expectation_shift")
  const stakeholderNps = watch("stakeholder_engagement.stakeholder_nps")

  const addFeedbackNote = () => {
    setValue("stakeholder_engagement.feedback_notes", [...feedbackNotes, ""])
  }

  const removeFeedbackNote = (index: number) => {
    const updated = feedbackNotes.filter((_, i) => i !== index)
    setValue("stakeholder_engagement.feedback_notes", updated.length ? updated : [""])
  }

  const addExpectationShift = () => {
    setValue("stakeholder_engagement.expectation_shift", [...expectationShift, ""])
  }

  const removeExpectationShift = (index: number) => {
    const updated = expectationShift.filter((_, i) => i !== index)
    setValue("stakeholder_engagement.expectation_shift", updated.length ? updated : [""])
  }

  // Determine traffic light based on NPS score
  let stakeholderTrafficLight: TrafficLight = "Green"
  if (stakeholderNps !== null) {
    if (stakeholderNps < 3) stakeholderTrafficLight = "Red"
    else if (stakeholderNps < 4) stakeholderTrafficLight = "Yellow"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stakeholder Engagement</CardTitle>
        <TrafficLightIndicator value={stakeholderTrafficLight} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Feedback Notes</Label>
          {feedbackNotes.map((item, index) => (
            <div key={`feedback-${index}`} className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Client praised incident handling"
                value={item}
                onChange={(e) => {
                  const updated = [...feedbackNotes]
                  updated[index] = e.target.value
                  setValue("stakeholder_engagement.feedback_notes", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFeedbackNote(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addFeedbackNote}>
            <Plus className="h-4 w-4 mr-2" /> Add Feedback
          </Button>
        </div>

        <div>
          <Label>Expectation Shifts (optional)</Label>
          {expectationShift.map((item, index) => (
            <div key={`expectation-${index}`} className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Timeline extended due to scope increase"
                value={item}
                onChange={(e) => {
                  const updated = [...expectationShift]
                  updated[index] = e.target.value
                  setValue("stakeholder_engagement.expectation_shift", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeExpectationShift(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addExpectationShift}>
            <Plus className="h-4 w-4 mr-2" /> Add Expectation Shift
          </Button>
        </div>

        <div>
          <Label htmlFor="stakeholder_engagement.stakeholder_nps">Stakeholder NPS (1-5, optional)</Label>
          <Input
            id="stakeholder_engagement.stakeholder_nps"
            type="number"
            min="1"
            max="5"
            step="0.1"
            placeholder="4.8"
            className="mt-1"
            {...register("stakeholder_engagement.stakeholder_nps", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? null : Number.parseFloat(v)),
            })}
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-calculated from stakeholder surveys</p>
        </div>
      </CardContent>
    </Card>
  )
}
