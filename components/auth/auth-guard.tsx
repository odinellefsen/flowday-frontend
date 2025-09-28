'use client'

import { useAuth } from '@clerk/nextjs'
import { SignInButton } from './sign-in-button'
import { SignUpButton } from './sign-up-button'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-2xl font-bold">Welcome to FlowDay</h1>
          <p className="text-gray-600">Please sign in to continue</p>
          <div className="flex gap-2">
            <SignInButton />
            <SignUpButton />
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
