'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { SignInButton, SignUpButton, UserButton } from '@/components/auth'
import { TodoList } from '@/components/todo-list'

export default function Home() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Flowday</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0]}
                </span>
                <UserButton />
              </div>
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
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Welcome to Flowday
                </h2>
                <p className="text-lg text-muted-foreground">
                  Your personal daily task scheduler
                </p>
              </div>
              
              <div className="bg-card rounded-lg border p-6 sm:p-8 space-y-4">
                <h3 className="text-xl sm:text-2xl font-semibold">Get Started</h3>
                <p className="text-muted-foreground">
                  Sign in to access your personalized task dashboard and start organizing your day
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2">
                  <SignInButton />
                  <SignUpButton />
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Manage your daily tasks</p>
                <p>Track meal preparation</p>
                <p>Stay organized with smart scheduling</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
