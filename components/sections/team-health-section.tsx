"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import TrafficLightIndicator from "../ui/traffic-light-indicator"
import SentimentBar from "../ui/sentiment-bar"
import TextareaWithAI from "../ui/textarea-with-ai"

interface TeamHealthSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function TeamHealthSection({ form }: TeamHealthSectionProps) {
  const { register, watch, setValue } = form
  const watchedScore = watch("team_health.sentiment_score")
  const sentimentScore = typeof watchedScore === 'number' ? watchedScore : 3.5 // Ensure it's a number

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="team_health.owner_input">Team Health Notes (1-2 sentences)</Label>
          <TextareaWithAI
            id="team_health.owner_input"
            placeholder="Morale dented by overtime; planning social hour."
            className="mt-1"
            aiContext="team_health"
            {...register("team_health.owner_input")}
          />
        </div>

        <div>
          <Label htmlFor="team_health.overall_status">How's the team doing overall this week?</Label>
          <TextareaWithAI
            id="team_health.overall_status"
            placeholder="Team morale is high after completing the major milestone"
            className="mt-1"
            aiContext="overall_status"
            {...register("team_health.overall_status")}
          />
        </div>

        <div>
          <div className="flex justify-between">
            <Label>Sentiment Score (auto from chat analysis)</Label>
            <span className="font-medium">{typeof sentimentScore === 'number' ? sentimentScore.toFixed(1) : '3.5'}</span>
          </div>
          <Slider
            value={[sentimentScore]}
            min={1}
            max={5}
            step={0.1}
            onValueChange={(value) => setValue("team_health.sentiment_score", value[0])}
            className="mt-2"
          />
          <SentimentBar value={sentimentScore} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}
