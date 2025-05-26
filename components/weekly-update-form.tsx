"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeamHealthSection from "./sections/team-health-section"
import DeliveryPerformanceSection from "./sections/delivery-performance-section"
import StakeholderEngagementSection from "./sections/stakeholder-engagement-section"
import RisksEscalationsSection from "./sections/risks-escalations-section"
import OpportunitiesWinsSection from "./sections/opportunities-wins-section"
import SupportNeededSection from "./sections/support-needed-section"
import HeaderSection from "./sections/header-section"
import PersonalUpdatesSection from "./sections/personal-updates-section"
import TeamMembersUpdatesSection from "./sections/team-members-section"
import WeeklyUpdateView from "./weekly-update-view"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export type TrafficLight = "Green" | "Yellow" | "Red"
export type WorkloadBalance = "TooMuch" | "TooLittle" | "JustRight"
export type DeliveryRisk = "Low" | "Medium" | "High"

export interface WeeklyUpdateFormData {
  // Header
  top_3_bullets: string
  meta: {
    date: string
    team_name: string
    client_org: string
  }

  // Team Health
  team_health: {
    owner_input: string
    traffic_light: TrafficLight
    sentiment_score: number
    overall_status: string
    energy_engagement: string
    roles_alignment: string
  }

  // Delivery Performance
  delivery_performance: {
    accomplishments: string[]
    misses_delays: string[]
    workload_balance: WorkloadBalance
  }

  // Stakeholder Engagement
  stakeholder_engagement: {
    feedback_notes: string[]
    expectation_shift: string[]
    stakeholder_nps: number | null
  }

  // Risks & Escalations
  risks_escalations: {
    risks: Array<{
      title: string
      description: string
      severity: TrafficLight
    }>
    escalations: string[]
  }

  // Opportunities & Wins
  opportunities_wins: {
    wins: string[]
    growth_ops: string[]
  }

  // Support Needed
  support_needed: {
    requests: string[]
  }

  // Personal Updates
  personal_updates: {
    personal_wins: string[]
    leadership_focus: {
      skill: string
      practice: string
    }
    reflections: string[]
    goals: Array<{
      description: string
      status: TrafficLight
      update: string
    }>
    support_needed: string
  }

  // Team Members Updates
  team_members_updates: {
    people_changes: string
    top_contributors: Array<{
      name: string
      achievement: string
      recognition: string
    }>
    members_needing_attention: Array<{
      name: string
      issue: string
      support_plan: string
      delivery_risk: DeliveryRisk
    }>
  }
}

export default function WeeklyUpdateForm() {
  const [activeTab, setActiveTab] = useState("edit")
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [savedUpdateId, setSavedUpdateId] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<WeeklyUpdateFormData>({
    top_3_bullets: "",
    meta: {
      date: new Date().toISOString().split("T")[0],
      team_name: "",
      client_org: "",
    },
    team_health: {
      owner_input: "",
      traffic_light: "Green",
      sentiment_score: 3.5,
      overall_status: "",
      energy_engagement: "",
      roles_alignment: "",
    },
    delivery_performance: {
      accomplishments: [""],
      misses_delays: [""],
      workload_balance: "JustRight",
    },
    stakeholder_engagement: {
      feedback_notes: [""],
      expectation_shift: [""],
      stakeholder_nps: null,
    },
    risks_escalations: {
      risks: [{ title: "", description: "", severity: "Green" }],
      escalations: [""],
    },
    opportunities_wins: {
      wins: [""],
      growth_ops: [""],
    },
    support_needed: {
      requests: [""],
    },
    personal_updates: {
      personal_wins: [""],
      leadership_focus: {
        skill: "",
        practice: "",
      },
      reflections: [""],
      goals: [{ description: "", status: "Green", update: "" }],
      support_needed: "",
    },
    team_members_updates: {
      people_changes: "",
      top_contributors: [{ name: "", achievement: "", recognition: "" }],
      members_needing_attention: [{ name: "", issue: "", support_plan: "", delivery_risk: "Low" }],
    },
  })

  const form = useForm<WeeklyUpdateFormData>({
    defaultValues: formData,
  })

  const handleSubmit = async (data: WeeklyUpdateFormData) => {
    setFormData(data)
    await saveUpdate(data)
  }

  const saveUpdate = async (data: WeeklyUpdateFormData = formData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your update",
        variant: "destructive",
      })
      return false
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekDate: data.meta.date,
          teamName: data.meta.team_name,
          clientOrg: data.meta.client_org,
          data: data,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save update")
      }

      const result = await response.json()
      setSavedUpdateId(result.id)

      toast({
        title: "Update saved",
        description: "Your weekly update has been saved successfully",
      })

      return true
    } catch (error) {
      console.error("Error saving update:", error)
      toast({
        title: "Error",
        description: "Failed to save your weekly update",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleTabChange = async (value: string) => {
    if (value === "review") {
      setIsPreviewLoading(true)
      const currentValues = form.getValues()
      setFormData(currentValues)
      await saveUpdate(currentValues)
      setIsPreviewLoading(false)
    }
    setActiveTab(value)
  }

  const viewInNewTab = async () => {
    const currentValues = form.getValues()
    setFormData(currentValues)
    const success = await saveUpdate(currentValues)

    if (success && savedUpdateId) {
      router.push(`/update/${savedUpdateId}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="edit">Team Updates</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="personal">Personal Updates</TabsTrigger>
          <TabsTrigger value="review">Review Report</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-6">
              <HeaderSection form={form} />
              <TeamHealthSection form={form} />
              <DeliveryPerformanceSection form={form} />
              <StakeholderEngagementSection form={form} />
              <RisksEscalationsSection form={form} />
              <OpportunitiesWinsSection form={form} />
              <SupportNeededSection form={form} />

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={viewInNewTab}>
                  Open in New Tab
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Update"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="members">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-6">
              <TeamMembersUpdatesSection form={form} />

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={viewInNewTab}>
                  Open in New Tab
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Update"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="personal">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-6">
              <PersonalUpdatesSection form={form} />

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={viewInNewTab}>
                  Open in New Tab
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Update"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="review">
          {isPreviewLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading preview...</p>
            </div>
          ) : (
            <div>
              <WeeklyUpdateView data={formData} showBackButton={false} />

              <div className="flex justify-end mt-6 print:hidden">
                <Button onClick={viewInNewTab}>Open in New Tab</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
