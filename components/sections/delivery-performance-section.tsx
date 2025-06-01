"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight, WorkloadBalance } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2 } from "lucide-react"
import TrafficLightIndicator from "../ui/traffic-light-indicator"
import InputWithAI from "../ui/input-with-ai"

// Define a typed item with an ID
interface AccomplishmentItem {
  id: string;
  text: string;
}

interface MissDelayItem {
  id: string;
  text: string;
}

interface DeliveryPerformanceSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function DeliveryPerformanceSection({ form }: DeliveryPerformanceSectionProps) {
  const { register, watch, setValue } = form
  const rawAccomplishments = watch("delivery_performance.accomplishments")
  const rawMissesDelays = watch("delivery_performance.misses_delays")
  const workloadBalance = watch("delivery_performance.workload_balance")

  // State for tracked accomplishments with IDs
  const [accomplishmentsWithIds, setAccomplishmentsWithIds] = useState<AccomplishmentItem[]>([]);
  
  // State for tracked misses/delays with IDs
  const [missesDelaysWithIds, setMissesDelaysWithIds] = useState<MissDelayItem[]>([]);

  // Update internal state whenever form values change
  useEffect(() => {
    // Initialize or update accomplishments with IDs
    setAccomplishmentsWithIds(current => {
      // If lengths don't match, we need to rebuild
      if (current.length !== rawAccomplishments.length) {
        return rawAccomplishments.map((text, i) => {
          // Try to preserve existing IDs when possible
          const existingItem = current[i];
          return {
            id: existingItem?.id || `acc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            text
          };
        });
      } else {
        // Just update text values if length matches
        return current.map((item, i) => ({
          ...item,
          text: rawAccomplishments[i]
        }));
      }
    });
  }, [rawAccomplishments]);

  // Update internal state whenever form values change for misses/delays
  useEffect(() => {
    // Initialize or update misses/delays with IDs
    setMissesDelaysWithIds(current => {
      // If lengths don't match, we need to rebuild
      if (current.length !== rawMissesDelays.length) {
        return rawMissesDelays.map((text, i) => {
          // Try to preserve existing IDs when possible
          const existingItem = current[i];
          return {
            id: existingItem?.id || `miss-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            text
          };
        });
      } else {
        // Just update text values if length matches
        return current.map((item, i) => ({
          ...item,
          text: rawMissesDelays[i]
        }));
      }
    });
  }, [rawMissesDelays]);

  const addAccomplishment = () => {
    const newItem = { id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text: '' };
    const newArray = [...accomplishmentsWithIds, newItem];
    setAccomplishmentsWithIds(newArray);
    setValue("delivery_performance.accomplishments", newArray.map(item => item.text), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeAccomplishment = (idToRemove: string) => {
    console.log(`Removing accomplishment with ID ${idToRemove}`);
    
    const updatedItems = accomplishmentsWithIds.filter(item => item.id !== idToRemove);
    console.log("Updated items:", updatedItems);
    
    const finalItems = updatedItems.length ? updatedItems : [{ id: `acc-${Date.now()}`, text: '' }];
    setAccomplishmentsWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    console.log("Setting form values:", textValues);
    setValue("delivery_performance.accomplishments", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    form.trigger("delivery_performance.accomplishments");
  }

  const addMissDelay = () => {
    const newItem = { id: `miss-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text: '' };
    const newArray = [...missesDelaysWithIds, newItem];
    setMissesDelaysWithIds(newArray);
    setValue("delivery_performance.misses_delays", newArray.map(item => item.text), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeMissDelay = (idToRemove: string) => {
    console.log(`Removing miss/delay with ID ${idToRemove}`);
    
    const updatedItems = missesDelaysWithIds.filter(item => item.id !== idToRemove);
    console.log("Updated items:", updatedItems);
    
    const finalItems = updatedItems.length ? updatedItems : [{ id: `miss-${Date.now()}`, text: '' }];
    setMissesDelaysWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    console.log("Setting form values:", textValues);
    setValue("delivery_performance.misses_delays", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    form.trigger("delivery_performance.misses_delays");
  }

  // Determine traffic light based on workload balance and KPIs
  const deliveryTrafficLight: TrafficLight =
    workloadBalance === "JustRight" ? "Green" : workloadBalance === "TooLittle" ? "Yellow" : "Red";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Delivery Performance</CardTitle>
        <TrafficLightIndicator value={deliveryTrafficLight} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Accomplishments</Label>
          {accomplishmentsWithIds.map((item) => (
            <div key={item.id} className="flex items-center gap-2 mt-2 w-full">
              <div className="flex-grow">
                <InputWithAI
                  placeholder="Completed feature X ahead of schedule"
                  value={item.text}
                  aiContext="accomplishments"
                  onChange={(e) => {
                    console.log(`Changing accomplishment ${item.id} to:`, e.target.value);
                    const updatedItems = accomplishmentsWithIds.map(accItem => 
                      accItem.id === item.id 
                        ? { ...accItem, text: e.target.value } 
                        : accItem
                    );
                    setAccomplishmentsWithIds(updatedItems);
                    setValue(
                      "delivery_performance.accomplishments", 
                      updatedItems.map(i => i.text),
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                  onValueChange={(value) => {
                    console.log(`AI changed accomplishment ${item.id} to:`, value);
                    const updatedItems = accomplishmentsWithIds.map(accItem => 
                      accItem.id === item.id 
                        ? { ...accItem, text: value } 
                        : accItem
                    );
                    setAccomplishmentsWithIds(updatedItems);
                    setValue(
                      "delivery_performance.accomplishments", 
                      updatedItems.map(i => i.text),
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`Delete button clicked for accomplishment ${item.id}`);
                  removeAccomplishment(item.id);
                }}
              >
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
          {missesDelaysWithIds.map((item) => (
            <div key={item.id} className="flex items-center gap-2 mt-2 w-full">
              <div className="flex-grow">
                <InputWithAI
                  placeholder="API integration delayed due to vendor issues"
                  value={item.text}
                  aiContext="misses_delays"
                  onChange={(e) => {
                    console.log(`Changing miss/delay ${item.id} to:`, e.target.value);
                    const updatedItems = missesDelaysWithIds.map(missItem => 
                      missItem.id === item.id 
                        ? { ...missItem, text: e.target.value } 
                        : missItem
                    );
                    setMissesDelaysWithIds(updatedItems);
                    setValue(
                      "delivery_performance.misses_delays", 
                      updatedItems.map(i => i.text),
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                  onValueChange={(value) => {
                    console.log(`AI changed miss/delay ${item.id} to:`, value);
                    const updatedItems = missesDelaysWithIds.map(missItem => 
                      missItem.id === item.id 
                        ? { ...missItem, text: value } 
                        : missItem
                    );
                    setMissesDelaysWithIds(updatedItems);
                    setValue(
                      "delivery_performance.misses_delays", 
                      updatedItems.map(i => i.text),
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`Delete button clicked for miss/delay ${item.id}`);
                  removeMissDelay(item.id);
                }}
              >
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
      </CardContent>
    </Card>
  )
}