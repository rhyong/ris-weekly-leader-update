"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import TextareaWithAI from "../ui/textarea-with-ai"

// Define a typed item with an ID
interface RequestItem {
  id: string;
  text: string;
}

interface SupportNeededSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function SupportNeededSection({ form }: SupportNeededSectionProps) {
  const { register, watch, setValue } = form
  const requests = watch("support_needed.requests")

  // Convert array of strings to array of objects with stable IDs
  const [requestsWithIds, setRequestsWithIds] = useState<RequestItem[]>(() => {
    return Array.isArray(requests) 
      ? requests.map((text, i) => ({ id: `request-${Date.now()}-${i}`, text }))
      : [{ id: `request-${Date.now()}`, text: '' }];
  });
  
  // Sync when requests change externally (like form load)
  useEffect(() => {
    if (Array.isArray(requests)) {
      // Only update if the content is different to avoid loops
      const requestTexts = requestsWithIds.map(item => item.text);
      const hasChanges = requests.length !== requestTexts.length || 
        requests.some((text, i) => text !== requestTexts[i]);
      
      if (hasChanges) {
        setRequestsWithIds(requests.map((text, i) => ({ id: `request-${Date.now()}-${i}`, text })));
      }
    }
  }, [requests]);

  const addRequest = () => {
    const newItems = [...requestsWithIds, { id: `request-${Date.now()}`, text: "" }];
    setRequestsWithIds(newItems);
    
    // Update the form with just the text values
    const textValues = newItems.map(item => item.text);
    setValue("support_needed.requests", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeRequest = (idToRemove: string) => {
    const updatedItems = requestsWithIds.filter(item => item.id !== idToRemove);
    const finalItems = updatedItems.length ? updatedItems : [{ id: `request-${Date.now()}`, text: '' }];
    setRequestsWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    setValue("support_needed.requests", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Needed</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Support Requests</Label>
          {requestsWithIds.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr,auto] gap-2 mt-2">
              <TextareaWithAI
                placeholder="Need contractor budget to cover DevOps gap"
                value={item.text}
                aiContext="support_needed"
                className="min-h-[100px] w-full"
                onChange={(e) => {
                  const updated = requestsWithIds.map(request => 
                    request.id === item.id ? { ...request, text: e.target.value } : request
                  );
                  setRequestsWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(request => request.text);
                  setValue("support_needed.requests", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
                onValueChange={(value) => {
                  const updated = requestsWithIds.map(request => 
                    request.id === item.id ? { ...request, text: value } : request
                  );
                  setRequestsWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(request => request.text);
                  setValue("support_needed.requests", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeRequest(item.id)}>
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
