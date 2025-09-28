'use client'

import { SignUpButton as ClerkSignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function SignUpButton() {
  return (
    <ClerkSignUpButton>
      <Button variant="outline">
        Sign Up
      </Button>
    </ClerkSignUpButton>
  )
}
