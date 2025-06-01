"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./print-styles.css"

const inter = Inter({ subsets: ["latin"] })

// Add print-specific styles to hide the navigation
const printStyles = `
  @media print {
    header, nav, .navigation {
      display: none !important;
    }
    body {
      padding: 0 !important;
      margin: 0 !important;
    }
  }
`

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="print-layout">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      {children}
      <Toaster />
    </div>
  )
}