"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import TrafficLightIndicator from "../ui/traffic-light-indicator"
import InputWithAI from "../ui/input-with-ai"
import TextareaWithAI from "../ui/textarea-with-ai"

interface RisksEscalationsSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function RisksEscalationsSection({ form }: RisksEscalationsSectionProps) {
  const { register, watch, setValue } = form
  const risks = watch("risks_escalations.risks")
  const escalations = watch("risks_escalations.escalations")

  const addRisk = () => {
    setValue("risks_escalations.risks", [...risks, { title: "", description: "", severity: "Green" }])
  }

  const removeRisk = (index: number) => {
    const updated = risks.filter((_, i) => i !== index)
    setValue("risks_escalations.risks", updated.length ? updated : [{ title: "", description: "", severity: "Green" }])
  }

  const updateRiskSeverity = (index: number, value: string) => {
    const updated = [...risks]
    updated[index] = { ...updated[index], severity: value as TrafficLight }
    setValue("risks_escalations.risks", updated)
  }

  interface EscalationItem {
    id: string;
    text: string;
  }
  
  // Convert array of strings to array of objects with stable IDs
  const [escalationsWithIds, setEscalationsWithIds] = useState<EscalationItem[]>(() => {
    return Array.isArray(escalations) 
      ? escalations.map((text, i) => ({ id: `escalation-${Date.now()}-${i}`, text }))
      : [{ id: `escalation-${Date.now()}`, text: '' }];
  });
  
  // Sync when escalations change externally (like form load)
  useEffect(() => {
    if (Array.isArray(escalations)) {
      // Only update if the content is different to avoid loops
      const escalationTexts = escalationsWithIds.map(item => item.text);
      const hasChanges = escalations.length !== escalationTexts.length || 
        escalations.some((text, i) => text !== escalationTexts[i]);
      
      if (hasChanges) {
        setEscalationsWithIds(escalations.map((text, i) => ({ id: `escalation-${Date.now()}-${i}`, text })));
      }
    }
  }, [escalations]);

  const addEscalation = () => {
    const newItems = [...escalationsWithIds, { id: `escalation-${Date.now()}`, text: "" }];
    setEscalationsWithIds(newItems);
    
    // Update the form with just the text values
    const textValues = newItems.map(item => item.text);
    setValue("risks_escalations.escalations", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeEscalation = (idToRemove: string) => {
    const updatedItems = escalationsWithIds.filter(item => item.id !== idToRemove);
    const finalItems = updatedItems.length ? updatedItems : [{ id: `escalation-${Date.now()}`, text: '' }];
    setEscalationsWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    setValue("risks_escalations.escalations", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  // Determine overall risk traffic light (worst case)
  const riskTrafficLight: TrafficLight = risks.some((r) => r.severity === "Red")
    ? "Red"
    : risks.some((r) => r.severity === "Yellow")
      ? "Yellow"
      : "Green"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Risks & Escalations</CardTitle>
        <TrafficLightIndicator value={riskTrafficLight} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Risks</Label>
          {risks.map((risk, index) => (
            <div key={`risk-${index}`} className="mt-3 p-3 border rounded-md">
              <div className="flex items-center gap-2">
                <InputWithAI
                  placeholder="Risk title"
                  value={risk.title}
                  aiContext="risks"
                  onChange={(e) => {
                    const updated = [...risks]
                    updated[index] = { ...updated[index], title: e.target.value }
                    setValue("risks_escalations.risks", updated)
                  }}
                  onValueChange={(value) => {
                    const updated = [...risks]
                    updated[index] = { ...updated[index], title: value }
                    setValue("risks_escalations.risks", updated)
                  }}
                />
                <Select value={risk.severity} onValueChange={(value) => updateRiskSeverity(index, value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Green">Low</SelectItem>
                    <SelectItem value="Yellow">Medium</SelectItem>
                    <SelectItem value="Red">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRisk(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <TextareaWithAI
                placeholder="Risk description and mitigation plan"
                className="mt-2"
                value={risk.description}
                aiContext="risks"
                onChange={(e) => {
                  const updated = [...risks]
                  updated[index] = { ...updated[index], description: e.target.value }
                  setValue("risks_escalations.risks", updated)
                }}
                onValueChange={(value) => {
                  const updated = [...risks]
                  updated[index] = { ...updated[index], description: value }
                  setValue("risks_escalations.risks", updated)
                }}
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRisk}>
            <Plus className="h-4 w-4 mr-2" /> Add Risk
          </Button>
        </div>

        <div>
          <Label>Escalations</Label>
          {escalationsWithIds.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr,auto] gap-2 mt-2">
              <TextareaWithAI
                placeholder="Need VP approval for additional resources"
                value={item.text}
                aiContext="escalations"
                className="min-h-[100px] w-full"
                onChange={(e) => {
                  const updated = escalationsWithIds.map(escalation => 
                    escalation.id === item.id ? { ...escalation, text: e.target.value } : escalation
                  );
                  setEscalationsWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(escalation => escalation.text);
                  setValue("risks_escalations.escalations", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
                onValueChange={(value) => {
                  const updated = escalationsWithIds.map(escalation => 
                    escalation.id === item.id ? { ...escalation, text: value } : escalation
                  );
                  setEscalationsWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(escalation => escalation.text);
                  setValue("risks_escalations.escalations", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeEscalation(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addEscalation}>
            <Plus className="h-4 w-4 mr-2" /> Add Escalation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
