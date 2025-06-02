"use client"
import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import TextareaWithAI from "../ui/textarea-with-ai"
import { Input } from "@/components/ui/input"
import InputWithAI from "../ui/input-with-ai"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PersonalUpdatesSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

interface WinItem {
  id: string;
  text: string;
}

export default function PersonalUpdatesSection({ form }: PersonalUpdatesSectionProps) {
  const { register, watch, setValue } = form
  const personalWins = watch("personal_updates.personal_wins")
  const reflections = watch("personal_updates.reflections")
  const goals = watch("personal_updates.goals")
  const supportNeeded = watch("personal_updates.support_needed")
  
  // Convert array of strings to array of objects with stable IDs
  const [winsWithIds, setWinsWithIds] = useState<WinItem[]>(() => {
    return Array.isArray(personalWins) 
      ? personalWins.map((text, i) => ({ id: `win-${Date.now()}-${i}`, text }))
      : [{ id: `win-${Date.now()}`, text: '' }];
  });
  
  // Sync when personalWins change externally (like form load)
  useEffect(() => {
    if (Array.isArray(personalWins)) {
      // Only update if the content is different to avoid loops
      const winTexts = winsWithIds.map(item => item.text);
      const hasChanges = personalWins.length !== winTexts.length || 
        personalWins.some((text, i) => text !== winTexts[i]);
      
      if (hasChanges) {
        setWinsWithIds(personalWins.map((text, i) => ({ id: `win-${Date.now()}-${i}`, text })));
      }
    }
  }, [personalWins]);

  // Personal Wins
  const addPersonalWin = () => {
    const newWinsWithIds = [...winsWithIds, { id: `win-${Date.now()}`, text: "" }];
    setWinsWithIds(newWinsWithIds);
    
    // Update the form with just the text values
    const textValues = newWinsWithIds.map(item => item.text);
    setValue("personal_updates.personal_wins", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removePersonalWin = (idToRemove: string) => {
    const updatedItems = winsWithIds.filter(item => item.id !== idToRemove);
    const finalItems = updatedItems.length ? updatedItems : [{ id: `win-${Date.now()}`, text: '' }];
    setWinsWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    setValue("personal_updates.personal_wins", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  interface ReflectionItem {
    id: string;
    text: string;
  }
  
  // Convert reflections array to objects with stable IDs
  const [reflectionsWithIds, setReflectionsWithIds] = useState<ReflectionItem[]>(() => {
    return Array.isArray(reflections) 
      ? reflections.map((text, i) => ({ id: `reflection-${Date.now()}-${i}`, text }))
      : [{ id: `reflection-${Date.now()}`, text: '' }];
  });
  
  // Sync when reflections change externally (like form load)
  useEffect(() => {
    if (Array.isArray(reflections)) {
      // Only update if the content is different to avoid loops
      const reflectionTexts = reflectionsWithIds.map(item => item.text);
      const hasChanges = reflections.length !== reflectionTexts.length || 
        reflections.some((text, i) => text !== reflectionTexts[i]);
      
      if (hasChanges) {
        setReflectionsWithIds(reflections.map((text, i) => ({ id: `reflection-${Date.now()}-${i}`, text })));
      }
    }
  }, [reflections]);
  
  // Reflections
  const addReflection = () => {
    const newReflectionsWithIds = [...reflectionsWithIds, { id: `reflection-${Date.now()}`, text: "" }];
    setReflectionsWithIds(newReflectionsWithIds);
    
    // Update the form with just the text values
    const textValues = newReflectionsWithIds.map(item => item.text);
    setValue("personal_updates.reflections", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeReflection = (idToRemove: string) => {
    const updatedItems = reflectionsWithIds.filter(item => item.id !== idToRemove);
    const finalItems = updatedItems.length ? updatedItems : [{ id: `reflection-${Date.now()}`, text: '' }];
    setReflectionsWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    setValue("personal_updates.reflections", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
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
            {winsWithIds.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr,auto] gap-2 mt-2">
                <TextareaWithAI
                  placeholder="Successfully led a cross-functional meeting"
                  value={item.text}
                  aiContext="personal_wins"
                  className="min-h-[100px] w-full"
                  onChange={(e) => {
                    const updated = winsWithIds.map(win => 
                      win.id === item.id ? { ...win, text: e.target.value } : win
                    );
                    setWinsWithIds(updated);
                    
                    // Update the form with just the text values
                    const textValues = updated.map(win => win.text);
                    setValue("personal_updates.personal_wins", textValues, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                  onValueChange={(value) => {
                    const updated = winsWithIds.map(win => 
                      win.id === item.id ? { ...win, text: value } : win
                    );
                    setWinsWithIds(updated);
                    
                    // Update the form with just the text values
                    const textValues = updated.map(win => win.text);
                    setValue("personal_updates.personal_wins", textValues, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                />
                <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removePersonalWin(item.id)}>
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

      {/* Reflections */}
      <Card>
        <CardHeader>
          <CardTitle>Reflections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>What did you learn this week? Any mindset shifts or challenges you encountered?</Label>
            {reflectionsWithIds.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr,auto] gap-2 mt-2">
                <TextareaWithAI
                  placeholder="Learned the importance of setting clear expectations"
                  value={item.text}
                  aiContext="reflections"
                  className="min-h-[100px] w-full"
                  onChange={(e) => {
                    const updated = reflectionsWithIds.map(reflection => 
                      reflection.id === item.id ? { ...reflection, text: e.target.value } : reflection
                    );
                    setReflectionsWithIds(updated);
                    
                    // Update the form with just the text values
                    const textValues = updated.map(reflection => reflection.text);
                    setValue("personal_updates.reflections", textValues, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                  onValueChange={(value) => {
                    const updated = reflectionsWithIds.map(reflection => 
                      reflection.id === item.id ? { ...reflection, text: value } : reflection
                    );
                    setReflectionsWithIds(updated);
                    
                    // Update the form with just the text values
                    const textValues = updated.map(reflection => reflection.text);
                    setValue("personal_updates.reflections", textValues, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                />
                <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeReflection(item.id)}>
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
          <div className="space-y-6">
            {goals.map((goal, index) => (
              <div key={`goal-${index}`} className="border rounded-md p-4 space-y-4">
                <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                  <div>
                    <Label className="mb-1 block">Goal</Label>
                    <InputWithAI
                      placeholder="Improve team velocity by 10%"
                      value={goal.description}
                      aiContext="goal_description"
                      className="w-full"
                      onChange={(e) => updateGoalField(index, "description", e.target.value)}
                      onValueChange={(value) => updateGoalField(index, "description", value)}
                    />
                  </div>
                  <div className="flex items-start space-x-2">
                    <div>
                      <Label className="mb-1 block">Status</Label>
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
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGoal(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-1 block">This Week's Update</Label>
                  <TextareaWithAI
                    placeholder="Short update on progress"
                    value={goal.update}
                    aiContext="goal_update"
                    className="min-h-[80px] w-full"
                    onChange={(e) => updateGoalField(index, "update", e.target.value)}
                    onValueChange={(value) => updateGoalField(index, "update", value)}
                  />
                </div>
              </div>
            ))}
          </div>
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
            <TextareaWithAI
              id="personal_updates.support_needed"
              placeholder="Need guidance on prioritizing competing deadlines"
              className="mt-1"
              aiContext="support_needed"
              value={supportNeeded}
              onChange={(e) => setValue("personal_updates.support_needed", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
