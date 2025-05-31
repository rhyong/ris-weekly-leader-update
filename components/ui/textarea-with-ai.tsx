"use client"

import React, { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import AIEnhanceButton from "@/components/ui/ai-enhance-button"

interface TextareaWithAIProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  aiContext?: string
  onValueChange?: (value: string) => void
}

export default function TextareaWithAI({
  value,
  aiContext = "default",
  onChange,
  onValueChange,
  className,
  ...props
}: TextareaWithAIProps) {
  const [localValue, setLocalValue] = useState<string>(value as string || "")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value)
    if (onChange) {
      onChange(e)
    }
    if (onValueChange) {
      onValueChange(e.target.value)
    }
  }

  const handleEnhancedText = (enhancedText: string) => {
    setLocalValue(enhancedText)
    
    // Create a synthetic event to simulate user input
    const syntheticEvent = {
      target: {
        value: enhancedText,
        name: props.name,
        id: props.id
      },
      currentTarget: {
        value: enhancedText,
        name: props.name,
        id: props.id
      }
    } as React.ChangeEvent<HTMLTextAreaElement>
    
    if (onChange) {
      onChange(syntheticEvent)
    }
    if (onValueChange) {
      onValueChange(enhancedText)
    }
  }

  return (
    <div className="relative">
      <Textarea
        value={localValue}
        onChange={handleChange}
        className={`pr-10 ${className || ""}`}
        {...props}
      />
      <div className="absolute top-1 right-1">
        <AIEnhanceButton
          text={localValue}
          context={aiContext}
          onEnhancedText={handleEnhancedText}
          disabled={!localValue || localValue.length < 3}
        />
      </div>
    </div>
  )
}