"use client"

import { useMemo, useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subYears, addDays, isFriday, isBefore } from "date-fns"
import TextareaWithAI from "../ui/textarea-with-ai"

interface HeaderSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

interface Team {
  id: string;
  name: string;
  description?: string;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
}

export default function HeaderSection({ form }: HeaderSectionProps) {
  const { register } = form
  const [teams, setTeams] = useState<Team[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Effect to ensure date is always a Friday
  useEffect(() => {
    const currentDate = form.watch("meta.date");
    if (currentDate) {
      try {
        const dateObj = new Date(currentDate);
        if (!isNaN(dateObj.getTime()) && !isFriday(dateObj)) {
          // If the current date is not a Friday, find the nearest Friday
          console.warn("Current date is not a Friday:", currentDate);
          
          // Find the closest Friday
          const dayOfWeek = dateObj.getDay();
          const daysToNextFriday = ((7 - dayOfWeek + 5) % 7);
          const daysToPrevFriday = dayOfWeek === 0 ? 2 : dayOfWeek - 5;
          const adjustedDaysToPrevFriday = daysToPrevFriday <= 0 ? daysToPrevFriday : daysToPrevFriday - 7;
          
          // Choose the closest one
          const correction = Math.abs(daysToNextFriday) <= Math.abs(adjustedDaysToPrevFriday) ? 
            daysToNextFriday : adjustedDaysToPrevFriday;
          
          const correctedDate = addDays(dateObj, correction);
          const formattedDate = format(correctedDate, "yyyy-MM-dd");
          
          console.log(`Correcting non-Friday date ${currentDate} to ${formattedDate}`);
          setTimeout(() => form.setValue("meta.date", formattedDate), 0);
        }
      } catch (e) {
        console.error("Error checking date:", e);
      }
    }
  }, [form]);
  
  // Fetch teams from API
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true)
        setError(null)
        
        const response = await fetch('/api/teams')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch teams: ${response.status}`)
        }
        
        const data = await response.json()
        setTeams(data)
      } catch (err) {
        console.error('Error fetching teams:', err)
        setError('Failed to load teams. Please try refreshing the page.')
      } finally {
        setIsLoadingTeams(false)
      }
    }
    
    fetchTeams()
  }, [])
  
  // Fetch organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrgs(true)
        setError(null)
        
        const response = await fetch('/api/organizations')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch organizations: ${response.status}`)
        }
        
        const data = await response.json()
        setOrganizations(data)
      } catch (err) {
        console.error('Error fetching organizations:', err)
        setError('Failed to load organizations. Please try refreshing the page.')
      } finally {
        setIsLoadingOrgs(false)
      }
    }
    
    fetchOrganizations()
  }, [])

  // Generate available Fridays including the current form date if it exists
  const fridayDates = useMemo(() => {
    const fridays: { value: string; label: string }[] = []
    const today = new Date()
    
    // Get the current date value from the form
    const currentDateValue = form.watch("meta.date")
    let currentDateObj: Date | null = null
    
    // If there's a current date value, parse it and create a Date object
    if (currentDateValue) {
      try {
        // Parse the date string into a Date object
        currentDateObj = new Date(currentDateValue)
        
        // Validate that the date is valid
        if (isNaN(currentDateObj.getTime())) {
          currentDateObj = null
        }
      } catch (e) {
        currentDateObj = null
      }
    }
    
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
    
    // Add the standard four Fridays to our array
    let allFridays = [nextFriday, currentFriday, previousFriday, olderFriday]
    
    // If we have a current date that's not in our list, and it's a Friday, add it
    if (currentDateObj && 
        isFriday(currentDateObj) && 
        !allFridays.some(date => 
          format(date, "yyyy-MM-dd") === format(currentDateObj as Date, "yyyy-MM-dd")
        )
    ) {
      allFridays.push(currentDateObj)
    }
    
    // If the current date is NOT a Friday, find the closest Friday and use that instead
    if (currentDateObj && !isFriday(currentDateObj)) {
      console.log("Current date is not a Friday, finding closest Friday")
      
      // Find the closest Friday to the selected date
      const dayOfWeek = currentDateObj.getDay() // 0 = Sunday, 6 = Saturday
      
      // Calculate days to add to reach next Friday or subtract to reach previous Friday
      const daysToNextFriday = ((7 - dayOfWeek + 5) % 7)
      const daysToPrevFriday = dayOfWeek === 0 ? 2 : dayOfWeek - 5
      const adjustedDaysToPrevFriday = daysToPrevFriday <= 0 ? daysToPrevFriday : daysToPrevFriday - 7
      
      // Create Date objects for both options
      const nextClosestFriday = addDays(new Date(currentDateObj), daysToNextFriday)
      const prevClosestFriday = addDays(new Date(currentDateObj), adjustedDaysToPrevFriday)
      
      // Choose the closest one by comparing absolute difference in days
      const closestFriday = Math.abs(daysToNextFriday) <= Math.abs(adjustedDaysToPrevFriday) ? 
        nextClosestFriday : prevClosestFriday
      
      // Only add it if it's not already in the list
      if (!allFridays.some(date => 
        format(date, "yyyy-MM-dd") === format(closestFriday, "yyyy-MM-dd")
      )) {
        allFridays.push(closestFriday)
      }
    }
    
    // Sort dates in descending order (newest first)
    allFridays.sort((a, b) => b.getTime() - a.getTime())
    
    // Convert dates to option objects
    allFridays.forEach(date => {
      const dateValue = format(date, "yyyy-MM-dd")
      const dateLabel = format(date, "MMM d, yyyy")
      
      // Ensure all dates are Fridays
      if (!isFriday(date)) {
        console.warn(`Non-Friday date in options: ${dateValue}. This should not happen.`)
      }
      
      let label = `${dateLabel} (Friday)`
      
      // Add special labels for next and current Friday
      if (format(date, "yyyy-MM-dd") === format(nextFriday, "yyyy-MM-dd")) {
        label = `${dateLabel} (Next Friday)`
      } else if (format(date, "yyyy-MM-dd") === format(currentFriday, "yyyy-MM-dd")) {
        label = `${dateLabel} (Current Friday)`
      } 
      // Add special label for the form's date if it's a Friday and different from standard Fridays
      else if (currentDateObj && 
               isFriday(currentDateObj) &&
               format(date, "yyyy-MM-dd") === format(currentDateObj, "yyyy-MM-dd") &&
               format(date, "yyyy-MM-dd") !== format(nextFriday, "yyyy-MM-dd") &&
               format(date, "yyyy-MM-dd") !== format(currentFriday, "yyyy-MM-dd") &&
               format(date, "yyyy-MM-dd") !== format(previousFriday, "yyyy-MM-dd") &&
               format(date, "yyyy-MM-dd") !== format(olderFriday, "yyyy-MM-dd")) {
        label = `${dateLabel} (Selected Friday)`
      }
      
      fridays.push({ value: dateValue, label })
    })
    
    return fridays
  }, [form.watch("meta.date")]); // Update when date changes
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Header</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 mb-4 text-sm border rounded-md bg-destructive/10 border-destructive text-destructive">
            <strong>Error:</strong> {error}
            <button 
              className="ml-2 underline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        <div>
          <Label htmlFor="top_3_bullets">Top 3 Bullets (≤35 words)</Label>
          <TextareaWithAI
            id="top_3_bullets"
            placeholder="Client A go-live 🟢 | two devs out sick 🟡 | need approval on scope creep"
            className="mt-1"
            aiContext="top_3_bullets"
            value={form.watch("top_3_bullets")}
            onChange={(e) => {
              form.setValue("top_3_bullets", e.target.value);
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">AI-suggested summary of key points for executives</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="meta.date">Report Week (Friday)</Label>
            <select
              id="reportWeek"
              className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
              value={form.watch("meta.date")}
              onChange={(e) => form.setValue("meta.date", e.target.value)}
            >
              <option value="" disabled>Select Friday date</option>
              {fridayDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Select the Friday that marks the end of your report week</p>
          </div>
          <div>
            <Label htmlFor="meta.team_name">Team Name</Label>
            <select
              id="teamName"
              className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
              value={form.watch("meta.team_name")}
              onChange={(e) => form.setValue("meta.team_name", e.target.value)}
              disabled={isLoadingTeams}
            >
              <option value="" disabled>
                {isLoadingTeams ? "Loading teams..." : "Select team"}
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
            {error && error.includes("teams") && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="meta.client_org">Client Organization</Label>
          <select
            id="clientOrg"
            className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
            value={form.watch("meta.client_org")}
            onChange={(e) => form.setValue("meta.client_org", e.target.value)}
            disabled={isLoadingOrgs}
          >
            <option value="" disabled>
              {isLoadingOrgs ? "Loading organizations..." : "Select client"}
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name}>
                {org.name}
              </option>
            ))}
          </select>
          {error && error.includes("organizations") && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
