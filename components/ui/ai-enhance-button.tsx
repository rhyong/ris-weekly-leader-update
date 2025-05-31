"use client"

import React, { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AIEnhanceButtonProps {
  text: string
  context: string
  onEnhancedText: (text: string) => void
  disabled?: boolean
}

export default function AIEnhanceButton({
  text,
  context,
  onEnhancedText,
  disabled = false,
}: AIEnhanceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleEnhance = async () => {
    if (disabled || isLoading || !text || text.trim().length < 3) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, context }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance text')
      }

      if (data.enhanced) {
        onEnhancedText(data.enhancedText)
        toast({
          title: 'Text enhanced',
          description: 'AI has improved your text.',
        })
      } else {
        toast({
          title: 'Text not enhanced',
          description: data.message || 'No enhancement was possible.',
        })
      }
    } catch (error: any) {
      console.error('Error enhancing text:', error)
      toast({
        title: 'Enhancement failed',
        description: error.message || 'Could not enhance text at this time.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleEnhance}
            disabled={disabled || isLoading || !text || text.trim().length < 3}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="sr-only">Enhance with AI</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enhance with AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}