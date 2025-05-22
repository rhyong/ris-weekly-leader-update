'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Ensure the component is only rendered client-side
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Add effect to remove transition styles from body
  React.useEffect(() => {
    // Remove any transition-related styles from body
    if (document && document.body) {
      const bodyStyle = document.body.style
      bodyStyle.removeProperty('transition-behavior')
      bodyStyle.removeProperty('transition-duration')
      bodyStyle.removeProperty('transition-timing-function')
    }
  }, [])

  // Skip rendering theme elements until mounted client-side
  if (!mounted) {
    // Return children without theme provider during SSR
    return <>{children}</>
  }

  return (
    <NextThemesProvider 
      {...props} 
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
