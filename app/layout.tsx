import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { AuthProvider } from "@/lib/auth-context"
import { SessionProvider } from "@/lib/session-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Weekly Leadership Update",
  description: "Track and share your team's progress and achievements",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} no-transitions`} suppressHydrationWarning={true}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <AuthProvider>
              <div className="relative min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1 max-w-7xl w-full mx-auto">{children}</main>
                <Toaster />
              </div>
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
