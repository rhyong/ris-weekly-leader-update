"use client"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PersonalUpdatesSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function PersonalUpdatesSection({ form }: PersonalUpdatesSectionProps) {
  const { register, watch, setValue } = form
  const personalWins = watch("personal_updates.personal_wins")
  const leadershipFocus = watch("personal_updates.leadership_focus")
  const reflections = watch("personal_updates.reflections")
  const goals = watch("personal_updates.goals")
  const supportNeeded = watch("personal_updates.support_needed")

  // Personal Wins
  const addPersonalWin = () => {
    setValue("personal_updates.personal_wins", [...personalWins, ""])
  }

  const removePersonalWin = (index: number) => {
    const updated = personalWins.filter((_, i) => i !== index)
    setValue("personal_updates.personal_wins", updated.length ? updated : [""])
  }

  // Leadership Focus
  const updateLeadershipFocus = (field: string, value: string) => {
    setValue(`personal_updates.leadership_focus.${field}` as any, value)
  }

  // Reflections
  const addReflection = () => {
    setValue("personal_updates.reflections", [...reflections, ""])
  }

  const removeReflection = (index: number) => {
    const updated = reflections.filter((_, i) => i !== index)
    setValue("personal_updates.reflections", updated.length ? updated : [""])
  }

  // Goals
  const addGoal = () => {
    setValue("personal_updates.goals", [...goals, { description: "", status: "Green", update: "" }])
  }

  const removeGoal = (index: number) => {
    const updated = goals.filter((_, i) => i !== index)
    setValue("personal_updates.goals", updated.length ? updated : [{ description: "", status: "Green", update: "" }])
  }

  const updateGoalStatus = (index: number, status: TrafficLight) => {
    const updated = [...goals]
    updated[index] = { ...updated[index], status }
    setValue("personal_updates.goals", updated)
  }

  const updateGoalField = (index: number, field: string, value: string) => {
    const updated = [...goals]
    updated[index] = { ...updated[index], [field]: value }
    setValue("personal_updates.goals", updated)
  }

  return (
    <div className="space-y-6">
      {/* Personal Wins or Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Wins or Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>What went well this week? Any personal or professional wins to share?</Label>
            {personalWins.map((item, index) => (
              <div key={`win-${index}`} className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Successfully led a cross-functional meeting"
                  value={item}
                  onChange={(e) => {
                    const updated = [...personalWins]
                    updated[index] = e.target.value
                    setValue("personal_updates.personal_wins", updated)
                  }}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removePersonalWin(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addPersonalWin}>
              <Plus className="h-4 w-4 mr-2" /> Add Win
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leadership Focus */}
      <Card>
        <CardHeader>
          <CardTitle>Leadership Focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="leadership_focus.skill">What leadership skill or behavior are you focusing on?</Label>
            <Input
              id="leadership_focus.skill"
              placeholder="Delegation, Active Listening, Strategic Thinking, etc."
              className="mt-1"
              value={leadershipFocus.skill}
              onChange={(e) => updateLeadershipFocus("skill", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="leadership_focus.practice">How are you practicing or improving it?</Label>
            <Textarea
              id="leadership_focus.practice"
              placeholder="Specific actions you're taking to improve this skill"
              className="mt-1"
              value={leadershipFocus.practice}
              onChange={(e) => updateLeadershipFocus("practice", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reflections */}
      <Card>
        <CardHeader>
          <CardTitle>Reflections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>What did you learn this week? Any mindset shifts or challenges you encountered?</Label>
            {reflections.map((item, index) => (
              <div key={`reflection-${index}`} className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Learned the importance of setting clear expectations"
                  value={item}
                  onChange={(e) => {
                    const updated = [...reflections]
                    updated[index] = e.target.value
                    setValue("personal_updates.reflections", updated)
                  }}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeReflection(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addReflection}>
              <Plus className="h-4 w-4 mr-2" /> Add Reflection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goal Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Goal</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[30%]">This Week's Update</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal, index) => (
                <TableRow key={`goal-${index}`}>
                  <TableCell>
                    <Input
                      placeholder="Improve team velocity by 10%"
                      value={goal.description}
                      onChange={(e) => updateGoalField(index, "description", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={goal.status}
                      onValueChange={(value) => updateGoalStatus(index, value as TrafficLight)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Green">
                          <div className="flex items-center">
                            <span className="mr-2">🟢</span> On Track
                          </div>
                        </SelectItem>
                        <SelectItem value="Yellow">
                          <div className="flex items-center">
                            <span className="mr-2">🟡</span> At Risk
                          </div>
                        </SelectItem>
                        <SelectItem value="Red">
                          <div className="flex items-center">
                            <span className="mr-2">🔴</span> Off Track
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Short update on progress"
                      value={goal.update}
                      onChange={(e) => updateGoalField(index, "update", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGoal(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-2">
            <Button type="button" variant="outline" size="sm" onClick={addGoal} disabled={goals.length >= 3}>
              <Plus className="h-4 w-4 mr-2" /> Add Goal (Max 3)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Please list 1–3 goals and update their status.</p>
        </CardContent>
      </Card>

      {/* Support or Feedback Needed */}
      <Card>
        <CardHeader>
          <CardTitle>Support or Feedback Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="personal_updates.support_needed">
              What support do you need from your leader or peers? Any blockers or decisions you'd like input on?
            </Label>
            <Textarea
              id="personal_updates.support_needed"
              placeholder="Need guidance on prioritizing competing deadlines"
              className="mt-1"
              value={supportNeeded}
              onChange={(e) => setValue("personal_updates.support_needed", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
