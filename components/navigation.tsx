"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (pathname === "/login") return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-10">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Weekly Leadership Update</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              Add Weekly Update
            </Link>
            <Link
              href="/history"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/history" ? "text-foreground font-medium" : "text-foreground/60"
              }`}
            >
              View Weekly Updates History
            </Link>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{user.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
