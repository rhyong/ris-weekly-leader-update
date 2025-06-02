"use client"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import TrafficLightIndicator from "../ui/traffic-light-indicator"
import SentimentBar from "../ui/sentiment-bar"
import TextareaWithAI from "../ui/textarea-with-ai"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface TeamHealthSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function TeamHealthSection({ form }: TeamHealthSectionProps) {
  const { register, watch, setValue } = form
  const watchedScore = watch("team_health.sentiment_score")
  const sentimentScore = typeof watchedScore === 'number' ? watchedScore : 3.5 // Ensure it's a number
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Function to analyze sentiment using AI
  async function analyzeSentimentWithAI() {
    try {
      setIsAnalyzing(true)
      
      // Get the current values from the form
      const teamHealthNotes = watch("team_health.owner_input") || ""
      const overallStatus = watch("team_health.overall_status") || ""
      
      // Call the sentiment analysis API
      const response = await fetch("/api/ai/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamHealthNotes,
          overallStatus,
        }),
      })
      
      const data = await response.json()
      
      // Update the form with the calculated sentiment score
      if (data.success && typeof data.sentimentScore === "number") {
        setValue("team_health.sentiment_score", data.sentimentScore)
      } else {
        console.error("Failed to analyze sentiment:", data.error)
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

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
            value={watch("team_health.owner_input")}
            onChange={(e) => {
              setValue("team_health.owner_input", e.target.value);
            }}
          />
        </div>

        <div>
          <Label htmlFor="team_health.overall_status">How's the team doing overall this week?</Label>
          <TextareaWithAI
            id="team_health.overall_status"
            placeholder="Team morale is high after completing the major milestone"
            className="mt-1"
            aiContext="overall_status"
            value={watch("team_health.overall_status")}
            onChange={(e) => {
              setValue("team_health.overall_status", e.target.value);
            }}
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label>Sentiment Score</Label>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={analyzeSentimentWithAI}
                disabled={isAnalyzing}
              >
                <Sparkles className="size-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
              <span className="font-medium">{typeof sentimentScore === 'number' ? sentimentScore.toFixed(1) : '3.5'}</span>
            </div>
          </div>
          <Slider
            value={[sentimentScore]}
            min={1}
            max={5}
            step={0.1}
            onValueChange={(value) => {
              console.log(`Setting sentiment score to: ${value[0]}`);
              setValue("team_health.sentiment_score", value[0]);
              // Check after setting to verify it was set correctly
              setTimeout(() => {
                const currentValue = form.getValues("team_health.sentiment_score");
                console.log(`Verified sentiment score is now: ${currentValue}`);
              }, 100);
            }}
            className="mt-2"
          />
          <SentimentBar value={sentimentScore} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}
