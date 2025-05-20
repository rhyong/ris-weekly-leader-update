"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface SupportNeededSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function SupportNeededSection({ form }: SupportNeededSectionProps) {
  const { register, watch, setValue } = form
  const requests = watch("support_needed.requests")

  const addRequest = () => {
    setValue("support_needed.requests", [...requests, ""])
  }

  const removeRequest = (index: number) => {
    const updated = requests.filter((_, i) => i !== index)
    setValue("support_needed.requests", updated.length ? updated : [""])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Needed</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Support Requests</Label>
          {requests.map((item, index) => (
            <div key={`request-${index}`} className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Need contractor budget to cover DevOps gap"
                value={item}
                onChange={(e) => {
                  const updated = [...requests]
                  updated[index] = e.target.value
                  setValue("support_needed.requests", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRequest(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRequest}>
            <Plus className="h-4 w-4 mr-2" /> Add Support Request
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
