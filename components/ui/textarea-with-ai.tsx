"use client"

import React, { useState, useEffect } from "react"
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
  // Store the current value as a ref to detect actual changes
  const [localValue, setLocalValue] = useState<string>(value as string || "")
  
  // Update local state when value prop changes - IMPORTANT for React Hook Form
  useEffect(() => {
    console.log(`TextareaWithAI (${props.id || 'unnamed'}): Value prop:`, value);
    
    // Update local value whenever the prop changes, even if it's the same as current
    // This ensures we pick up values from React Hook Form's reset
    if (value !== undefined && value !== null) {
      console.log(`TextareaWithAI (${props.id || 'unnamed'}): Setting local value to:`, value);
      setLocalValue(value as string);
    }
  }, [value, props.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    console.log(`TextareaWithAI (${props.id || 'unnamed'}): handleChange called with:`, newValue);
    setLocalValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  }

  const handleEnhancedText = (enhancedText: string) => {
    console.log(`TextareaWithAI (${props.id || 'unnamed'}): handleEnhancedText called with:`, enhancedText);
    setLocalValue(enhancedText);
    
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
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    if (onChange) {
      onChange(syntheticEvent);
    }
    if (onValueChange) {
      onValueChange(enhancedText);
    }
  }

  // Log when component renders or re-renders
  console.log(`TextareaWithAI (${props.id || 'unnamed'}) rendering with value:`, localValue);

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