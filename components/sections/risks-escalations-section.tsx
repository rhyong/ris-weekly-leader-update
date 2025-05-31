"use client"

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

  const addEscalation = () => {
    setValue("risks_escalations.escalations", [...escalations, ""])
  }

  const removeEscalation = (index: number) => {
    const updated = escalations.filter((_, i) => i !== index)
    setValue("risks_escalations.escalations", updated.length ? updated : [""])
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
          {escalations.map((item, index) => (
            <div key={`escalation-${index}`} className="flex items-center gap-2 mt-2">
              <InputWithAI
                placeholder="Need VP approval for additional resources"
                value={item}
                aiContext="escalations"
                onChange={(e) => {
                  const updated = [...escalations]
                  updated[index] = e.target.value
                  setValue("risks_escalations.escalations", updated)
                }}
                onValueChange={(value) => {
                  const updated = [...escalations]
                  updated[index] = value
                  setValue("risks_escalations.escalations", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeEscalation(index)}>
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
