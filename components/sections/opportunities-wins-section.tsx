"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import TrafficLightIndicator from "../ui/traffic-light-indicator"
import TextareaWithAI from "../ui/textarea-with-ai"

interface OpportunitiesWinsSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

// Define typed items with IDs
interface WinItem {
  id: string;
  text: string;
}

interface GrowthOpItem {
  id: string;
  text: string;
}

export default function OpportunitiesWinsSection({ form }: OpportunitiesWinsSectionProps) {
  const { register, watch, setValue } = form
  const wins = watch("opportunities_wins.wins")
  const growthOps = watch("opportunities_wins.growth_ops")

  // Convert array of strings to array of objects with stable IDs
  const [winsWithIds, setWinsWithIds] = useState<WinItem[]>(() => {
    return Array.isArray(wins) 
      ? wins.map((text, i) => ({ id: `win-${Date.now()}-${i}`, text }))
      : [{ id: `win-${Date.now()}`, text: '' }];
  });
  
  // Sync when wins change externally (like form load)
  useEffect(() => {
    if (Array.isArray(wins)) {
      // Only update if the content is different to avoid loops
      const winTexts = winsWithIds.map(item => item.text);
      const hasChanges = wins.length !== winTexts.length || 
        wins.some((text, i) => text !== winTexts[i]);
      
      if (hasChanges) {
        setWinsWithIds(wins.map((text, i) => ({ id: `win-${Date.now()}-${i}`, text })));
      }
    }
  }, [wins]);

  // Convert array of strings to array of objects with stable IDs for growth ops
  const [growthOpsWithIds, setGrowthOpsWithIds] = useState<GrowthOpItem[]>(() => {
    return Array.isArray(growthOps) 
      ? growthOps.map((text, i) => ({ id: `growth-${Date.now()}-${i}`, text }))
      : [{ id: `growth-${Date.now()}`, text: '' }];
  });
  
  // Sync when growth ops change externally (like form load)
  useEffect(() => {
    if (Array.isArray(growthOps)) {
      // Only update if the content is different to avoid loops
      const growthOpTexts = growthOpsWithIds.map(item => item.text);
      const hasChanges = growthOps.length !== growthOpTexts.length || 
        growthOps.some((text, i) => text !== growthOpTexts[i]);
      
      if (hasChanges) {
        setGrowthOpsWithIds(growthOps.map((text, i) => ({ id: `growth-${Date.now()}-${i}`, text })));
      }
    }
  }, [growthOps]);

  const addWin = () => {
    const newItems = [...winsWithIds, { id: `win-${Date.now()}`, text: "" }];
    setWinsWithIds(newItems);
    
    // Update the form with just the text values
    const textValues = newItems.map(item => item.text);
    setValue("opportunities_wins.wins", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeWin = (idToRemove: string) => {
    const updatedItems = winsWithIds.filter(item => item.id !== idToRemove);
    const finalItems = updatedItems.length ? updatedItems : [{ id: `win-${Date.now()}`, text: '' }];
    setWinsWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    setValue("opportunities_wins.wins", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const addGrowthOp = () => {
    const newItems = [...growthOpsWithIds, { id: `growth-${Date.now()}`, text: "" }];
    setGrowthOpsWithIds(newItems);
    
    // Update the form with just the text values
    const textValues = newItems.map(item => item.text);
    setValue("opportunities_wins.growth_ops", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeGrowthOp = (idToRemove: string) => {
    const updatedItems = growthOpsWithIds.filter(item => item.id !== idToRemove);
    const finalItems = updatedItems.length ? updatedItems : [{ id: `growth-${Date.now()}`, text: '' }];
    setGrowthOpsWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    setValue("opportunities_wins.growth_ops", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Opportunities & Wins</CardTitle>
        <TrafficLightIndicator value="Green" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Wins</Label>
          {winsWithIds.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr,auto] gap-2 mt-2">
              <TextareaWithAI
                placeholder="Reduced build time by 30%"
                value={item.text}
                aiContext="wins"
                className="min-h-[100px] w-full"
                onChange={(e) => {
                  const updated = winsWithIds.map(win => 
                    win.id === item.id ? { ...win, text: e.target.value } : win
                  );
                  setWinsWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(win => win.text);
                  setValue("opportunities_wins.wins", textValues, {
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
                  setValue("opportunities_wins.wins", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeWin(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addWin}>
            <Plus className="h-4 w-4 mr-2" /> Add Win
          </Button>
        </div>

        <div>
          <Label>Growth Opportunities</Label>
          {growthOpsWithIds.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr,auto] gap-2 mt-2">
              <TextareaWithAI
                placeholder="AI build-copilot POC proposed"
                value={item.text}
                aiContext="growth_opportunities"
                className="min-h-[100px] w-full"
                onChange={(e) => {
                  const updated = growthOpsWithIds.map(growthOp => 
                    growthOp.id === item.id ? { ...growthOp, text: e.target.value } : growthOp
                  );
                  setGrowthOpsWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(growthOp => growthOp.text);
                  setValue("opportunities_wins.growth_ops", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
                onValueChange={(value) => {
                  const updated = growthOpsWithIds.map(growthOp => 
                    growthOp.id === item.id ? { ...growthOp, text: value } : growthOp
                  );
                  setGrowthOpsWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(growthOp => growthOp.text);
                  setValue("opportunities_wins.growth_ops", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeGrowthOp(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addGrowthOp}>
            <Plus className="h-4 w-4 mr-2" /> Add Growth Opportunity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
