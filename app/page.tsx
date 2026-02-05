'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { SignInButton, SignUpButton } from '@/components/auth'
import { TodoList } from '@/components/todo-list'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'

export default function Home() {
  const { isSignedIn, isLoaded, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { user } = useUser()
  const displayName =
    user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Account'

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header Skeleton */}
          <header className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-24" />
            <div className="flex items-center gap-2 sm:gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </header>

          {/* Main Content Skeleton */}
          <main>
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto" />
              </div>
              
              <div className="bg-card rounded-lg border p-6 sm:p-8 space-y-4">
                <Skeleton className="h-8 w-32 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Flowday</p>
            <h1 className="text-3xl sm:text-4xl font-semibold">Daily focus</h1>
            <p className="text-sm text-muted-foreground">Minimal, but never empty.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                    Theme
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={theme ?? 'system'}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem value="light" className="cursor-pointer">
                      <Sun className="h-4 w-4" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                      <Moon className="h-4 w-4" />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system" className="cursor-pointer">
                      <Monitor className="h-4 w-4" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <SignInButton />
                <SignUpButton />
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
          {isSignedIn ? (
            <TodoList />
          ) : (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  A gentle rhythm for your day
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold">
                  Flowday turns busy into balanced
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Plan tasks, meals, and routines in one calm space. Keep focus without
                  the noise.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-left">
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-semibold">Flow first</h4>
                  <p className="text-sm text-muted-foreground">
                    Capture tasks fast, then shape a realistic flow for the day.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-semibold">Meals included</h4>
                  <p className="text-sm text-muted-foreground">
                    Tie prep and recipes to your schedule so food feels effortless.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-semibold">Habit gentle</h4>
                  <p className="text-sm text-muted-foreground">
                    Small routines, steady progress, and space to breathe.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
