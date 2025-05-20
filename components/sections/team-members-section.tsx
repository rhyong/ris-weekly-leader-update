"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface TeamMembersUpdatesSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function TeamMembersUpdatesSection({ form }: TeamMembersUpdatesSectionProps) {
  const { register, watch, setValue } = form
  const peopleChanges = watch("team_members_updates.people_changes")
  const topContributors = watch("team_members_updates.top_contributors")
  const membersNeedingAttention = watch("team_members_updates.members_needing_attention")

  // Top Contributors
  const addTopContributor = () => {
    setValue("team_members_updates.top_contributors", [
      ...topContributors,
      { name: "", achievement: "", recognition: "" },
    ])
  }

  const removeTopContributor = (index: number) => {
    const updated = topContributors.filter((_, i) => i !== index)
    setValue(
      "team_members_updates.top_contributors",
      updated.length ? updated : [{ name: "", achievement: "", recognition: "" }],
    )
  }

  const updateTopContributor = (index: number, field: string, value: string) => {
    const updated = [...topContributors]
    updated[index] = { ...updated[index], [field]: value }
    setValue("team_members_updates.top_contributors", updated)
  }

  // Members Needing Attention
  const addMemberNeedingAttention = () => {
    setValue("team_members_updates.members_needing_attention", [
      ...membersNeedingAttention,
      { name: "", issue: "", support_plan: "", delivery_risk: "Low" },
    ])
  }

  const removeMemberNeedingAttention = (index: number) => {
    const updated = membersNeedingAttention.filter((_, i) => i !== index)
    setValue(
      "team_members_updates.members_needing_attention",
      updated.length ? updated : [{ name: "", issue: "", support_plan: "", delivery_risk: "Low" }],
    )
  }

  const updateMemberNeedingAttention = (index: number, field: string, value: string) => {
    const updated = [...membersNeedingAttention]
    updated[index] = { ...updated[index], [field]: value }
    setValue("team_members_updates.members_needing_attention", updated)
  }

  return (
    <div className="space-y-6">
      {/* People Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Team Composition Changes & People Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team_members_updates.people_changes">
              Any people issues or changes (e.g., new joiners, exits, leaves)?
            </Label>
            <Textarea
              id="team_members_updates.people_changes"
              placeholder="John is joining next week, Sarah is taking parental leave starting in 2 weeks"
              className="mt-1"
              {...register("team_members_updates.people_changes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors / Recognitions */}
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors / Recognitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Highlight team members who stood out this week, what they achieved, and how you're recognizing them.
          </p>

          {topContributors.map((contributor, index) => (
            <div key={`contributor-${index}`} className="p-4 border rounded-md space-y-3">
              <div className="flex justify-between">
                <Label>Team Member {index + 1}</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeTopContributor(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Sarah Johnson"
                  value={contributor.name}
                  onChange={(e) => updateTopContributor(index, "name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Achievement</Label>
                <Textarea
                  placeholder="Led a successful demo with the client that helped clarify scope and gained stakeholder trust"
                  value={contributor.achievement}
                  onChange={(e) => updateTopContributor(index, "achievement", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Recognition</Label>
                <Input
                  placeholder="Public praise in team meeting, $50 gift card"
                  value={contributor.recognition}
                  onChange={(e) => updateTopContributor(index, "recognition", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addTopContributor}>
            <Plus className="h-4 w-4 mr-2" /> Add Top Contributor
          </Button>
        </CardContent>
      </Card>

      {/* Team Members Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members Needing Attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Identify team members who are struggling, what issues they're facing, and your plan to support them.
          </p>

          {membersNeedingAttention.map((member, index) => (
            <div key={`member-${index}`} className="p-4 border rounded-md space-y-3">
              <div className="flex justify-between">
                <Label>Team Member {index + 1}</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeMemberNeedingAttention(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  placeholder="James Smith"
                  value={member.name}
                  onChange={(e) => updateMemberNeedingAttention(index, "name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Issue</Label>
                <Textarea
                  placeholder="Struggling with time management and falling behind on API integration"
                  value={member.issue}
                  onChange={(e) => updateMemberNeedingAttention(index, "issue", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Support Plan</Label>
                <Textarea
                  placeholder="Set up daily check-ins and assigned a peer mentor"
                  value={member.support_plan}
                  onChange={(e) => updateMemberNeedingAttention(index, "support_plan", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Delivery Risk</Label>
                <Select
                  value={member.delivery_risk}
                  onValueChange={(value) => updateMemberNeedingAttention(index, "delivery_risk", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addMemberNeedingAttention}>
            <Plus className="h-4 w-4 mr-2" /> Add Member Needing Attention
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
