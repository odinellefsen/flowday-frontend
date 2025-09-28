'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { SignInButton, SignUpButton, UserButton } from '@/components/auth'

export default function Home() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">FlowDay</h1>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
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
        <main className="text-center">
          {isSignedIn ? (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to your FlowDay Dashboard! 🎉
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You&apos;re successfully authenticated with Clerk.js
              </p>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Your Profile Info:</h3>
                <div className="text-left space-y-2">
                  <p><strong>Name:</strong> {user?.fullName || 'Not provided'}</p>
                  <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
                  <p><strong>User ID:</strong> {user?.id}</p>
                  <p><strong>Last Sign In:</strong> {user?.lastSignInAt?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to FlowDay
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                A modern Next.js application with Clerk.js authentication
              </p>
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-semibold mb-4">Get Started</h3>
                <p className="text-gray-600 mb-6">
                  Sign in or create an account to access your personalized dashboard
                </p>
                <div className="flex justify-center gap-4">
                  <SignInButton />
                  <SignUpButton />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
