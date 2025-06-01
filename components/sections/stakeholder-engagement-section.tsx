"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { WeeklyUpdateFormData, TrafficLight } from "../weekly-update-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import TextareaWithAI from "../ui/textarea-with-ai"

// Define a typed item with an ID
interface FeedbackItem {
  id: string;
  text: string;
}

interface StakeholderEngagementSectionProps {
  form: UseFormReturn<WeeklyUpdateFormData>
}

export default function StakeholderEngagementSection({ form }: StakeholderEngagementSectionProps) {
  const { register, watch, setValue } = form
  const feedbackNotes = watch("stakeholder_engagement.feedback_notes")

  // Convert array of strings to array of objects with stable IDs
  const [feedbackWithIds, setFeedbackWithIds] = useState<FeedbackItem[]>(() => {
    return Array.isArray(feedbackNotes) 
      ? feedbackNotes.map((text, i) => ({ id: `feedback-${Date.now()}-${i}`, text }))
      : [{ id: `feedback-${Date.now()}`, text: '' }];
  });
  
  // Sync when feedbackNotes change externally (like form load)
  useEffect(() => {
    if (Array.isArray(feedbackNotes)) {
      // Only update if the content is different to avoid loops
      const feedbackTexts = feedbackWithIds.map(item => item.text);
      const hasChanges = feedbackNotes.length !== feedbackTexts.length || 
        feedbackNotes.some((text, i) => text !== feedbackTexts[i]);
      
      if (hasChanges) {
        setFeedbackWithIds(feedbackNotes.map((text, i) => ({ id: `feedback-${Date.now()}-${i}`, text })));
      }
    }
  }, [feedbackNotes]);

  const addFeedbackNote = () => {
    const newItems = [...feedbackWithIds, { id: `feedback-${Date.now()}`, text: "" }];
    setFeedbackWithIds(newItems);
    
    // Update the form with just the text values
    const textValues = newItems.map(item => item.text);
    setValue("stakeholder_engagement.feedback_notes", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  const removeFeedbackNote = (idToRemove: string) => {
    const updatedItems = feedbackWithIds.filter(item => item.id !== idToRemove);
    const finalItems = updatedItems.length ? updatedItems : [{ id: `feedback-${Date.now()}`, text: '' }];
    setFeedbackWithIds(finalItems);
    
    // Update the form with just the text values
    const textValues = finalItems.map(item => item.text);
    setValue("stakeholder_engagement.feedback_notes", textValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stakeholder Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Feedback Notes</Label>
          {feedbackWithIds.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr,auto] gap-2 mt-2">
              <TextareaWithAI
                placeholder="Client praised incident handling"
                value={item.text}
                aiContext="stakeholder_feedback"
                className="min-h-[100px] w-full"
                onChange={(e) => {
                  const updated = feedbackWithIds.map(feedback => 
                    feedback.id === item.id ? { ...feedback, text: e.target.value } : feedback
                  );
                  setFeedbackWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(feedback => feedback.text);
                  setValue("stakeholder_engagement.feedback_notes", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
                onValueChange={(value) => {
                  const updated = feedbackWithIds.map(feedback => 
                    feedback.id === item.id ? { ...feedback, text: value } : feedback
                  );
                  setFeedbackWithIds(updated);
                  
                  // Update the form with just the text values
                  const textValues = updated.map(feedback => feedback.text);
                  setValue("stakeholder_engagement.feedback_notes", textValues, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeFeedbackNote(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addFeedbackNote}>
            <Plus className="h-4 w-4 mr-2" /> Add Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
