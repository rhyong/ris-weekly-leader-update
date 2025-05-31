"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import AIEnhanceButton from "@/components/ui/ai-enhance-button"

interface InputWithAIProps extends React.InputHTMLAttributes<HTMLInputElement> {
  aiContext?: string
  onValueChange?: (value: string) => void
}

export default function InputWithAI({
  value,
  aiContext = "default",
  onChange,
  onValueChange,
  className,
  ...props
}: InputWithAIProps) {
  const [localValue, setLocalValue] = useState<string>(value as string || "")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } as React.ChangeEvent<HTMLInputElement>
    
    if (onChange) {
      onChange(syntheticEvent)
    }
    if (onValueChange) {
      onValueChange(enhancedText)
    }
  }

  return (
    <div className="relative">
      <Input
        value={localValue}
        onChange={handleChange}
        className={`pr-10 ${className || ""}`}
        {...props}
      />
      <div className="absolute top-1/2 right-1 transform -translate-y-1/2">
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