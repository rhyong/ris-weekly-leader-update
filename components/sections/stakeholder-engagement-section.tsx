"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface StakeholderEngagementSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function StakeholderEngagementSection({ form }: StakeholderEngagementSectionProps) {
  const { register, watch, setValue } = form
  const feedbackNotes = watch("stakeholder_engagement.feedback_notes")

  const addFeedbackNote = () => {
    setValue("stakeholder_engagement.feedback_notes", [...feedbackNotes, ""])
  }

  const removeFeedbackNote = (index: number) => {
    const updated = feedbackNotes.filter((_, i) => i !== index)
    setValue("stakeholder_engagement.feedback_notes", updated.length ? updated : [""])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stakeholder Engagement</CardTitle>
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
      </CardContent>
    </Card>
  )
}
