"use client"

import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight, WorkloadBalance } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2 } from "lucide-react"
import TrafficLightIndicator from "../ui/traffic-light-indicator"

interface DeliveryPerformanceSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function DeliveryPerformanceSection({ form }: DeliveryPerformanceSectionProps) {
  const { register, watch, setValue } = form
  const accomplishments = watch("delivery_performance.accomplishments")
  const missesDelays = watch("delivery_performance.misses_delays")
  const workloadBalance = watch("delivery_performance.workload_balance")

  const addAccomplishment = () => {
    setValue("delivery_performance.accomplishments", [...accomplishments, ""])
  }

  const removeAccomplishment = (index: number) => {
    const updated = accomplishments.filter((_, i) => i !== index)
    setValue("delivery_performance.accomplishments", updated.length ? updated : [""])
  }

  const addMissDelay = () => {
    setValue("delivery_performance.misses_delays", [...missesDelays, ""])
  }

  const removeMissDelay = (index: number) => {
    const updated = missesDelays.filter((_, i) => i !== index)
    setValue("delivery_performance.misses_delays", updated.length ? updated : [""])
  }

  // Determine traffic light based on workload balance and KPIs
  const deliveryTrafficLight: TrafficLight =
    workloadBalance === "JustRight" ? "Green" : workloadBalance === "TooLittle" ? "Yellow" : "Red"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Delivery Performance</CardTitle>
        <TrafficLightIndicator value={deliveryTrafficLight} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Accomplishments</Label>
          {accomplishments.map((item, index) => (
            <div key={`accomplishment-${index}`} className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Completed feature X ahead of schedule"
                value={item}
                onChange={(e) => {
                  const updated = [...accomplishments]
                  updated[index] = e.target.value
                  setValue("delivery_performance.accomplishments", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeAccomplishment(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addAccomplishment}>
            <Plus className="h-4 w-4 mr-2" /> Add Accomplishment
          </Button>
        </div>

        <div>
          <Label>Misses & Delays (optional)</Label>
          {missesDelays.map((item, index) => (
            <div key={`miss-${index}`} className="flex items-center gap-2 mt-2">
              <Input
                placeholder="API integration delayed due to vendor issues"
                value={item}
                onChange={(e) => {
                  const updated = [...missesDelays]
                  updated[index] = e.target.value
                  setValue("delivery_performance.misses_delays", updated)
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeMissDelay(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addMissDelay}>
            <Plus className="h-4 w-4 mr-2" /> Add Miss/Delay
          </Button>
        </div>

        <div>
          <Label>Workload Balance</Label>
          <RadioGroup
            value={workloadBalance}
            onValueChange={(value) => setValue("delivery_performance.workload_balance", value as WorkloadBalance)}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TooLittle" id="workload-little" />
              <Label htmlFor="workload-little">Too Little</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="JustRight" id="workload-right" />
              <Label htmlFor="workload-right">Just Right</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TooMuch" id="workload-much" />
              <Label htmlFor="workload-much">Too Much</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="delivery_performance.kpi_snapshot.velocity_delta">Velocity Delta (%)</Label>
            <Input
              id="delivery_performance.kpi_snapshot.velocity_delta"
              type="number"
              className="mt-1"
              {...register("delivery_performance.kpi_snapshot.velocity_delta", {
                valueAsNumber: true,
              })}
            />
          </div>
          <div>
            <Label htmlFor="delivery_performance.kpi_snapshot.defects">Defects</Label>
            <Input
              id="delivery_performance.kpi_snapshot.defects"
              type="number"
              className="mt-1"
              {...register("delivery_performance.kpi_snapshot.defects", {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
