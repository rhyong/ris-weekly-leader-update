"use client"

import { useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subYears, addDays, isFriday, isBefore } from "date-fns"

interface HeaderSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function HeaderSection({ form }: HeaderSectionProps) {
  const { register } = form
  
  // Generate the next Friday plus two previous Fridays
  const fridayDates = useMemo(() => {
    const fridays: { value: string; label: string }[] = []
    const today = new Date()
    
    // Find the next Friday
    let nextFriday = new Date(today)
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    
    // If today is Friday, next Friday is in 7 days
    // Otherwise, calculate days to add to reach next Friday
    const daysToAdd = isFriday(today) ? 7 : ((7 - dayOfWeek + 5) % 7)
    nextFriday = addDays(today, daysToAdd)
    
    // Find current/most recent Friday
    let currentFriday = new Date(today)
    // If today is Friday, currentFriday is today
    // Otherwise, calculate days to subtract to reach previous Friday
    if (!isFriday(currentFriday)) {
      const daysToSubtract = dayOfWeek === 0 ? 2 : dayOfWeek - 5
      currentFriday = addDays(currentFriday, daysToSubtract <= 0 ? daysToSubtract : daysToSubtract - 7)
    }
    
    // Find the previous Friday
    const previousFriday = addDays(currentFriday, -7)
    
    // Find the Friday before the previous one
    const olderFriday = addDays(previousFriday, -7)
    
    // Add the four Fridays to our array, from newest to oldest
    const allFridays = [nextFriday, currentFriday, previousFriday, olderFriday]
    
    allFridays.forEach(date => {
      const dateValue = format(date, "yyyy-MM-dd")
      const dateLabel = format(date, "MMM d, yyyy")
      fridays.push({ 
        value: dateValue, 
        label: date === nextFriday ? `${dateLabel} (Next Friday)` : 
               date === currentFriday ? `${dateLabel} (Current Friday)` : 
               `${dateLabel} (Friday)` 
      })
    })
    
    return fridays
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Header</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="top_3_bullets">Top 3 Bullets (≤35 words)</Label>
          <Textarea
            id="top_3_bullets"
            placeholder="Client A go-live 🟢 | two devs out sick 🟡 | need approval on scope creep"
            className="mt-1"
            {...register("top_3_bullets")}
          />
          <p className="text-xs text-muted-foreground mt-1">AI-suggested summary of key points for executives</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="meta.date">Report Week (Friday)</Label>
            <Select
              onValueChange={(value) => form.setValue("meta.date", value)}
              value={form.watch("meta.date")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select Friday date" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {fridayDates.map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Select the Friday that marks the end of your report week</p>
          </div>
          <div>
            <Label htmlFor="meta.team_name">Team Name</Label>
            <Select
              onValueChange={(value) => form.setValue("meta.team_name", value)}
              value={form.watch("meta.team_name")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Frontend Platform">Frontend Platform</SelectItem>
                <SelectItem value="Backend Services">Backend Services</SelectItem>
                <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="QA & Testing">QA & Testing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="meta.client_org">Client Organization</Label>
          <Select
            onValueChange={(value) => form.setValue("meta.client_org", value)}
            value={form.watch("meta.client_org")}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Acme Corp">Acme Corp</SelectItem>
              <SelectItem value="Globex Industries">Globex Industries</SelectItem>
              <SelectItem value="Initech">Initech</SelectItem>
              <SelectItem value="Umbrella Corporation">Umbrella Corporation</SelectItem>
              <SelectItem value="Stark Industries">Stark Industries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
