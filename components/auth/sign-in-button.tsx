'use client'

import { SignInButton as ClerkSignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function SignInButton() {
  return (
    <ClerkSignInButton>
      <Button variant="default">
        Sign In
      </Button>
    </ClerkSignInButton>
  )
}
