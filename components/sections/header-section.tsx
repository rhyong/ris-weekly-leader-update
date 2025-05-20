"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeaderSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function HeaderSection({ form }: HeaderSectionProps) {
  const { register } = form

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
            <Label htmlFor="meta.date">Date</Label>
            <Input id="meta.date" type="date" className="mt-1" {...register("meta.date")} />
          </div>
          <div>
            <Label htmlFor="meta.team_name">Team Name</Label>
            <Select
              onValueChange={(value) => form.setValue("meta.team_name", value)}
              defaultValue={form.watch("meta.team_name")}
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
            defaultValue={form.watch("meta.client_org")}
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
